require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('./models/Session'); // Import model

// ... aapka purana server setup code ...

// ─── Health Check with DB Status ─────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
    time: new Date().toISOString()
  });
});

// ─── DB Connection Test Route ────────────────────────────────
app.get("/test-db", async (req, res) => {
  try {
    const testEntry = await Session.create({
      userId: "test_user_sumit",
      socketId: "test_socket_123",
      consent: true,
      metadata: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
    res.json({
      success: true,
      message: "Database entry created!",
      data: testEntry
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});