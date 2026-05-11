const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  socketId: { type: String, required: true },
  connectedAt: { type: Date, default: Date.now },
  disconnectedAt: { type: Date },
  consent: { type: Boolean, default: false },
  metadata: {
    ip: String,
    userAgent: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);