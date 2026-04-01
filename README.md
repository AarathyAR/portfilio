# Aarathy AR — Portfolio (Full-Stack)

A personal portfolio site with an **Node.js + Express** backend and **SQLite** database for storing contact messages and managing a dynamic project gallery.

---

## 📁 Project Structure

```
portfolio/
├── server.js              ← Express app entry point
├── package.json
├── db/
│   ├── database.js        ← SQLite init + seed data
│   └── portfolio.db       ← Auto-created on first run
├── routes/
│   ├── messages.js        ← Contact form API
│   └── projects.js        ← Project gallery API
└── public/                ← Frontend (served statically)
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or for auto-reload during development:
npm run dev
```

### 3. Open Your Portfolio
```
http://localhost:3000
```

The SQLite database (`db/portfolio.db`) is **auto-created** and **seeded** with 4 sample projects on first run.

---

## 🔌 API Endpoints

### Contact Messages

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| `POST` | `/api/messages`             | Submit a contact form message        |
| `GET`  | `/api/messages`             | View all messages *(admin only)*     |
| `PATCH`| `/api/messages/:id/read`    | Mark a message as read *(admin only)*|

**POST body example:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "subject": "Project Collaboration",
  "message": "Hi Aarathy! I'd love to work on a project together."
}
```

### Projects Gallery

| Method   | Endpoint           | Description                        |
|----------|--------------------|------------------------------------|
| `GET`    | `/api/projects`    | Fetch all projects                 |
| `GET`    | `/api/projects?featured=1` | Fetch featured projects only |
| `GET`    | `/api/projects/:id`| Fetch a single project             |
| `POST`   | `/api/projects`    | Add a project *(admin only)*       |
| `DELETE` | `/api/projects/:id`| Delete a project *(admin only)*    |

---

## 🔐 Admin Access

Admin endpoints require this header:
```
x-admin-token: aarathy-admin-2026
```

To change the token, set the `ADMIN_TOKEN` environment variable:
```bash
ADMIN_TOKEN=your-secret-token npm start
```

**View all messages (curl example):**
```bash
curl http://localhost:3000/api/messages \
  -H "x-admin-token: aarathy-admin-2026"
```

**Add a new project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "x-admin-token: aarathy-admin-2026" \
  -d '{
    "title": "My New Project",
    "description": "A cool new thing I built.",
    "tags": ["HTML", "CSS", "JavaScript"],
    "github_url": "https://github.com/25bcya39-ctrl",
    "featured": 1
  }'
```

---

## 🎨 Frontend Features

- ✅ **Animated starfield** background (canvas-based)
- ✅ **Custom cursor** with lagged ring effect
- ✅ **Typewriter** hero text cycling through roles
- ✅ **Glitch** animation on the "AR" heading
- ✅ **Skill bars** that animate on scroll
- ✅ **Project gallery** loaded live from SQLite via REST API
- ✅ **Tag filter buttons** for project filtering (no page reload)
- ✅ **Contact form** that POSTs to the backend and saves to DB
- ✅ **Rate limiting** (5 messages per IP per 15 minutes)
- ✅ **Hobby modals** with smooth pop-in animation
- ✅ **Mobile responsive** (cursor hidden on touch devices)

---

## 🛠️ Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend  | Node.js, Express 4              |
| Database | SQLite (via `better-sqlite3`)   |
| Fonts    | Syne (headings) + DM Sans (body)|
| Icons    | Font Awesome 6                  |

---

## 📦 Deployment Tips

- For production, set `NODE_ENV=production` and use **PM2** to keep the server alive:
  ```bash
  npm install -g pm2
  pm2 start server.js --name "portfolio"
  ```
- To deploy to **Railway** or **Render**: just push this folder and set the start command to `npm start`.
- The SQLite database persists on disk — back it up by copying `db/portfolio.db`.

---

*Built with passion in Bengaluru · © 2026 Aarathy AR*
