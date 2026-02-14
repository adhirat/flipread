// Bookstore route — public user bookstore page

import { Hono } from 'hono';
import type { Env, Book, User } from '../lib/types';

const store = new Hono<{ Bindings: Env }>();

// GET /store/:username — displays a user's public book collection
store.get('/:username', async (c) => {
  const username = c.req.param('username');

  // Find user by name (URL-safe version)
  const user = await c.env.DB.prepare(
    'SELECT id, name, avatar_url, plan, store_name, store_logo_url, store_settings FROM users WHERE LOWER(REPLACE(name, " ", "-")) = ?'
  ).bind(username.toLowerCase()).first<User>();

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

function bookstorePage(user: User, books: Book[], settings: any, appUrl: string): string {
  const storeName = user.store_name || `${user.name}'s Bookstore`;
  const safeName = esc(storeName);
  const bookCount = books.length;
  const showSearch = bookCount > 3;

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
<title>${safeName} — FlipRead</title>
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
  height: 56px;
  background: var(--header-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  transition: background 0.3s ease;
}

.site-wordmark {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-decoration: none;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color 0.2s;
}
.site-wordmark:hover { color: var(--text-primary); }

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

/* ====== HERO SECTION ====== */
.hero {
  padding: 80px 20px 60px;
  background: var(--bg-hero);
  border-bottom: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: var(--accent-glow);
  filter: blur(120px);
  top: -200px;
  left: -100px;
  pointer-events: none;
}
.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
}

.hero-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 28px;
  box-shadow: var(--shadow-card);
  border: 2px solid var(--border);
  animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}
.hero-logo img { width: 100%; height: 100%; object-fit: cover; }
.hero-logo svg { color: var(--text-tertiary); width: 32px; height: 32px; }

.hero h1 {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 14px;
  animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.hero-desc {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 540px;
  line-height: 1.7;
  animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
}

.hero-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  padding: 6px 16px;
  border-radius: 100px;
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
}
.hero-count svg { width: 14px; height: 14px; }

/* ====== CONTAINER ====== */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ====== SEARCH BAR ====== */
.search-section {
  padding: 48px 0 8px;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--search-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  transition: border-color 0.25s, box-shadow 0.25s;
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
.search-count {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s;
}

/* ====== BOOK GRID ====== */
.grid-section {
  padding: 40px 0 80px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 32px;
}

/* ====== 3D BOOK CARD ====== */
.bk-card {
  display: block;
  text-decoration: none;
  color: inherit;
  opacity: 0;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.bk-3d {
  position: relative;
  padding-bottom: 145%;
  perspective: 900px;
  margin-bottom: 18px;
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

.bk-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

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

/* Placeholder (no cover) */
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
  user-select: none;
  line-height: 1;
}

/* Book info */
.bk-info { padding: 0 4px; }
.bk-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
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
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
}
.bk-views {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
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
.empty-state p {
  font-size: 15px;
  color: var(--text-tertiary);
}

/* ====== FOOTER ====== */
.site-footer {
  border-top: 1px solid var(--border);
  padding: 48px 20px;
}
.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
}
.footer-brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.footer-brand-logo img { width: 100%; height: 100%; object-fit: cover; }
.footer-links {
  display: flex;
  gap: 24px;
  align-items: center;
}
.footer-links a {
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--text-primary); }
.footer-powered {
  font-size: 12px;
  color: var(--text-tertiary);
}
.footer-powered a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}
.footer-powered a:hover { opacity: 0.8; }

/* ====== ANIMATIONS ====== */
@keyframes revealUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0.001ms !important;
  }
}

/* ====== RESPONSIVE ====== */
@media (min-width: 640px) {
  .hero { padding: 100px 40px 80px; }
  .hero h1 { font-size: 42px; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 28px; }
}

@media (min-width: 1024px) {
  .hero { padding: 120px 40px 88px; }
  .hero h1 { font-size: 52px; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 36px; }
}

@media (max-width: 639px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .bk-3d { perspective: 600px; }
  .search-count { display: none; }
  .footer-inner { flex-direction: column; align-items: center; text-align: center; }
  .footer-links { justify-content: center; }
  .site-header { padding: 0 16px; }
  .hero-inner { padding: 0; }
}
</style>
</head>
<body>

<header class="site-header">
  <a href="${esc(appUrl)}" class="site-wordmark">FlipRead</a>
  <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
</header>

