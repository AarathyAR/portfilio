const express = require('express');
const router  = express.Router();

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, email, subject, message } = req.body;
  const errors = [];
  if (!name    || name.trim().length    < 2)  errors.push('Name must be at least 2 characters.');
  if (!email   || !isValidEmail(email))        errors.push('Valid email required.');
  if (!subject || subject.trim().length < 3)  errors.push('Subject too short.');
  if (!message || message.trim().length < 10) errors.push('Message too short.');
  if (errors.length) return res.status(400).json({ success: false, errors });

  db.run(
    `INSERT INTO messages (name,email,subject,message) VALUES (?,?,?,?)`,
    [name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim()],
    function(err) {
      if (err) return res.status(500).json({ success: false, errors: ['Server error.'] });
      res.status(201).json({ success: true, message: "Message received! I'll get back to you soon.", id: this.lastID });
    }
  );
});

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  if (req.headers['x-admin-token'] !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026'))
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  db.all(`SELECT * FROM messages ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: rows, total: rows.length });
  });
});

router.patch('/:id/read', (req, res) => {
  const db = req.app.locals.db;
  if (req.headers['x-admin-token'] !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026'))
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  db.run(`UPDATE messages SET is_read=1 WHERE id=?`, [req.params.id], () => res.json({ success: true }));
});

module.exports = router;
