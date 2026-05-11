 require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Paths check karo: Kya app.js aur models sahi jagah hain?
const { app, allowedOrigins } = require('./app'); 
const connectDB = require('./config/db');
const initializeSocket = require('./socket/index');
const Session = require('./models/Session');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Socket.io Config
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// Routes - Inhe server.listen se PEHLE hona chahiye
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
    time: new Date().toISOString()
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const testEntry = await Session.create({
      userId: "test_user_" + Date.now(),
      socketId: "test_socket_123",
      consent: true
    });
    res.json({ success: true, message: "DB Entry Created!", data: testEntry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Connections
connectDB();
initializeSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Neontalk signaling server on port ${PORT}`);
});