import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthProvider';
import { FiSearch, FiMessageSquare, FiEye, FiDownload, FiFilter, FiUser, FiMail, FiPhone, FiMapPin, FiX } from 'react-icons/fi';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      return;
    }

    loadCandidates();
    loadMessages();
  }, [user]);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, selectedSkills]);

  const loadCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates');
      setCandidates(response.data.candidates || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    // Search by name, email, or skills
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills?.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(candidate =>
        selectedSkills.every(skill =>
          candidate.skills?.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFilteredCandidates(filtered);
  };

  const sendMessage = async (candidateId) => {
    if (!newMessage.trim()) return;

    try {
      await axios.post('/api/messages', {
        to: candidateId,
        content: newMessage
      });
      
      setNewMessage('');
      loadMessages();
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const downloadResume = async (candidateId) => {
    try {
      const response = await axios.get(`/api/candidates/${candidateId}/resume`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${candidateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  const availableSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
    'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning',
    'Data Science', 'UI/UX', 'DevOps', 'Agile', 'Scrum'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-sm text-gray-600">Find and connect with talented candidates</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiUser className="text-blue-600" />
                <span className="text-sm text-gray-600">
                  {filteredCandidates.length} Candidates
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search and Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiSearch className="mr-2" />
                Search & Filters
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Candidates
                </label>
                <input
                  type="text"
                  placeholder="Name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Skills Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Skills
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSkills.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills(prev => [...prev, skill]);
                          } else {
                            setSelectedSkills(prev => prev.filter(s => s !== skill));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedSkills.length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSkills([]);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Candidates List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Candidates ({filteredCandidates.length})
                </h2>
              </div>
              <div className="p-6">
                {filteredCandidates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No candidates found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredCandidates.map((candidate) => (
                      <div key={candidate._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="flex items-center text-xs text-gray-500">
                                <FiMapPin className="mr-1" />
                                {candidate.location || 'Location not specified'}
                              </span>
                              <span className="flex items-center text-xs text-gray-500">
                                <FiUser className="mr-1" />
                                {candidate.resumes?.length || 0} resumes
                              </span>
                            </div>
                            {candidate.skills && candidate.skills.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {candidate.skills.slice(0, 5).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.skills.length > 5 && (
                                    <span className="text-xs text-gray-500">
                                      +{candidate.skills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedCandidate(candidate)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <FiEye className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => downloadResume(candidate._id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <FiDownload className="mr-1" />
                              Resume
                            </button>
                            <button
                              onClick={() => setSelectedCandidate({ ...candidate, showMessage: true })}
                              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                              <FiMessageSquare className="mr-1" />
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiMessageSquare className="mr-2" />
                  Recent Messages
                </h3>
              </div>
              <div className="p-4">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No messages</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((message) => (
                      <div key={message._id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {message.from?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(message.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCandidate.showMessage ? 'Send Message' : 'Candidate Details'}
                </h3>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedCandidate.showMessage ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Send message to {selectedCandidate.name}
                  </h4>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setSelectedCandidate(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendMessage(selectedCandidate._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedCandidate.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedCandidate.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">{selectedCandidate.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
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

export default RecruiterDashboard; 