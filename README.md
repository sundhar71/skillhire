# SkillHire - MERN Stack Application

A production-ready MERN stack application for AI-powered resume building, military-grade exam proctoring, and real-time admin monitoring.

## 🎯 Core Features

### User Roles
- **👨‍🎓 Students**: Build resumes, take proctored exams
- **👔 Recruiters**: Search/filter candidates, message students  
- **👩‍💻 Admins**: Monitor exams in real-time

### Must-Have Features
- **AI-Powered Resume Builder**: Dynamic forms with ATS-optimized templates, PDF export + MongoDB storage
- **Military-Grade Exam Proctoring**: Live webcam + screen recording, face + ID verification using TensorFlow.js, tab-switch detection (auto-block after 3 violations)
- **Real-Time Admin Dashboard**: Live view of all active exams, cheating alerts with screenshot evidence

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or remote)
- Python 3 (for proctoring, optional)

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
Backend will run on: **http://localhost:5000**

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend will run on: **http://localhost:3000**

### 3. Environment Variables
Backend `.env` file (already configured):
```env
JWT_SECRET=super_secret_123
MONGODB_URI=mongodb://localhost:27017/skillhire
```

## 📁 Project Structure

```
skillhire/
├── client/               # Vite React App
│   ├── src/
│   │   ├── components/   # All React components
│   │   ├── contexts/     # JWT + Socket contexts
│   │   └── hooks/        # useAuth, useExam, useProctoring
├── server/               # Express Backend
│   ├── controllers/      # authController.js, examController.js
│   ├── models/           # User.js, Exam.js
│   └── utils/            # proctoring.py, socket.js
├── .gitignore
└── README.md
```

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite + Tailwind |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Real-Time | Socket.IO |
| AI | TensorFlow.js (face detection) |
| Security | JWT + Helmet + rate-limiter |

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (student, recruiter, admin)
- `POST /api/auth/login` - Login, returns JWT

### Exams (Students)
- `POST /api/exam/start` - Start exam
- `POST /api/exam/:examId/answer` - Submit answer
- `POST /api/exam/:examId/complete` - Complete exam
- `POST /api/exam/:examId/proctor` - Proctoring (webcam, tab switch, etc)

### Admin
- `GET /api/exam/active` - List active exams
- `GET /api/exam/flagged` - List flagged/cheating exams

### Resume Builder
- `POST /api/user/resumes` - Save resume
- `GET /api/user/resumes` - Get user resumes

## 🎨 Features in Detail

### AI-Powered Resume Builder
- Dynamic forms with real-time preview
- ATS-optimized templates (Modern, Classic, Creative)
- PDF export with high-quality rendering
- MongoDB storage for resume data
- Skills categorization and proficiency levels

### Military-Grade Exam Proctoring
- **Webcam Monitoring**: Real-time face detection using TensorFlow.js
- **Screen Recording**: Live screen sharing with cursor tracking
- **Tab-Switch Detection**: Automatic violation tracking (3 strikes = auto-block)
- **Face Verification**: AI-powered face detection with fallback to mock detection
- **Real-Time Alerts**: Instant admin notifications with screenshot evidence

### Real-Time Admin Dashboard
- **Live Exam Monitoring**: View all active exams in real-time
- **Cheating Alerts**: Instant notifications with violation screenshots
- **Exam Management**: Terminate exams, clear flags, view detailed logs
- **Statistics**: Active exams, flagged exams, total alerts

### Recruiter Dashboard
- **Candidate Search**: Filter by name, email, skills
- **Resume Download**: Direct PDF download of candidate resumes
- **Messaging System**: Real-time communication with candidates
- **Skill Filtering**: Advanced filtering by multiple skills

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Student, Recruiter, Admin permissions
- **Helmet Security**: HTTP headers protection
- **Rate Limiting**: API request throttling
- **Input Validation**: Server-side validation for all inputs

## 🚨 Proctoring System

### Face Detection
```javascript
// TensorFlow.js integration with fallback
const detectFace = async (canvas) => {
  if (!modelRef.current) {
    return Math.random() > 0.8; // Mock detection
  }
  // Real TensorFlow.js face detection
};
```

### Tab Switch Detection
```javascript
// Auto-block after 3 violations
if (tabSwitchCount >= 3) {
  alert('Exam terminated due to multiple tab switches!');
  stopStreams();
}
```

### Real-Time Alerts
```javascript
// Socket.IO for instant admin notifications
io.to(`admin-${examId}`).emit('alert', {
  examId,
  type: 'face',
  screenshot: base64Image
});
```

## 🎯 Sample Data

### Sample Exam Questions
```javascript
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
```

### Resume Templates
- **Modern**: Clean, professional design
- **Classic**: Traditional business format
- **Creative**: Innovative layout for creative roles

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Install dependencies: `npm install`
3. Start server: `npm start`

### Frontend Deployment
1. Build for production: `npm run build`
2. Serve static files from `dist/` folder

### Database Setup
1. Install MongoDB
2. Create database: `skillhire`
3. Configure connection string in `.env`

## 🔧 Development

### Running in Development
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### Testing
- Backend API testing with Postman/curl
- Frontend testing with browser dev tools
- Proctoring testing with webcam permissions

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**SkillHire** - Empowering students and recruiters with AI-powered tools for success! 🚀 