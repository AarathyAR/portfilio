const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  const db  = req.app.locals.db;
  const sql = req.query.featured === '1'
    ? `SELECT * FROM projects WHERE featured=1 ORDER BY sort_order ASC`
    : `SELECT * FROM projects ORDER BY sort_order ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: rows.map(p => ({ ...p, tags: JSON.parse(p.tags||'[]') })), total: rows.length });
  });
});

router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.get(`SELECT * FROM projects WHERE id=?`, [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ success: false, errors: ['Not found.'] });
    res.json({ success: true, data: { ...row, tags: JSON.parse(row.tags||'[]') } });
  });
});

router.post('/', (req, res) => {
  const db = req.app.locals.db;
  if (req.headers['x-admin-token'] !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026'))
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  const { title, description, tags, live_url, github_url, image_url, featured, sort_order } = req.body;
  if (!title || !description) return res.status(400).json({ success: false, errors: ['Title and description required.'] });
  db.run(
    `INSERT INTO projects (title,description,tags,live_url,github_url,image_url,featured,sort_order) VALUES (?,?,?,?,?,?,?,?)`,
    [title, description, JSON.stringify(Array.isArray(tags)?tags:[]), live_url||null, github_url||null, image_url||null, featured?1:0, sort_order||99],
    function(err) {
      if (err) return res.status(500).json({ success: false });
      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  if (req.headers['x-admin-token'] !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026'))
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  db.run(`DELETE FROM projects WHERE id=?`, [req.params.id], () => res.json({ success: true }));
});

module.exports = router;
