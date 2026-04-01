// db/database.js — SQLite setup with better-sqlite3

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'portfolio.db');

function initDB() {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // ── MESSAGES TABLE ─────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      subject     TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now', 'localtime')),
      is_read     INTEGER DEFAULT 0
    );
  `);

  // ── PROJECTS TABLE ──────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      tags        TEXT    NOT NULL,   -- JSON array stored as string
      live_url    TEXT,
      github_url  TEXT,
      image_url   TEXT,
      featured    INTEGER DEFAULT 0,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ── SEED PROJECTS (only if table is empty) ─────────────────────────────────
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get();
  if (count.c === 0) {
    const insert = db.prepare(`
      INSERT INTO projects (title, description, tags, live_url, github_url, image_url, featured, sort_order)
      VALUES (@title, @description, @tags, @live_url, @github_url, @image_url, @featured, @sort_order)
    `);

    const seedProjects = [
      {
        title: 'NightOwl — E-Commerce UI',
        description: 'A dark-mode fashion storefront built with vanilla JS and CSS Grid. Features cart persistence, product filtering, and smooth page transitions.',
        tags: JSON.stringify(['HTML', 'CSS', 'JavaScript']),
        live_url: '#',
        github_url: 'https://github.com/25bcya39-ctrl',
        image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
        featured: 1,
        sort_order: 1
      },
      {
        title: 'DataPulse — Analytics Dashboard',
        description: 'Real-time analytics dashboard with Pandas + Chart.js. Displays CSV data with interactive graphs and export capabilities.',
        tags: JSON.stringify(['Python', 'Pandas', 'Chart.js']),
        live_url: '#',
        github_url: 'https://github.com/25bcya39-ctrl',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
        featured: 1,
        sort_order: 2
      },
      {
        title: 'Portfolio v1 — Personal Site',
        description: 'First iteration of this portfolio. Built with pure HTML, CSS, and JavaScript. Now evolved into the site you are viewing.',
        tags: JSON.stringify(['HTML', 'CSS', 'JavaScript']),
        live_url: '#',
        github_url: 'https://github.com/25bcya39-ctrl',
        image_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',
        featured: 0,
        sort_order: 3
      },
      {
        title: 'NodeMail — REST API',
        description: 'A lightweight Node.js + Express REST API for transactional email queuing with SQLite persistence and retry logic.',
        tags: JSON.stringify(['Node.js', 'Express', 'SQLite']),
        live_url: null,
        github_url: 'https://github.com/25bcya39-ctrl',
        image_url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',
        featured: 0,
        sort_order: 4
      }
    ];

    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(row);
    });
    insertMany(seedProjects);
    console.log('✅  Database seeded with sample projects.');
  }

  return db;
}

module.exports = initDB;
