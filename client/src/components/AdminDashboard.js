import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthProvider';
import { useSocket } from '../contexts/SocketProvider';
import { FiAlertTriangle, FiEye, FiEyeOff, FiUsers, FiClock, FiCheckCircle, FiXCircle, FiCamera, FiMonitor } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { socket, joinAdminRoom } = useSocket();
  const [activeExams, setActiveExams] = useState([]);
  const [flaggedExams, setFlaggedExams] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    loadExams();
    
    // Socket event listeners
    if (socket) {
      socket.on('alert', handleAlert);
      
      // Join admin room for all exams
      activeExams.forEach(exam => {
        joinAdminRoom(exam._id);
      });
    }

    return () => {
      if (socket) {
        socket.off('alert', handleAlert);
      }
    };
  }, [user, socket, activeExams]);

  const loadExams = async () => {
    try {
      const [activeResponse, flaggedResponse] = await Promise.all([
        axios.get('/api/exam/active'),
        axios.get('/api/exam/flagged')
      ]);
      
      setActiveExams(activeResponse.data.exams || []);
      setFlaggedExams(flaggedResponse.data.exams || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading exams:', error);
      setLoading(false);
    }
  };

  const handleAlert = (data) => {
    const newAlert = {
      id: Date.now(),
      examId: data.examId,
      type: data.type,
      timestamp: new Date(),
      screenshot: data.screenshot,
      message: `Violation detected: ${data.type}`
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    
    // Update exam status if needed
    if (data.type === 'face' || data.type === 'tab-switch') {
      setActiveExams(prev => 
        prev.map(exam => 
          exam._id === data.examId 
            ? { ...exam, status: 'flagged' }
            : exam
        )
      );
    }
  };

  const handleExamAction = async (examId, action) => {
    try {
      if (action === 'terminate') {
        await axios.post(`/api/exam/${examId}/terminate`);
        alert('Exam terminated successfully');
      } else if (action === 'clear-flag') {
        await axios.post(`/api/exam/${examId}/clear-flag`);
        alert('Flag cleared successfully');
      }
      loadExams();
    } catch (error) {
      console.error('Error performing exam action:', error);
      alert('Error performing action');
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time exam monitoring and proctoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  {activeExams.length} Active Exams
                </span>
              </div>
              {alerts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <FiAlertTriangle className="text-red-600" />
                  <span className="text-sm text-red-600">
                    {alerts.length} Alerts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Exams */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiUsers className="mr-2" />
                  Active Exams ({activeExams.length})
                </h2>
              </div>
              <div className="p-6">
                {activeExams.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active exams</p>
                ) : (
                  <div className="space-y-4">
                    {activeExams.map((exam) => (
                      <div
                        key={exam._id}
                        className={`border rounded-lg p-4 ${
                          exam.status === 'flagged' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {exam.student?.name || 'Unknown Student'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {exam.student?.email || 'No email'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                Started: {new Date(exam.startedAt).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Questions: {exam.questions?.length || 0}
                              </span>
                              <span className="text-xs text-gray-500">
                                Answered: {exam.answers?.length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {exam.status === 'flagged' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FiAlertTriangle className="mr-1" />
                                Flagged
                              </span>
                            )}
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <FiEye className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleExamAction(exam._id, 'terminate')}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Terminate
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Flagged Exams */}
            {flaggedExams.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-red-600 flex items-center">
                    <FiAlertTriangle className="mr-2" />
                    Flagged Exams ({flaggedExams.length})
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {flaggedExams.map((exam) => (
                      <div key={exam._id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {exam.student?.name || 'Unknown Student'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {exam.student?.email || 'No email'}
                            </p>
                            <div className="mt-2">
                              <p className="text-sm text-red-600">
                                Violations: {exam.proctoringLogs?.length || 0}
                              </p>
                              {exam.proctoringLogs?.slice(-3).map((log, index) => (
                                <p key={index} className="text-xs text-red-600">
                                  {log.type} - {new Date(log.timestamp).toLocaleString()}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <FiEye className="mr-1" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleExamAction(exam._id, 'clear-flag')}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Clear Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alerts Panel */}
          <div className="space-y-6">
            {/* Real-time Alerts */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiAlertTriangle className="mr-2" />
                  Live Alerts ({alerts.length})
                </h3>
              </div>
              <div className="p-4">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No alerts</p>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">
                              {alert.message}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX />
                          </button>
                        </div>
                        {alert.screenshot && (
                          <div className="mt-2">
                            <img
                              src={alert.screenshot}
                              alt="Violation screenshot"
                              className="w-full h-32 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Exams</span>
                  <span className="font-semibold text-blue-600">{activeExams.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Flagged Exams</span>
                  <span className="font-semibold text-red-600">{flaggedExams.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Alerts</span>
                  <span className="font-semibold text-orange-600">{alerts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Exam Details - {selectedExam.student?.name}
                </h3>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                  <p><strong>Name:</strong> {selectedExam.student?.name}</p>
                  <p><strong>Email:</strong> {selectedExam.student?.email}</p>
                  <p><strong>Started:</strong> {new Date(selectedExam.startedAt).toLocaleString()}</p>
                  {selectedExam.completedAt && (
                    <p><strong>Completed:</strong> {new Date(selectedExam.completedAt).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exam Progress</h4>
                  <p><strong>Questions:</strong> {selectedExam.questions?.length || 0}</p>
                  <p><strong>Answered:</strong> {selectedExam.answers?.length || 0}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedExam.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedExam.status === 'flagged' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedExam.status}
                    </span>
                  </p>
                </div>
              </div>
              
              {selectedExam.proctoringLogs?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Proctoring Logs</h4>
                  <div className="space-y-2">
                    {selectedExam.proctoringLogs.map((log, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-600">{log.type}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {log.screenshot && (
                            <img
                              src={log.screenshot}
                              alt="Violation screenshot"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 