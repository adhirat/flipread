// Bookstore route — public user bookstore page

import { Hono } from 'hono';
import type { Env, Book, User } from '../lib/types';

const store = new Hono<{ Bindings: Env }>();

// Helper to get user by name
async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  return await db.prepare(
    'SELECT id, name, avatar_url, plan, store_name, store_logo_url, store_settings FROM users WHERE LOWER(REPLACE(name, " ", "-")) = ?'
  ).bind(username.toLowerCase()).first<User>();
}

// GET /store/:username — displays a user's public book collection
store.get('/:username', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);

  if (!user) {
    return c.html(notFoundPage(), 404);
  }

  // Get their public books
  const booksResult = await c.env.DB.prepare(
    `SELECT id, title, slug, type, cover_url, view_count, created_at
     FROM books WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC`
  ).bind(user.id).all<Book>();

  const books = booksResult.results || [];
  const settings = JSON.parse(user.store_settings || '{}');

  return c.html(bookstorePage(user, books, settings, c.env.APP_URL));
});

// GET /store/:username/privacy
store.get('/:username/privacy', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  if (!settings.privacy_policy_content) return c.html(notFoundPage('Privacy Policy not found'), 404);

  return c.html(contentPage(user, 'Privacy Policy', settings.privacy_policy_content, c.env.APP_URL));
});

// GET /store/:username/terms
store.get('/:username/terms', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  if (!settings.terms_content) return c.html(notFoundPage('Terms & Conditions not found'), 404);

  return c.html(contentPage(user, 'Terms & Conditions', settings.terms_content, c.env.APP_URL));
});

// GET /store/:username/contact
store.get('/:username/contact', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  if (!settings.contact_info_content) return c.html(notFoundPage('Contact Info not found'), 404);

  return c.html(contentPage(user, 'Contact Information', settings.contact_info_content, c.env.APP_URL));
});

