let ioInstance = null;

function setupSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    // Join admin room for live monitoring
    socket.on('join-admin', (examId) => {
      socket.join(`admin-${examId}`);
    });
    // Recruiter or student can join their own room if needed
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
    });
    // Listen for violation events (for demonstration)
    io.on('violation', (data) => {
      io.to(`admin-${data.examId}`).emit('alert', data);
    });
  });
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
}

module.exports = { setupSocket, getIO }; 