const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const User = require('../models/User');
const { spawn } = require('child_process');
const { auth, requireRole } = require('./authController');
const { getIO } = require('../utils/socket');

// Sample questions for demonstration
const sampleQuestions = [
  {
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    answer: 'Paris'
  },
  {
    question: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    answer: '4'
  }
];

// Create exam (student)
router.post('/start', auth, requireRole('student'), async (req, res) => {
  try {
    const exam = await Exam.create({
      student: req.user.id,
      questions: sampleQuestions,
      answers: [],
      proctoringLogs: [],
      status: 'active'
    });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ error: 'Could not start exam' });
  }
});

// Submit answer (student)
router.post('/:examId/answer', auth, requireRole('student'), async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.student.toString() !== req.user.id) return res.status(404).json({ error: 'Exam not found' });
    exam.answers.push({ questionId, answer });
    await exam.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit answer' });
  }
});

// Complete exam (student)
router.post('/:examId/complete', auth, requireRole('student'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.student.toString() !== req.user.id) return res.status(404).json({ error: 'Exam not found' });
    exam.status = 'completed';
    exam.completedAt = new Date();
    await exam.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not complete exam' });
  }
});

// Proctoring: receive webcam stream, detect cheating
router.post('/:examId/proctor', auth, requireRole('student'), async (req, res) => {
  try {
    const { webcamStream, screenshot, violationType } = req.body;
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.student.toString() !== req.user.id) return res.status(404).json({ error: 'Exam not found' });
    // Python child process for face detection
    let violation = null;
    if (webcamStream) {
      try {
        const python = spawn('python', ['server/utils/proctoring.py', webcamStream]);
        python.stdout.on('data', (data) => {
          if (data.toString().includes('violation')) {
            violation = { type: 'face', timestamp: new Date(), screenshot };
            exam.proctoringLogs.push(violation);
            exam.status = 'flagged';
            exam.save();
            // Real-time violation alerts via Socket.IO
            const io = getIO();
            io.to(`admin-${exam._id}`).emit('alert', { examId: exam._id, type: 'face', screenshot });
          }
        });
        python.stderr.on('data', (data) => {
          // fallback: mock TensorFlow.js
          if (data.toString().includes('ModuleNotFoundError')) {
            violation = { type: 'mock-face', timestamp: new Date(), screenshot };
            exam.proctoringLogs.push(violation);
            exam.status = 'flagged';
            exam.save();
            const io = getIO();
            io.to(`admin-${exam._id}`).emit('alert', { examId: exam._id, type: 'mock-face', screenshot });
          }
        });
      } catch (e) {
        // fallback: mock TensorFlow.js
        violation = { type: 'mock-face', timestamp: new Date(), screenshot };
        exam.proctoringLogs.push(violation);
        exam.status = 'flagged';
        exam.save();
        const io = getIO();
        io.to(`admin-${exam._id}`).emit('alert', { examId: exam._id, type: 'mock-face', screenshot });
      }
    } else if (violationType) {
      // Other violation types (e.g., tab switch)
      violation = { type: violationType, timestamp: new Date(), screenshot };
      exam.proctoringLogs.push(violation);
      if (violationType === 'tab-switch') {
        // If 3+ tab switches, auto-block
        const tabSwitches = exam.proctoringLogs.filter(v => v.type === 'tab-switch').length;
        if (tabSwitches >= 3) {
          exam.status = 'flagged';
        }
      }
      exam.save();
      const io = getIO();
      io.to(`admin-${exam._id}`).emit('alert', { examId: exam._id, type: violationType, screenshot });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Proctoring failed' });
  }
});

// Admin: get all active exams
router.get('/active', auth, requireRole('admin'), async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'active' }).populate('student', 'name email');
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch exams' });
  }
});

// Admin: get flagged/cheating exams
router.get('/flagged', auth, requireRole('admin'), async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'flagged' }).populate('student', 'name email');
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch flagged exams' });
  }
});

module.exports = router; 