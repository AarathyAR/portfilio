// routes/messages.js — Contact form endpoints

const express = require('express');
const router  = express.Router();

// Simple email validator (no external deps)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/messages — Save a contact form submission
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, email, subject, message } = req.body;

  // ── Validation ─────────────────────────────────────────────────────────────
  const errors = [];
  if (!name    || name.trim().length    < 2)  errors.push('Name must be at least 2 characters.');
  if (!email   || !isValidEmail(email))        errors.push('Please provide a valid email address.');
  if (!subject || subject.trim().length < 3)  errors.push('Subject must be at least 3 characters.');
  if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // ── Insert ─────────────────────────────────────────────────────────────────
  try {
    const stmt = db.prepare(`
      INSERT INTO messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      name.trim(),
      email.trim().toLowerCase(),
      subject.trim(),
      message.trim()
    );

    return res.status(201).json({
      success: true,
      message: "Message received! I'll get back to you soon.",
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('DB insert error:', err);
    return res.status(500).json({ success: false, errors: ['Server error. Please try again.'] });
  }
});

// GET /api/messages — Retrieve all messages (protected by simple token)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const token = req.headers['x-admin-token'];

  if (token !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026')) {
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  }

  const rows = db.prepare(`
    SELECT id, name, email, subject, message, created_at, is_read
    FROM messages
    ORDER BY created_at DESC
  `).all();

  return res.json({ success: true, data: rows, total: rows.length });
});

// PATCH /api/messages/:id/read — Mark a message as read
router.patch('/:id/read', (req, res) => {
  const db    = req.app.locals.db;
  const token = req.headers['x-admin-token'];

  if (token !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026')) {
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  }

  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

module.exports = router;
