import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { SocketProvider } from './contexts/SocketProvider';
import { useAuth } from './contexts/AuthProvider';
import ResumeBuilder from './components/ResumeBuilder';
import ExamRoom from './components/ExamRoom';
import AdminDashboard from './components/AdminDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import TestApp from './TestApp';
import { FiUser, FiLogOut, FiHome, FiFileText, FiUsers, FiSettings } from 'react-icons/fi';

// Simple Test Component
const TestComponent = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">SkillHire</h1>
        <p className="text-gray-600 mb-6">Your MERN Stack Application is Running!</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Frontend: React 18 + Vite + Tailwind</p>
          <p>✅ Backend: Node.js + Express + MongoDB</p>
          <p>✅ Real-time: Socket.IO</p>
          <p>✅ Security: JWT + Helmet</p>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => alert('SkillHire is working!')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData.name, formData.email, formData.password, formData.role);
    
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isLogin ? 'Login to SkillHire' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          {!isLogin && (
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>
          )}
          
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
  };

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'student':
        return activeTab === 'resume' ? <ResumeBuilder /> : <div>Student Dashboard</div>;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Dashboard</div>;
    }
  };

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: FiHome },
          { id: 'resume', label: 'Resume Builder', icon: FiFileText },
          { id: 'exams', label: 'Take Exams', icon: FiFileText }
        ];
      case 'recruiter':
        return [
          { id: 'dashboard', label: 'Candidates', icon: FiUsers },
          { id: 'messages', label: 'Messages', icon: FiFileText }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: FiSettings },
          { id: 'exams', label: 'Exam Monitoring', icon: FiFileText }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">SkillHire</h1>
              <div className="flex space-x-4">
                {getNavigationItems().map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiUser className="text-gray-600" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className="text-xs text-gray-500">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Main App Component
const App = () => {
  // Temporarily use simple test component to debug
  if (window.location.pathname === '/simple-test') {
    return <TestApp />;
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/test" element={<TestComponent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/exam/:examId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamRoom />
              </ProtectedRoute>
            } />
            <Route path="/simple-test" element={<TestApp />} />
            <Route path="/" element={<Navigate to="/test" />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
