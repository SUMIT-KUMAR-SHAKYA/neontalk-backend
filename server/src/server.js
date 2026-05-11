require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const { app, allowedOrigins } = require('./app');
const connectDB = require('./config/db');
const initializeSocket = require('./socket/index');

// ─── Initialize Server ────────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Socket.io Config ────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// ─── Connect to DB and Initialize Socket Handlers ─────────────────────────────
connectDB();
initializeSocket(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Neontalk signaling server on port ${PORT}`));