function bookstorePage(user: User, books: Book[], settings: any, appUrl: string): string {
  const storeName = user.store_name || `${user.name}'s Bookstore`;
  const safeName = esc(storeName);
  const bookCount = books.length;
  const showSearch = bookCount > 3;

  // Hero settings
  const heroImage = settings.hero_image_url || '';
  const heroTitle = settings.hero_title || safeName;
  const heroCaption = settings.hero_caption || settings.description || `Browse ${user.name}'s curated library.`;

  const bookCards = books.map((b, i) => {
    const firstLetter = (b.title || 'B').charAt(0).toUpperCase();
    const delay = Math.min(i, 11) * 0.06 + 0.4;
    return `<a href="${appUrl}/read/${esc(b.slug)}" class="bk-card" data-title="${esc(b.title.toLowerCase())}" style="animation-delay:${delay.toFixed(2)}s">
      <div class="bk-3d">
        <div class="bk-spine"></div>
        <div class="bk-cover">
          ${b.cover_url
            ? `<img src="${esc(b.cover_url)}" alt="${esc(b.title)}" loading="lazy">`
            : `<div class="bk-ph"><span class="bk-ph-letter">${esc(firstLetter)}</span></div>`}
        </div>
      </div>
      <div class="bk-info">
        <h3 class="bk-title">${esc(b.title)}</h3>
        <div class="bk-meta">
          <span class="bk-views"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${b.view_count.toLocaleString()}</span>
          <span class="bk-type">${b.type.toUpperCase()}</span>
        </div>
      </div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeName}</title>
<meta name="description" content="${esc(settings.description || `Browse ${user.name}'s library on FlipRead.`)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<script>
(function(){var t=localStorage.getItem('flipread-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}})();
</script>
<style>
/* ====== COLOR SYSTEM ====== */
:root,
[data-theme="light"] {
  --bg-primary: #faf9f7;
  --bg-secondary: #f0eeeb;
  --bg-card: #ffffff;
  --bg-card-hover: #fefefe;
  --bg-hero: #f5f3f0;
  --text-primary: #1a1613;
  --text-secondary: #5c554d;
  --text-tertiary: #9c9489;
  --accent: #c45d3e;
  --accent-hover: #a84e33;
  --accent-subtle: rgba(196, 93, 62, 0.06);
  --accent-glow: rgba(196, 93, 62, 0.12);
  --border: rgba(26, 22, 19, 0.08);
  --border-strong: rgba(26, 22, 19, 0.15);
  --shadow-card: 0 1px 3px rgba(26, 22, 19, 0.04), 0 8px 24px rgba(26, 22, 19, 0.06);
  --shadow-card-hover: 0 4px 12px rgba(26, 22, 19, 0.06), 0 24px 48px rgba(26, 22, 19, 0.12);
  --shadow-book: 3px 3px 15px rgba(26, 22, 19, 0.12), 6px 6px 30px rgba(26, 22, 19, 0.08);
  --shadow-book-hover: 6px 6px 20px rgba(26, 22, 19, 0.15), 12px 12px 40px rgba(26, 22, 19, 0.12);
  --noise-opacity: 0.025;
  --header-bg: rgba(250, 249, 247, 0.82);
  --search-bg: rgba(26, 22, 19, 0.03);
  --ph-bg: linear-gradient(145deg, #f5f0eb, #ebe5dd);
  --ph-color: rgba(196, 93, 62, 0.2);
  --spine-color: rgba(26, 22, 19, 0.08);
  --toggle-bg: rgba(26, 22, 19, 0.06);
  color-scheme: light;
}

[data-theme="dark"] {
  --bg-primary: #0e0d0b;
  --bg-secondary: #1a1815;
  --bg-card: #1f1d19;
  --bg-card-hover: #262420;
  --bg-hero: #141210;
  --text-primary: #ede9e3;
  --text-secondary: #a39d94;
  --text-tertiary: #6b655c;
  --accent: #e07a5c;
  --accent-hover: #c45d3e;
  --accent-subtle: rgba(224, 122, 92, 0.08);
  --accent-glow: rgba(224, 122, 92, 0.15);
  --border: rgba(237, 233, 227, 0.06);
  --border-strong: rgba(237, 233, 227, 0.12);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.3), 0 24px 48px rgba(0, 0, 0, 0.4);
  --shadow-book: 3px 3px 15px rgba(0, 0, 0, 0.3), 6px 6px 30px rgba(0, 0, 0, 0.2);
  --shadow-book-hover: 6px 6px 20px rgba(0, 0, 0, 0.4), 12px 12px 40px rgba(0, 0, 0, 0.3);
  --noise-opacity: 0.035;
  --header-bg: rgba(14, 13, 11, 0.82);
  --search-bg: rgba(237, 233, 227, 0.04);
  --ph-bg: linear-gradient(145deg, #1f1d19, #262420);
  --ph-color: rgba(224, 122, 92, 0.25);
  --spine-color: rgba(237, 233, 227, 0.06);
  --toggle-bg: rgba(237, 233, 227, 0.08);
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0e0d0b;
    --bg-secondary: #1a1815;
    --bg-card: #1f1d19;
    --bg-card-hover: #262420;
    --bg-hero: #141210;
    --text-primary: #ede9e3;
    --text-secondary: #a39d94;
    --text-tertiary: #6b655c;
    --accent: #e07a5c;
    --accent-hover: #c45d3e;
    --accent-subtle: rgba(224, 122, 92, 0.08);
    --accent-glow: rgba(224, 122, 92, 0.15);
    --border: rgba(237, 233, 227, 0.06);
    --border-strong: rgba(237, 233, 227, 0.12);
    --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.3);
    --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.3), 0 24px 48px rgba(0, 0, 0, 0.4);
    --shadow-book: 3px 3px 15px rgba(0, 0, 0, 0.3), 6px 6px 30px rgba(0, 0, 0, 0.2);
    --shadow-book-hover: 6px 6px 20px rgba(0, 0, 0, 0.4), 12px 12px 40px rgba(0, 0, 0, 0.3);
    --noise-opacity: 0.035;
    --header-bg: rgba(14, 13, 11, 0.82);
    --search-bg: rgba(237, 233, 227, 0.04);
    --ph-bg: linear-gradient(145deg, #1f1d19, #262420);
    --ph-color: rgba(224, 122, 92, 0.25);
    --spine-color: rgba(237, 233, 227, 0.06);
    --toggle-bg: rgba(237, 233, 227, 0.08);
    color-scheme: dark;
  }
}

/* ====== RESET & BASE ====== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
  transition: background 0.3s ease, color 0.3s ease;
}

/* ====== NOISE OVERLAY ====== */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}

/* ====== STICKY HEADER ====== */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: var(--header-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  transition: background 0.3s ease;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-primary);
}
.site-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--bg-secondary);
}
.site-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: var(--toggle-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}
.theme-toggle:hover {
  background: var(--accent-subtle);
  color: var(--accent);
  transform: scale(1.05);
}
.theme-toggle svg { width: 18px; height: 18px; transition: transform 0.3s ease; }
.theme-toggle:hover svg { transform: rotate(15deg); }

.icon-sun { display: none; }
.icon-moon { display: block; }
[data-theme="dark"] .icon-sun { display: block; }
[data-theme="dark"] .icon-moon { display: none; }

/* ====== HERO PARALLAX ====== */
.hero {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  padding: 80px 20px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  transform: translateZ(0);
  background-color: var(--bg-hero);
}
.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
}
.hero-no-img {
  background: var(--bg-hero);
}
.hero-no-img::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: var(--accent-glow);
  filter: blur(120px);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 20px;
  animation: revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.hero-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(42px, 6vw, 64px);
  font-weight: 400;
  line-height: 1.1;
  color: ${heroImage ? '#fff' : 'var(--text-primary)'};
  text-shadow: ${heroImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none'};
  margin-bottom: 16px;
}
.hero-caption {
  font-size: 18px;
  color: ${heroImage ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)'};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ====== CONTAINER ====== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ====== SEARCH BAR ====== */
.search-section {
  padding: 32px 0 0;
  display: flex;
  justify-content: center;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--search-bg);
  border: 1px solid var(--border);
  border-radius: 100px;
  transition: border-color 0.25s, box-shadow 0.25s;
  width: 100%;
  max-width: 420px;
}
.search-bar:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}
.search-bar svg {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}
.search-bar input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--text-primary);
  min-width: 0;
}
.search-bar input::placeholder { color: var(--text-tertiary); }

