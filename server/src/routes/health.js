const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { queue, activeUsers } = require('../socket/state');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    queueSize: queue.length,
    activeSessions: activeUsers.size / 2,
    dbConnected: mongoose.connection.readyState === 1
  });
});

module.exports = router;
