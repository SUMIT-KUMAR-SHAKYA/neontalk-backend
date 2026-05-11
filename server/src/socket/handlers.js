const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Session = require('../models/Session');
const ICE_SERVERS = require('../config/ice');
const { queue, activeUsers } = require('./state');

// Map to track timers for each socket to avoid memory leaks
const socketTimers = new Map();

function resetIdleTimeout(socket) {
  if (socketTimers.has(socket.id)) {
    clearTimeout(socketTimers.get(socket.id));
  }

  const timer = setTimeout(() => {
    console.log(`⏱️ Dropping idle socket ${socket.id}`);
    socket.disconnect();
  }, 10 * 60 * 1000); // 10 minutes

  socketTimers.set(socket.id, timer);
}

function clearIdleTimeout(socketId) {
  if (socketTimers.has(socketId)) {
    clearTimeout(socketTimers.get(socketId));
    socketTimers.delete(socketId);
  }
}

function tryMatch(io) {
  // Use while loop instead of recursion to prevent call stack issues
  while (queue.length >= 2) {
    const idA = queue.shift();
    const idB = queue.shift();
    const socketA = io.sockets.sockets.get(idA);
    const socketB = io.sockets.sockets.get(idB);

    if (!socketA || !socketB) {
      if (socketA) queue.push(idA);
      if (socketB) queue.push(idB);
      continue;
    }

    const roomId = `room_${uuidv4()}`;
    const now = new Date();

    socketA.join(roomId);
    socketB.join(roomId);

    activeUsers.set(idA, { roomId, partnerId: idB, startedAt: now, consentGiven: false });
    activeUsers.set(idB, { roomId, partnerId: idA, startedAt: now, consentGiven: false });

    io.to(idA).emit('matched', { role: 'caller', sessionId: roomId, iceServers: ICE_SERVERS });
    io.to(idB).emit('matched', { role: 'callee', sessionId: roomId, iceServers: ICE_SERVERS });

    if (mongoose.connection.readyState === 1) {
      Session.create({ sessionId: roomId, peerA: idA, peerB: idB, startedAt: now })
        .catch(err => console.error("DB write error:", err.message));
    }

    console.log(`🔗 Matched ${idA} ↔ ${idB} [Room: ${roomId}]`);
  }
}

async function handleDisconnect(io, socketId, reason = 'disconnect') {
  clearIdleTimeout(socketId);
  
  const user = activeUsers.get(socketId);
  if (user) {
    const { roomId, partnerId, startedAt } = user;
    const endedAt = new Date();
    const durationSeconds = Math.round((endedAt - startedAt) / 1000);

    activeUsers.delete(socketId);
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.leave(roomId);

    activeUsers.delete(partnerId);
    const partnerSocket = io.sockets.sockets.get(partnerId);

    if (partnerSocket) {
      partnerSocket.leave(roomId);
      io.to(partnerId).emit('partner-left', { reason });
      if (!queue.includes(partnerId)) {
        queue.push(partnerId);
        io.to(partnerId).emit('waiting');
      }
      tryMatch(io);
    }

    if (mongoose.connection.readyState === 1) {
      Session.findOneAndUpdate(
        { sessionId: roomId },
        { endedAt, durationSeconds }
      ).catch(err => console.error("DB update error:", err.message));
    }

    console.log(`🔌 Room ${roomId} closed (${reason}, ${durationSeconds}s)`);
  } else {
    const idx = queue.indexOf(socketId);
    if (idx !== -1) queue.splice(idx, 1);
  }
}

module.exports = {
  resetIdleTimeout,
  clearIdleTimeout,
  tryMatch,
  handleDisconnect
};