/* ====== BOOK GRID ====== */
.grid-section {
  padding: 60px 0 100px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 40px;
  justify-content: center;
}
@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 300px));
    justify-content: center;
  }
}

/* ====== 3D BOOK CARD ====== */
.bk-card {
  display: block;
  text-decoration: none;
  color: inherit;
  opacity: 0;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.3s;
}
.bk-card:hover { transform: translateY(-4px); }

.bk-3d {
  position: relative;
  padding-bottom: 145%;
  perspective: 900px;
  margin-bottom: 20px;
}

.bk-cover {
  position: absolute;
  inset: 0;
  border-radius: 2px 10px 10px 2px;
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: var(--shadow-book);
  transform: rotateY(-3deg);
  transform-origin: left center;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.45s ease;
}
.bk-card:hover .bk-cover {
  transform: rotateY(-8deg) scale(1.02);
  box-shadow: var(--shadow-book-hover);
}

.bk-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }

.bk-spine {
  position: absolute;
  left: 0;
  top: 3%;
  bottom: 3%;
  width: 5px;
  background: linear-gradient(to right, var(--spine-color), transparent);
  border-radius: 1px 0 0 1px;
  z-index: 2;
  pointer-events: none;
}

.bk-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ph-bg);
}
.bk-ph-letter {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 72px;
  font-style: italic;
  color: var(--ph-color);
}

.bk-info { padding: 0 4px; text-align: center; }
.bk-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-primary);
  transition: color 0.2s;
}
.bk-card:hover .bk-title { color: var(--accent); }

.bk-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-tertiary);
}
.bk-views { display: inline-flex; align-items: center; gap: 4px; }
.bk-views svg { width: 13px; height: 13px; }
.bk-type {
  border: 1px solid var(--border-strong);
  padding: 1px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ====== EMPTY STATE ====== */
.empty-state {
  text-align: center;
  padding: 120px 20px;
}
.empty-state svg {
  width: 64px;
  height: 64px;
  color: var(--text-tertiary);
  opacity: 0.25;
  margin-bottom: 24px;
}
.empty-state h2 {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.empty-state p { font-size: 15px; color: var(--text-tertiary); }

/* ====== FOOTER ====== */
.site-footer {
  border-top: 1px solid var(--border);
  padding: 60px 20px;
  background: var(--bg-secondary);
  text-align: center;
}
.footer-inner {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}
.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-card);
  object-fit: cover;
}
.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--accent); }
.footer-copy {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* ====== ANIMATIONS ====== */
@keyframes revealUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}

