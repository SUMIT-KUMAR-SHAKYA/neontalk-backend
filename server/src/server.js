require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

// 1. Ensure 'app' is imported correctly
const { app, allowedOrigins } = require('./app');
const connectDB = require('./config/db');
const initializeSocket = require('./socket/index');
const mongoose = require('mongoose');
const Session = require('./models/Session');

const server = http.createServer(app);

// ... baaki socket config ...

// 2. Health Route (Ab 'app' define ho chuka hai upar)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
    time: new Date().toISOString()
  });
});

// 3. Test DB Route
app.get("/test-db", async (req, res) => {
  try {
    const testEntry = await Session.create({
      userId: "test_user_sumit",
      socketId: "test_socket_123",
      consent: true
    });
    res.json({ success: true, data: testEntry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ... baaki server.listen code ...