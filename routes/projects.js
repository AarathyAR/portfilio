// routes/projects.js — Project gallery endpoints

const express = require('express');
const router  = express.Router();

// GET /api/projects — Fetch all projects (optional ?featured=1)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { featured } = req.query;

  let sql  = 'SELECT * FROM projects';
  const params = [];

  if (featured === '1') {
    sql += ' WHERE featured = 1';
  }
  sql += ' ORDER BY sort_order ASC';

  const rows = db.prepare(sql).all(...params);

  // Parse tags JSON back to array
  const projects = rows.map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]')
  }));

  return res.json({ success: true, data: projects, total: projects.length });
});

// GET /api/projects/:id — Single project
router.get('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);

  if (!row) return res.status(404).json({ success: false, errors: ['Project not found.'] });

  return res.json({ success: true, data: { ...row, tags: JSON.parse(row.tags || '[]') } });
});

// POST /api/projects — Add a project (admin only)
router.post('/', (req, res) => {
  const db    = req.app.locals.db;
  const token = req.headers['x-admin-token'];

  if (token !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026')) {
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  }

  const { title, description, tags, live_url, github_url, image_url, featured, sort_order } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, errors: ['Title and description are required.'] });
  }

  const stmt = db.prepare(`
    INSERT INTO projects (title, description, tags, live_url, github_url, image_url, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    title, description,
    JSON.stringify(Array.isArray(tags) ? tags : []),
    live_url   || null,
    github_url || null,
    image_url  || null,
    featured   ? 1 : 0,
    sort_order || 99
  );

  return res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// DELETE /api/projects/:id — Remove a project (admin only)
router.delete('/:id', (req, res) => {
  const db    = req.app.locals.db;
  const token = req.headers['x-admin-token'];

  if (token !== (process.env.ADMIN_TOKEN || 'aarathy-admin-2026')) {
    return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

module.exports = router;
