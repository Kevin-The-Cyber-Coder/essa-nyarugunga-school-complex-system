const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      socket.userId   = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Connected:', socket.userId);
    socket.join(socket.userId);

    socket.on('join', (userId) => { if (userId) socket.join(userId); });
    socket.on('sendMessage', (data) => { io.to(data.receiverId).emit('newMessage', data); });
    socket.on('typing', ({ recipientId, isTyping }) => {
      socket.to(recipientId).emit('user_typing', { userId: socket.userId, isTyping });
    });
    socket.on('mark_read', ({ messageId, senderId }) => {
      socket.to(senderId).emit('message_read', { messageId });
    });
    socket.on('disconnect', () => { console.log('🔌 Disconnected:', socket.userId); });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };