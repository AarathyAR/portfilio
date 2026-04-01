// db/database.js — SQLite setup using sqlite3 (Render-compatible)

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, 'portfolio.db');

function initDB() {
  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, email TEXT NOT NULL,
      subject TEXT NOT NULL, message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      is_read INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, description TEXT NOT NULL,
      tags TEXT NOT NULL, live_url TEXT, github_url TEXT,
      image_url TEXT, featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )`);

    db.get('SELECT COUNT(*) as c FROM projects', (err, row) => {
      if (err || row.c > 0) return;
      const stmt = db.prepare(`INSERT INTO projects
        (title,description,tags,live_url,github_url,image_url,featured,sort_order)
        VALUES (?,?,?,?,?,?,?,?)`);
      [
        ['NightOwl — E-Commerce UI','A dark-mode fashion storefront built with vanilla JS and CSS Grid.',JSON.stringify(['HTML','CSS','JavaScript']),'#','https://github.com/25bcya39-ctrl','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',1,1],
        ['DataPulse — Analytics Dashboard','Real-time analytics dashboard with Pandas + Chart.js.',JSON.stringify(['Python','Pandas','Chart.js']),'#','https://github.com/25bcya39-ctrl','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',1,2],
        ['Portfolio v1 — Personal Site','First iteration of this portfolio. Built with pure HTML, CSS, and JavaScript.',JSON.stringify(['HTML','CSS','JavaScript']),'#','https://github.com/25bcya39-ctrl','https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',0,3],
        ['NodeMail — REST API','A lightweight Node.js + Express REST API for transactional email queuing.',JSON.stringify(['Node.js','Express','SQLite']),null,'https://github.com/25bcya39-ctrl','https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',0,4]
      ].forEach(s => stmt.run(...s));
      stmt.finalize();
      console.log('✅  Database seeded.');
    });
  });

  return db;
}

module.exports = initDB;