/* ====== RESPONSIVE ====== */
@media (max-width: 639px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .bk-3d { perspective: 600px; }
  .site-header { padding: 0 16px; }
}
</style>
</head>
<body>

<header class="site-header">
  <div class="site-brand">
    ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="site-logo" alt="">` : ''}
    <span class="site-title">${safeName}</span>
  </div>
  <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
</header>

<section class="hero ${!heroImage ? 'hero-no-img' : ''}">
  ${heroImage ? `<div class="hero-bg" style="background-image: url('${esc(heroImage)}')"></div>` : ''}
  <div class="hero-content">
    <h1 class="hero-title">${esc(heroTitle)}</h1>
    <p class="hero-caption">${esc(heroCaption)}</p>
  </div>
</section>

<div class="container">
  ${showSearch ? `<div class="search-section">
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="book-search" placeholder="Search ${bookCount} publications..." autocomplete="off">
    </div>
  </div>` : ''}

  ${bookCount > 0
    ? `<div class="grid-section"><div class="grid" id="book-grid">${bookCards}</div></div>`
    : `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <h2>Nothing here yet</h2>
        <p>This library is waiting for its first publication.</p>
      </div>`}
</div>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="footer-logo" alt="">` : ''}
      <span>${safeName}</span>
    </div>
    <div class="footer-links">
      ${settings.privacy_policy_content ? `<a href="/store/${user.name.toLowerCase().replace(/ /g,'-')}/privacy">Privacy Policy</a>` : ''}
      ${settings.terms_content ? `<a href="/store/${user.name.toLowerCase().replace(/ /g,'-')}/terms">Terms & Conditions</a>` : ''}
      ${settings.contact_info_content ? `<a href="/store/${user.name.toLowerCase().replace(/ /g,'-')}/contact">Contact Us</a>` : ''}
    </div>
    <div class="footer-copy">
      &copy; ${new Date().getFullYear()} ${safeName}. All rights reserved.
    </div>
  </div>
</footer>

<script>
document.getElementById('theme-toggle').onclick=function(){var h=document.documentElement;var d=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',d?'light':'dark');localStorage.setItem('flipread-theme',d?'light':'dark')};

// Simple parallax
window.addEventListener('scroll', function() {
  var scrolled = window.scrollY;
  var bg = document.querySelector('.hero-bg');
  if(bg) {
    bg.style.transform = 'translateY(' + (scrolled * 0.4) + 'px)';
  }
});

${showSearch ? `(function(){var input=document.getElementById('book-search');var cards=document.querySelectorAll('.bk-card');if(!input)return;input.oninput=function(){var q=this.value.toLowerCase().trim();for(var i=0;i<cards.length;i++){var title=cards[i].getAttribute('data-title')||'';cards[i].style.display=(!q||title.indexOf(q)!==-1)?'':'none';}};})();` : ''}
</script>
</body></html>`;
}

function contentPage(user: User, title: string, content: string, appUrl: string): string {
  const storeName = user.store_name || `${user.name}'s Bookstore`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)} — ${esc(storeName)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<script>
(function(){var t=localStorage.getItem('flipread-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}})();
</script>
<style>
/* Simplified CSS based on main page */
:root, [data-theme="light"] { --bg: #faf9f7; --text: #1a1613; --accent: #c45d3e; color-scheme: light; }
[data-theme="dark"] { --bg: #0e0d0b; --text: #ede9e3; --accent: #e07a5c; color-scheme: dark; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}
header { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid rgba(128,128,128,0.2); }
h1 { font-family: 'Instrument Serif', serif; font-size: 36px; margin-bottom: 8px; }
.meta { color: gray; font-size: 14px; }
.content { white-space: pre-wrap; font-size: 16px; }
.back-link { display: inline-block; margin-top: 40px; color: var(--accent); text-decoration: none; font-weight: 500; }
</style>
</head>
<body>
  <header>
    <h1>${esc(title)}</h1>
    <div class="meta">${esc(storeName)}</div>
  </header>
  <div class="content">${esc(content)}</div>
  <a href="/store/${user.name.toLowerCase().replace(/ /g,'-')}" class="back-link">&larr; Back to Store</a>
</body>
</html>`;
}

function notFoundPage(msg = 'Store not found'): string {
  return `<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404</h1><p>${msg}</p></body></html>`;
}

function esc(s: string): string {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export default store;
