const mongoose = require('mongoose');
const Session = require('../models/Session');
const { queue, activeUsers } = require('./state');
const { resetIdleTimeout, clearIdleTimeout, tryMatch, handleDisconnect } = require('./handlers');

module.exports = function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`➕ Connected: ${socket.id}`);
    resetIdleTimeout(socket);

    socket.on('join-queue', () => {
      resetIdleTimeout(socket);
      if (activeUsers.has(socket.id)) return;
      if (!queue.includes(socket.id)) {
        queue.push(socket.id);
        socket.emit('waiting');
      }
      tryMatch(io);
    });

    socket.on('offer', ({ offer }) => {
      resetIdleTimeout(socket);
      const user = activeUsers.get(socket.id);
      if (user) socket.to(user.roomId).emit('offer', { offer });
    });

    socket.on('answer', ({ answer }) => {
      resetIdleTimeout(socket);
      const user = activeUsers.get(socket.id);
      if (user) socket.to(user.roomId).emit('answer', { answer });
    });

    socket.on('ice-candidate', ({ candidate }) => {
      resetIdleTimeout(socket);
      const user = activeUsers.get(socket.id);
      if (user) socket.to(user.roomId).emit('ice-candidate', { candidate });
    });

    socket.on('consent-given', () => {
      resetIdleTimeout(socket);
      const user = activeUsers.get(socket.id);
      if (!user) return;
      user.consentGiven = true;
      socket.to(user.roomId).emit('partner-consent');

      const partner = activeUsers.get(user.partnerId);
      if (partner?.consentGiven && mongoose.connection.readyState === 1) {
        Session.findOneAndUpdate(
          { sessionId: user.roomId },
          { consentA: true, consentB: true, recordingRequested: true }
        ).catch(err => console.error("DB consent update error:", err.message));
      }
    });

    socket.on('next', async () => {
      resetIdleTimeout(socket);
      await handleDisconnect(io, socket.id, 'next');
      if (!queue.includes(socket.id)) queue.push(socket.id);
      socket.emit('waiting');
      tryMatch(io);
    });

    socket.on('disconnect', async () => {
      console.log(`➖ Disconnected: ${socket.id}`);
      await handleDisconnect(io, socket.id, 'disconnect');
    });
  });
};
