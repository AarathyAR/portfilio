/* ============================================================
   Aarathy AR — Portfolio Script
   Features: Starfield, Custom Cursor, Typewriter, Skill Bars,
             Projects Gallery (API), Contact Form (API), Modals
   ============================================================ */

const API_BASE = ''; // Empty = same origin. Set to 'http://localhost:3000' for local dev

/* ── 1. STARFIELD CANVAS ──────────────────────────────────────────────── */
(function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx    = canvas.getContext('2d');
    let stars    = [];
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createStars(count = 180) {
        stars = Array.from({ length: count }, () => ({
            x:     Math.random() * W,
            y:     Math.random() * H,
            r:     Math.random() * 1.4 + 0.2,
            alpha: Math.random(),
            speed: Math.random() * 0.4 + 0.1,
            drift: (Math.random() - 0.5) * 0.15
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 243, 255, ${s.alpha * 0.6})`;
            ctx.fill();

            // Drift & twinkle
            s.y    -= s.speed;
            s.x    += s.drift;
            s.alpha = 0.3 + 0.7 * Math.abs(Math.sin(Date.now() * 0.001 + s.x));

            // Wrap around
            if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
            if (s.x < -2 || s.x > W + 2) s.x = Math.random() * W;
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); createStars(); });
    resize();
    createStars();
    draw();
})();

/* ── 2. CUSTOM CURSOR ─────────────────────────────────────────────────── */
(function initCursor() {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    // Ring follows with lag
    (function animateRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animateRing);
    })();
})();

/* ── 3. NAVBAR SCROLL EFFECT ──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id], header[id]');
    const links    = document.querySelectorAll('.nav-links a');
    let current    = '';

    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });

    links.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
});

/* ── 4. SMOOTH SCROLLING ──────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

/* ── 5. TYPEWRITER EFFECT ─────────────────────────────────────────────── */
(function initTypewriter() {
    const el    = document.querySelector('.typewriter');
    if (!el) return;
    const words = ['Full-stack Web Developer', 'UI / UX Designer', 'Creative Technologist', 'BCA Student @ KJC'];
    let wi = 0, ci = 0, deleting = false;

    function type() {
        const word    = words[wi];
        el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);

        if (!deleting && ci > word.length)     { deleting = true; setTimeout(type, 1400); return; }
        if (deleting  && ci < 0)               { deleting = false; wi = (wi + 1) % words.length; ci = 0; }

        setTimeout(type, deleting ? 45 : 80);
    }
    type();
})();

/* ── 6. SKILL BAR ANIMATION ───────────────────────────────────────────── */
const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.line').forEach(line => {
                line.style.transform = 'scaleX(1)';
            });
        }
    });
}, { threshold: 0.25 });

const resumeGrid = document.querySelector('.resume-grid');
if (resumeGrid) skillObserver.observe(resumeGrid);

/* ── 7. PROJECTS GALLERY ──────────────────────────────────────────────── */
let allProjects = [];

async function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    try {
        const res  = await fetch(`${API_BASE}/api/projects`);
        const json = await res.json();

        if (!json.success || !json.data.length) {
            grid.innerHTML = '<p style="color:var(--gray);grid-column:1/-1;text-align:center;padding:60px 0">No projects yet.</p>';
            return;
        }

        allProjects = json.data;
        renderProjects(allProjects);

    } catch (err) {
        // Fallback cards when backend not running
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--gray)">
                <i class="fas fa-server" style="font-size:2rem;color:var(--accent);margin-bottom:16px;display:block"></i>
                <p>Start the backend server to see live projects from the database.</p>
                <code style="font-size:0.8rem;color:var(--accent);margin-top:12px;display:block">npm start</code>
            </div>`;
    }
}

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = projects.map(p => `
        <div class="project-card" data-tags='${JSON.stringify(p.tags)}'>
            ${p.featured ? '<span class="featured-badge">Featured</span>' : ''}
            <img class="project-img" src="${p.image_url || 'https://via.placeholder.com/600x300/111/00f3ff?text=Project'}" alt="${p.title}" loading="lazy">
            <div class="project-body">
                <div class="project-tags">${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
                <h4>${p.title}</h4>
                <p>${p.description}</p>
                <div class="project-links">
                    ${p.live_url   ? `<a href="${p.live_url}"   target="_blank" class="proj-link"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
                    ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="proj-link"><i class="fab fa-github"></i> Code</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        const filtered = filter === 'all'
            ? allProjects
            : allProjects.filter(p => p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())));

        renderProjects(filtered);
    });
});

loadProjects();

/* ── 8. CONTACT FORM ──────────────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();

        const btn    = contactForm.querySelector('.submit-btn');
        const status = document.getElementById('formStatus');
        const data   = Object.fromEntries(new FormData(contactForm));

        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = 'Sending…';
        status.className = 'form-status';
        status.textContent = '';

        try {
            const res  = await fetch(`${API_BASE}/api/messages`, {
                method  : 'POST',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify(data)
            });
            const json = await res.json();

            if (json.success) {
                status.className   = 'form-status success';
                status.textContent = '✓ ' + json.message;
                contactForm.reset();
            } else {
                status.className   = 'form-status error';
                status.textContent = '✗ ' + (json.errors || ['Something went wrong.']).join(' ');
            }
        } catch {
            status.className   = 'form-status error';
            status.textContent = '✗ Could not reach the server. Please email me directly.';
        } finally {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Send Message';
        }
    });
}

/* ── 9. HOBBY MODAL ───────────────────────────────────────────────────── */
const hobbyData = {
    dance: {
        title : 'Artistic Movement',
        text  : 'My approach to dance is rooted in the fusion of classical discipline and contemporary freedom. I view choreography as a visual extension of web development — both require structure, timing, and an eye for aesthetics.'
    },
    horology: {
        title : 'Mechanical Craftsmanship',
        text  : 'I am a dedicated collector of vintage timepieces, with a specific focus on 1970s Japanese engineering. Understanding the intricate gear-work of a mechanical watch helps me appreciate the "unseen" architecture in coding.'
    },
    exploration: {
        title : 'Curated Exploration',
        text  : 'I travel to find the intersection of culture and commerce. From the bustling night markets of Thailand to the historic lanes of Bangalore, I document the sensory details that make every location unique.'
    }
};

function openModal(hobby) {
    const modal = document.getElementById('hobbyModal');
    const body  = document.getElementById('modalBody');
    const data  = hobbyData[hobby];

    body.innerHTML = `
        <h2 style="font-family:'Syne',sans-serif;color:var(--accent);margin-bottom:24px;font-size:1.8rem">${data.title}</h2>
        <p style="font-size:1rem;line-height:1.9;color:var(--gray-light)">${data.text}</p>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('hobbyModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.addEventListener('click', e => {
    const modal = document.getElementById('hobbyModal');
    if (e.target === modal) closeModal();
});

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});