<section class="hero">
  <div class="hero-inner">
    <div class="hero-logo">
      ${user.store_logo_url
        ? `<img src="${esc(user.store_logo_url)}" alt="${safeName}">`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`}
    </div>
    <h1>${safeName}</h1>
    <p class="hero-desc">${esc(settings.description || `Browse ${user.name}'s curated library on FlipRead.`)}</p>
    ${bookCount > 0 ? `<div class="hero-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>${bookCount} publication${bookCount !== 1 ? 's' : ''}</div>` : ''}
  </div>
</section>

<div class="container">
  ${showSearch ? `<div class="search-section">
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="book-search" placeholder="Search publications..." autocomplete="off">
      <span class="search-count" id="search-count">${bookCount} publication${bookCount !== 1 ? 's' : ''}</span>
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
      <div class="footer-brand-logo">
        ${user.store_logo_url
          ? `<img src="${esc(user.store_logo_url)}" alt="">`
          : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`}
      </div>
      <span>${safeName}</span>
    </div>
    <div class="footer-links">
      ${settings.privacy_policy ? `<a href="${esc(settings.privacy_policy)}">Privacy</a>` : ''}
      ${settings.terms ? `<a href="${esc(settings.terms)}">Terms</a>` : ''}
    </div>
    <div class="footer-powered">Published with <a href="${esc(appUrl)}">FlipRead</a></div>
  </div>
</footer>

<script>
document.getElementById('theme-toggle').onclick=function(){var h=document.documentElement;var d=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',d?'light':'dark');localStorage.setItem('flipread-theme',d?'light':'dark')};
${showSearch ? `(function(){var input=document.getElementById('book-search');var cards=document.querySelectorAll('.bk-card');var countEl=document.getElementById('search-count');var total=cards.length;if(!input||total===0)return;input.oninput=function(){var q=this.value.toLowerCase().trim();var visible=0;for(var i=0;i<cards.length;i++){var title=cards[i].getAttribute('data-title')||'';var show=!q||title.indexOf(q)!==-1;cards[i].style.display=show?'':'none';if(show)visible++}countEl.textContent=q?'Showing '+visible+' of '+total:total+' publication'+(total!==1?'s':'')};})();` : ''}
</script>
</body></html>`;
}

function notFoundPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Store Not Found — FlipRead</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<script>
(function(){var t=localStorage.getItem('flipread-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}})();
</script>
<style>
:root,
[data-theme="light"] {
  --bg-primary: #faf9f7;
  --text-primary: #1a1613;
  --text-secondary: #5c554d;
  --text-tertiary: #9c9489;
  --accent: #c45d3e;
  --accent-subtle: rgba(196, 93, 62, 0.06);
  --border: rgba(26, 22, 19, 0.08);
  --toggle-bg: rgba(26, 22, 19, 0.06);
  --noise-opacity: 0.025;
  --watermark-opacity: 0.04;
  color-scheme: light;
}
[data-theme="dark"] {
  --bg-primary: #0e0d0b;
  --text-primary: #ede9e3;
  --text-secondary: #a39d94;
  --text-tertiary: #6b655c;
  --accent: #e07a5c;
  --accent-subtle: rgba(224, 122, 92, 0.08);
  --border: rgba(237, 233, 227, 0.06);
  --toggle-bg: rgba(237, 233, 227, 0.08);
  --noise-opacity: 0.035;
  --watermark-opacity: 0.06;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0e0d0b;
    --text-primary: #ede9e3;
    --text-secondary: #a39d94;
    --text-tertiary: #6b655c;
    --accent: #e07a5c;
    --accent-subtle: rgba(224, 122, 92, 0.08);
    --border: rgba(237, 233, 227, 0.06);
    --toggle-bg: rgba(237, 233, 227, 0.08);
    --noise-opacity: 0.035;
    --watermark-opacity: 0.06;
    color-scheme: dark;
  }
}
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, color 0.3s ease;
  position: relative;
  overflow: hidden;
}
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
.watermark {
  position: absolute;
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-size: clamp(120px, 25vw, 280px);
  color: var(--text-primary);
  opacity: var(--watermark-opacity);
  user-select: none;
  pointer-events: none;
  line-height: 1;
  letter-spacing: -0.04em;
}
.content {
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 40px 24px;
  animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}
.content h1 {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 400;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}
.content p {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 100px;
  background: var(--accent);
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.25s ease;
}
.back-btn:hover { opacity: 0.9; transform: translateY(-2px); }
.back-btn svg { width: 16px; height: 16px; }
.corner-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10;
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
.corner-toggle:hover { background: var(--accent-subtle); color: var(--accent); }
.corner-toggle svg { width: 18px; height: 18px; }
.icon-sun { display: none; }
.icon-moon { display: block; }
[data-theme="dark"] .icon-sun { display: block; }
[data-theme="dark"] .icon-moon { display: none; }
@keyframes revealUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
</style>
</head>
<body>
<button class="corner-toggle" id="theme-toggle" aria-label="Toggle theme">
  <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
</button>
<div class="watermark">404</div>
<div class="content">
  <h1>Store not found</h1>
  <p>This library doesn't exist or may have been moved.</p>
  <a href="/" class="back-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    Back to FlipRead
  </a>
</div>
<script>
document.getElementById('theme-toggle').onclick=function(){var h=document.documentElement;var d=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',d?'light':'dark');localStorage.setItem('flipread-theme',d?'light':'dark')};
</script>
</body></html>`;
}

function esc(s: string): string {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export default store;
