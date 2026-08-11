const jwt = require('jsonwebtoken');
const Message = require('../models/messageModel.js');

function initSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = { id: decoded.id, role: decoded.role };
      } catch (err) {
        console.warn(`[Socket.io] Invalid token on connect: ${socket.id}`);
      }
    }

    socket.on('join_event', ({ eventId }) => {
      if (!eventId) return;
      socket.join(`event_${eventId}`);
    });

    socket.on('send_announcement', async ({ eventId, text }) => {
      try {
        if (!socket.user) {
          return socket.emit('error_message', { message: 'Authentication required' });
        }
        if (socket.user.role !== 'admin') {
          return socket.emit('error_message', { message: 'Only admins can broadcast' });
        }
        if (!eventId || !text || !text.trim()) {
          return socket.emit('error_message', { message: 'eventId and text are required' });
        }

        const message = await Message.create({
          event: eventId,
          sender: socket.user.id,
          text: text.trim(),
        });

        io.to(`event_${eventId}`).emit('announcement', {
          id: message._id,
          event: eventId,
          sender: socket.user.id,
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('[Socket.io] send_announcement error:', err.message);
        socket.emit('error_message', { message: 'Could not send announcement' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = initSockets;