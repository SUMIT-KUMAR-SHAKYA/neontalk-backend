const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    peerA: { type: String }, // socket ID
    peerB: { type: String }, // socket ID
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    consentA: { type: Boolean, default: false },
    consentB: { type: Boolean, default: false },
    recordingRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
