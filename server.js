// server.js — Aarathy AR Portfolio Backend

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');
const initDB     = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Database ───────────────────────────────────────────────────────────────
const db = initDB();
app.locals.db = db;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting for contact form (max 5 submissions / 15 min per IP)
const contactLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 5,
  message  : { success: false, errors: ['Too many messages sent. Please wait 15 minutes.'] }
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/messages', contactLimiter, require('./routes/messages'));
app.use('/api/projects',                require('./routes/projects'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// All other routes → serve index.html (SPA fallback)
app.get('*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Server running at http://localhost:${PORT}`);
  console.log(`📂  Serving frontend from /public`);
  console.log(`🗄️   SQLite database at /db/portfolio.db\n`);
});
