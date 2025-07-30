# SkillHire Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` in `server/` (already provided):
   ```env
   JWT_SECRET=super_secret_123
   MONGODB_URI=mongodb://localhost:27017/skillhire
   ```
3. Start server:
   ```bash
   npm run dev
   # or
   npm start
   ```

## API Overview
- `POST /api/auth/register` — Register user (student, recruiter, admin)
- `POST /api/auth/login` — Login, returns JWT
- `POST /api/exam/start` — Start exam (student)
- `POST /api/exam/:examId/answer` — Submit answer
- `POST /api/exam/:examId/complete` — Complete exam
- `POST /api/exam/:examId/proctor` — Proctoring (webcam, tab switch, etc)
- `GET /api/exam/active` — List active exams (admin)
- `GET /api/exam/flagged` — List flagged/cheating exams (admin)

## Real-Time
- Socket.IO for live admin alerts (see `server/utils/socket.js`) 