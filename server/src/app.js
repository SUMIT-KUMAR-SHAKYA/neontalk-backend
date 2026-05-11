const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const healthRoutes = require('./routes/health');

const app = express();

// Rate Limiter (Scaling Hack)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: 'Too many requests, try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/', healthRoutes);

module.exports = { app, allowedOrigins };
