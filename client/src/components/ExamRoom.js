import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthProvider';
import { useProctoring } from '../hooks/useProctoring';
import { FiAlertTriangle, FiEye, FiEyeOff, FiCamera, FiMonitor, FiCheck, FiX } from 'react-icons/fi';

const ExamRoom = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [isStarted, setIsStarted] = useState(false);
  const [violations, setViolations] = useState([]);

  const {
    webcamRef,
    screenRef,
    isRecording,
    violations: proctoringViolations,
    tabSwitchCount,
    startRecording,
    stopRecording
  } = useProctoring({
    examId,
    onViolation: (violation) => {
      setViolations(prev => [...prev, violation]);
      alert(`Violation detected: ${violation.type}`);
    }
  });

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    loadExam();
  }, [user, navigate]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, timeLeft]);

  const loadExam = async () => {
    try {
      const response = await axios.get(`/api/exam/${examId}`);
      setExam(response.data.exam);
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Error loading exam');
    }
  };

  const startExam = async () => {
    try {
      const response = await axios.post('/api/exam/start');
      setExam(response.data.exam);
      setIsStarted(true);
      startRecording();
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error starting exam');
    }
  };

  const submitAnswer = async (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    try {
      await axios.post(`/api/exam/${examId}/answer`, {
        questionId,
        answer
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const submitExam = async () => {
    try {
      await axios.post(`/api/exam/${examId}/complete`);
      stopRecording();
      alert('Exam submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error submitting exam');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam && !isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Exam?</h2>
          <p className="text-gray-600 mb-6">
            This exam will be proctored with webcam and screen recording. 
            Please ensure you have a quiet environment and stable internet connection.
          </p>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <FiCamera className="mr-2" />
              Webcam will be activated
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiMonitor className="mr-2" />
              Screen sharing will be enabled
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiAlertTriangle className="mr-2" />
              Tab switching is monitored
            </div>
          </div>
          <button
            onClick={startExam}
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Exam in Progress</h1>
              <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {exam.questions.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Proctoring Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isRecording ? 'Recording' : 'Not Recording'}
                </span>
              </div>
              
              {/* Tab Switch Counter */}
              {tabSwitchCount > 0 && (
                <div className="flex items-center text-orange-600">
                  <FiAlertTriangle className="mr-1" />
                  <span className="text-sm">Tab switches: {tabSwitchCount}/3</span>
                </div>
              )}
              
              {/* Timer */}
              <div className="text-lg font-mono text-gray-900">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Exam Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Question */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Question {currentQuestion + 1}
                </h2>
                <p className="text-gray-700 text-lg mb-6">{currentQ.question}</p>
                
                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) => submitAnswer(currentQuestion, e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full mr-3">
                        {answers[currentQuestion] === option && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-2">
                  {exam.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-8 h-8 rounded-full text-sm font-medium ${
                        index === currentQuestion
                          ? 'bg-blue-600 text-white'
                          : answers[index]
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                  disabled={currentQuestion === exam.questions.length - 1}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              {/* Submit Button */}
              {currentQuestion === exam.questions.length - 1 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={submitExam}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Submit Exam
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Proctoring Panel */}
          <div className="space-y-6">
            {/* Webcam */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiCamera className="mr-2" />
                Webcam
              </h3>
              <video
                ref={webcamRef}
                autoPlay
                muted
                className="w-full h-48 bg-gray-100 rounded-md object-cover"
              />
            </div>

            {/* Screen Share */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMonitor className="mr-2" />
                Screen Share
              </h3>
              <video
                ref={screenRef}
                autoPlay
                muted
                className="w-full h-48 bg-gray-100 rounded-md object-cover"
              />
            </div>

            {/* Violations */}
            {violations.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                  <FiAlertTriangle className="mr-2" />
                  Violations ({violations.length})
                </h3>
                <div className="space-y-2">
                  {violations.slice(-3).map((violation, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {violation.type} - {new Date(violation.timestamp).toLocaleTimeString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRoom; 