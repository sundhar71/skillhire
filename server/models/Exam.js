const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  screenshot: { type: String } // base64 or URL
});

const ExamSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{
    question: String,
    options: [String],
    answer: String // correct answer
  }],
  answers: [{
    questionId: Number,
    answer: String
  }],
  proctoringLogs: [ViolationSchema],
  status: { type: String, enum: ['active', 'completed', 'flagged'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Exam', ExamSchema); 