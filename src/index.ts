// FlipRead — Main Worker Entry Point

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
// @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST';
import type { Env } from './lib/types';
import authRoutes from './routes/auth';
import docRoutes from './routes/docs';
import billingRoutes from './routes/billing';
import userRoutes from './routes/user';
import viewerRoutes, { viewerPage } from './routes/viewer';
import storeRoutes, { bookstorePage, contentPage, getUserByCustomDomain } from './routes/store';
import memberRoutes from './routes/members';
import { dashboardPage } from './views/dashboard';
import swagger from './routes/swagger';
import type { Book, Variables } from './lib/types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Custom Domain Middleware
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const hostname = url.hostname;
  const appHostname = new URL(c.env.APP_URL).hostname;

  // If not on main domain or localhost, check for custom domain
  if (hostname !== appHostname && hostname !== 'localhost' && !hostname.endsWith('.workers.dev')) {
    // 1. Check for Book Domain
    const book = await c.env.DB.prepare(
      `SELECT b.*, u.name as author_name, u.plan as author_plan
       FROM books b JOIN users u ON b.user_id = u.id
       WHERE LOWER(b.custom_domain) = ?`
    ).bind(hostname.toLowerCase()).first<Book & { author_name: string; author_plan: string }>();

    if (book) {
      c.set('book', book);
    } else {
      // 2. Check for Store Domain
      const user = await getUserByCustomDomain(c.env.DB, hostname);
      if (user) {
        c.set('storeUser', user);
      }
    }
  }
  await next();
});

// Global middleware
app.use('/*', cors({
  origin: (origin) => origin || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Static Assets (for Logo/Icons)
app.get('/logo.png', serveStatic({ path: './logo.png', manifest }));
app.get('/favicon.png', serveStatic({ path: './favicon.png', manifest }));
app.get('/apple-touch-icon.png', serveStatic({ path: './apple-touch-icon.png', manifest }));

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/docs', docRoutes);
app.route('/api/billing', billingRoutes);
app.route('/api/user', userRoutes);
app.route('/api/members', memberRoutes);
app.route('/api/swagger', swagger);

// Public Routes
app.route('/read', viewerRoutes);
app.route('/store', storeRoutes);

// Dashboard (Move higher to avoid regex collision)
app.get('/dashboard', (c) => {
  return c.html(dashboardPage(c.env.APP_URL));
});

// Landing page, Custom Store Root, or Custom Book Root
app.get('/', async (c) => {
  const book = c.get('book');
  if (book) {
    // Render the viewer directly for the book
    return c.html(viewerPage(book as any, c.env.APP_URL));
  }

  const storeUser = c.get('storeUser');
  if (storeUser) {
    const booksResult = await c.env.DB.prepare(
      `SELECT id, title, slug, type, cover_url, view_count, created_at
       FROM books WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC`
    ).bind(storeUser.id).all<Book>();
    const books = booksResult.results || [];
    const settings = JSON.parse(storeUser.store_settings || '{}');
    return c.html(bookstorePage(storeUser, books, settings, c.env.APP_URL, true));
  }
  return c.html(landingPage(c.env.APP_URL));
});

// Custom Store Pages (Privacy, Terms, Contact)
app.get('/p/:page(privacy|terms|contact)', async (c) => {
  const storeUser = c.get('storeUser');
  if (!storeUser) return c.notFound();

  const page = c.req.param('page');
  const settings = JSON.parse(storeUser.store_settings || '{}');
  
  let content = '';
  let title = '';
  
  if (page === 'privacy') {
    content = settings.privacy_policy_content;
    title = 'Privacy Policy';
  } else if (page === 'terms') {
    content = settings.terms_content;
    title = 'Terms & Conditions';
  } else if (page === 'contact') {
    content = settings.contact_info_content;
    title = 'Contact Information';
  }

  if (!content) return c.notFound();
  return c.html(contentPage(storeUser, title, content, c.env.APP_URL, true));
});



function landingPage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>FlipRead — Turn Your PDFs & EPUBs into Beautiful Flipbooks</title>
<meta name="description" content="Upload PDFs or EPUBs and generate shareable flipbook links. Free to start.">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:title" content="FlipRead — Your Digital Flipbook Library">
<meta property="og:description" content="Convert any PDF or EPUB into a professional, interactive flipbook in seconds.">
<meta property="og:image" content="${appUrl}/logo.png">
<meta property="og:url" content="${appUrl}">
<meta name="twitter:card" content="summary_large_image">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root {
  --bg-primary:#ffffff;
  --bg-secondary:#f8fafc;
  --bg-card:#ffffff;
  --bg-elevated:#f1f5f9;
  --text-primary:#0f172a;
  --text-secondary:#334155;
  --text-muted:#64748b;
  --accent-cyan:#4f46e5;
  --accent-magenta:#ec4899;
  --accent-purple:#8b5cf6;
  --accent-blue:#3b82f6;
  --border:rgba(0,0,0,0.06);
  --glow-cyan:rgba(79, 70, 229, 0.25);
  --glow-magenta:rgba(236, 72, 153, 0.25);
  --shadow:rgba(0,0,0,0.08)
}
:root[data-theme="dark"]{
  --bg-primary:#0a0a0f;
  --bg-secondary:#12121a;
  --bg-card:#1a1a24;
  --bg-elevated:#252538;
  --text-primary:#fcfcfc;
  --text-secondary:#a0aec0;
  --text-muted:#64748b;
  --accent-cyan:#6366f1;
  --accent-magenta:#f472b6;
  --accent-purple:#a78bfa;
  --accent-blue:#60a5fa;
  --border:rgba(255,255,255,0.08);
  --glow-cyan:rgba(99, 102, 241, 0.4);
  --glow-magenta:rgba(244, 114, 182, 0.3);
  --shadow:rgba(0,0,0,0.5)
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Work Sans',sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow-x:hidden;transition:background 0.3s,color 0.3s}
body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background-image:radial-gradient(circle at 1px 1px,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:0.3;pointer-events:none;z-index:0}
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;position:fixed;top:0;width:100%;z-index:100;background:var(--bg-secondary);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 4px 30px var(--shadow)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo img{height:32px;width:auto}
.logo span{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;letter-spacing:2px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{color:var(--text-secondary);text-decoration:none;font-size:14px;font-weight:600;transition:all .3s;position:relative;letter-spacing:0.5px}
.nav-links a:hover{color:var(--accent-cyan);text-shadow:0 0 20px var(--glow-cyan)}
.theme-toggle{background:var(--bg-elevated);border:1px solid var(--border);border-radius:50px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;font-size:18px;color:var(--text-secondary)}
.theme-toggle:hover{border-color:var(--accent-cyan);box-shadow:0 0 20px var(--glow-cyan);transform:rotate(180deg)}
.btn{padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;cursor:pointer;transition:all .3s;text-decoration:none;display:inline-flex;align-items:center;gap:10px;border:none;text-transform:uppercase;letter-spacing:1px;position:relative;overflow:hidden}
.btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);transition:left .5s}
.btn:hover::before{left:100%}
.btn-primary{background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;box-shadow:0 8px 30px var(--glow-magenta)}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 12px 40px var(--glow-cyan)}
.btn-outline{background:transparent;color:var(--text-primary);border:2px solid var(--accent-purple)}
.btn-outline:hover{border-color:var(--accent-cyan);background:var(--bg-elevated);box-shadow:0 0 30px var(--glow-cyan)}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:140px 20px 100px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;width:800px;height:800px;background:radial-gradient(circle,var(--glow-cyan),transparent 70%);top:15%;left:20%;pointer-events:none;animation:pulse 8s infinite}
.hero::after{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,var(--glow-magenta),transparent 70%);bottom:10%;right:20%;pointer-events:none;animation:pulse 10s infinite reverse}
@keyframes pulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.2);opacity:0.8}}
.hero h1{font-family:'Rajdhani',sans-serif;font-size:clamp(42px,7vw,80px);font-weight:700;line-height:1.1;margin-bottom:28px;max-width:900px;position:relative;z-index:1;letter-spacing:-1px}
.hero h1 .grad{background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta),var(--accent-purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 80px var(--glow-cyan);animation:shimmer 3s infinite}
@keyframes shimmer{0%,100%{filter:hue-rotate(0deg)}50%{filter:hue-rotate(20deg)}}
.hero p{font-size:19px;color:var(--text-secondary);max-width:600px;line-height:1.8;margin-bottom:42px;position:relative;z-index:1}
.hero-btns{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;animation:fadeUp 0.8s ease-out}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.features{padding:120px 40px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
.features h2{font-family:'Rajdhani',sans-serif;text-align:center;font-size:42px;font-weight:700;margin-bottom:70px;letter-spacing:-0.5px;background:linear-gradient(135deg,var(--text-primary),var(--text-secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.f-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px}
.f-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px}
.f-card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:36px;transition:all .4s;position:relative;overflow:hidden;backdrop-filter:blur(10px)}
.f-card::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,var(--glow-cyan),var(--glow-magenta));opacity:0;transition:opacity .4s}
.f-card:hover{border-color:var(--accent-cyan);transform:translateY(-8px);box-shadow:0 20px 60px var(--shadow)}
.f-card:hover::before{opacity:0.05}
.f-icon{font-size:36px;margin-bottom:20px;display:inline-block;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 20px var(--glow-cyan))}
.f-card h3{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;margin-bottom:12px;letter-spacing:0.5px}
.f-card p{color:var(--text-secondary);font-size:15px;line-height:1.7}
.pricing{padding:120px 40px;background:var(--bg-secondary);position:relative;z-index:1}
.pricing h2{font-family:'Rajdhani',sans-serif;text-align:center;font-size:42px;font-weight:700;margin-bottom:70px;letter-spacing:-0.5px}
.p-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;max-width:1200px;margin:0 auto}
.p-card{background:var(--bg-card);border:2px solid var(--border);border-radius:24px;padding:40px;transition:all .4s;position:relative}
.p-card::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,var(--glow-cyan),transparent);opacity:0;animation:rotate 4s linear infinite;pointer-events:none}
.p-card:hover::after{opacity:0.1}
@keyframes rotate{to{transform:rotate(360deg)}}
.p-card.pop{border-color:var(--accent-cyan);box-shadow:0 0 40px var(--glow-cyan);position:relative}
.p-card.pop::before{content:'POPULAR';position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;font-size:11px;font-weight:700;padding:6px 18px;border-radius:50px;letter-spacing:1.5px;box-shadow:0 4px 20px var(--glow-cyan);z-index:2}
:root[data-theme="dark"] .btn-primary{color:var(--bg-primary)}
:root[data-theme="light"] .btn-primary{color:#fff}
.p-card:hover{transform:translateY(-8px);border-color:var(--accent-magenta);box-shadow:0 20px 60px var(--shadow)}
.p-name{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;margin-bottom:6px;letter-spacing:1px}
.p-price{font-size:48px;font-weight:800;margin:20px 0;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.p-price .p-unit{font-size:16px;color:var(--text-muted);font-weight:500}
.p-list{list-style:none;margin:28px 0}
.p-list li{padding:10px 0;font-size:14px;color:var(--text-secondary);display:flex;align-items:center;gap:12px}
.p-list li::before{content:'✓';color:var(--accent-cyan);font-weight:bold;font-size:18px}
footer{text-align:center;padding:50px;color:var(--text-muted);font-size:14px;border-top:1px solid var(--border);position:relative;z-index:1;background:var(--bg-secondary)}
footer a{color:var(--accent-cyan);text-decoration:none;transition:color .3s}
footer a:hover{color:var(--accent-magenta)}
.nav-right{display:flex;align-items:center;gap:20px}
.menu-btn{display:none;background:none;border:none;color:var(--text-primary);font-size:20px;cursor:pointer;padding:5px}
.mobile-menu{position:fixed;top:0;right:-100%;width:280px;height:100%;background:var(--bg-secondary);z-index:200;transition:right 0.3s cubic-bezier(0.16, 1, 0.3, 1);padding:30px;box-shadow:-10px 0 40px var(--shadow);border-left:1px solid var(--border);backdrop-filter:blur(30px)}
.mobile-menu.active{right:0}
.mobile-menu-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid var(--border)}
.close-btn{background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;padding:5px}
.mobile-links{display:flex;flex-direction:column;gap:4px}
.mobile-links a{padding:15px;color:var(--text-secondary);text-decoration:none;font-size:16px;font-weight:600;border-radius:12px;transition:all 0.2s}
.mobile-links a:hover{background:var(--bg-elevated);color:var(--text-primary)}
@media(max-width:768px){
  nav{padding:16px 24px}
  .nav-links{display:none}
  .menu-btn{display:block}
  .hero{padding:120px 20px 80px}
  .features,.pricing{padding:80px 20px}
}
</style>
</head>
<body>
<nav>
<a href="/" class="logo">
  <img src="/logo.png" alt="FlipRead Logo">
  <span>FlipRead</span>
</a>
<div class="nav-right">
<div class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
<i class="fas fa-sun" id="theme-icon"></i>
</div>
<div class="nav-links">
<a href="#features">Features</a>
<a href="#pricing">Pricing</a>
<a href="/dashboard" class="btn btn-outline">Login</a>
<a href="/dashboard?mode=register" class="btn btn-primary"><i class="fas fa-rocket"></i> Get Started</a>
</div>
<button class="menu-btn" onclick="toggleMenu()"><i class="fas fa-bars"></i></button>
</div>
</nav>

<div class="mobile-menu" id="mobile-menu">
<div class="mobile-menu-header">
<a href="/" class="logo">
  <img src="/logo.png" alt="FlipRead Logo">
  <span>FlipRead</span>
</a>
<button class="close-btn" onclick="toggleMenu()">✕</button>
</div>
<div class="mobile-links">
<a href="#features" onclick="toggleMenu()">Features</a>
<a href="#pricing" onclick="toggleMenu()">Pricing</a>
<a href="/dashboard" onclick="toggleMenu()" style="margin-top:20px;border:1px solid var(--border);text-align:center">Login</a>
<a href="/dashboard?mode=register" onclick="toggleMenu()" style="background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:white;text-align:center">Get Started</a>
</div>
</div>

<section class="hero">
<h1>Turn Your Books into <span class="grad">Stunning Flipbooks</span></h1>
<p>Upload a PDF or EPUB, get a shareable link instantly. Your readers experience a beautiful page-flipping book — right in their browser, on any device.</p>
<div class="hero-btns">
<a href="/dashboard?mode=register" class="btn btn-primary"><i class="fas fa-rocket"></i> Start Free</a>
<a href="#features" class="btn btn-outline"><i class="fas fa-play-circle"></i> See How It Works</a>
</div>
</section>

<section class="features" id="features">
<h2>Everything You Need</h2>
<div class="f-grid">
<div class="f-card"><div class="f-icon"><i class="fas fa-upload"></i></div><h3>Upload & Publish</h3><p>Drag and drop your PDF or EPUB. Get a shareable link in seconds — no technical skills needed.</p></div>
<div class="f-card"><div class="f-icon"><i class="fas fa-book-open"></i></div><h3>Realistic Flipbook</h3><p>Readers experience smooth page-turning animations with zoom, swipe, and keyboard navigation.</p></div>
<div class="f-card"><div class="f-icon"><i class="fas fa-store"></i></div><h3>Personal Bookstore</h3><p>Display all your books in a beautiful public collection page, share your library with anyone.</p></div>
<div class="f-card"><div class="f-icon"><i class="fas fa-chart-line"></i></div><h3>View Analytics</h3><p>Track how many people read your books, where they come from, and which books are most popular.</p></div>
<div class="f-card"><div class="f-icon"><i class="fas fa-lock"></i></div><h3>Password Protection</h3><p>Keep exclusive content private with password-protected books for Pro and Business users.</p></div>
<div class="f-card"><div class="f-icon"><i class="fas fa-palette"></i></div><h3>Custom Themes</h3><p>Customize the viewer background, colors, and branding to match your style or brand.</p></div>
</div>
</section>

<section class="pricing" id="pricing">
<h2>Simple Pricing</h2>
<div style="text-align:center;margin-bottom:32px">
<label style="display:inline-flex;align-items:center;gap:12px;cursor:pointer;font-size:14px;color:#94a3b8">
Monthly
<span style="position:relative;display:inline-block;width:48px;height:26px">
<input type="checkbox" id="billing-toggle" onchange="toggleBilling()" checked style="opacity:0;width:0;height:0">
<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#334155;border-radius:26px;transition:.3s"></span>
<span id="toggle-dot" style="position:absolute;content:'';height:20px;width:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s"></span>
</span>
Annual <span style="background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600">Save 2 months</span>
</label>
</div>
<div class="p-grid">
<div class="p-card">
<div class="p-name">Free</div>
<div style="color:#64748b;font-size:13px">Perfect for trying it out</div>
<div class="p-price">$0<span class="p-unit">/mo</span></div>
<ul class="p-list">
<li>1 published book</li><li>5 MB max file size</li><li>500 monthly views</li>
<li>Bookstore page</li><li>Basic analytics</li>
</ul>
<a href="/dashboard?mode=register" class="btn btn-outline" style="width:100%;justify-content:center">Get Started</a>
</div>
<div class="p-card">
<div class="p-name">Basic</div>
<div style="color:#64748b;font-size:13px">For getting started</div>
<div class="p-price"><span class="price-monthly">$2.50<span class="p-unit">/mo</span></span><span class="price-yearly" style="display:none">$2.08<span class="p-unit">/mo</span></span></div>
<div style="font-size:12px;color:var(--text-muted);margin-top:-15px;margin-bottom:15px;display:none" class="price-yearly-note">Billed $25 annually</div>
<ul class="p-list">
<li>5 published books</li><li>10 MB max file size</li><li>2,000 monthly views</li>
<li>Bookstore page</li><li>Basic analytics</li><li>Custom viewer background</li>
</ul>
<a href="/dashboard" class="btn btn-outline" style="width:100%;justify-content:center">Upgrade to Basic</a>
</div>
<div class="p-card pop">
<div class="p-name">Pro</div>
<div style="color:#64748b;font-size:13px">For creators & educators</div>
<div class="p-price"><span class="price-monthly">$9<span class="p-unit">/mo</span></span><span class="price-yearly" style="display:none">$7.50<span class="p-unit">/mo</span></span></div>
<div style="font-size:12px;color:var(--text-muted);margin-top:-15px;margin-bottom:15px" class="price-yearly-note">Billed $90 annually</div>
<ul class="p-list">
<li>50 published books</li><li>50 MB max file size</li><li>50,000 monthly views</li>
<li>Custom slugs & themes</li><li>Password protection</li><li>Remove branding</li><li>Detailed analytics</li>
<li>Custom domain</li><li>Private store mode</li><li>50 store members</li><li>Private book sharing</li>
</ul>
<a href="/dashboard" class="btn btn-primary" style="width:100%;justify-content:center">Upgrade to Pro</a>
</div>
<div class="p-card">
<div class="p-name">Business</div>
<div style="color:#64748b;font-size:13px">For publishers & teams</div>
<div class="p-price"><span class="price-monthly">$29<span class="p-unit">/mo</span></span><span class="price-yearly" style="display:none">$24.17<span class="p-unit">/mo</span></span></div>
<div style="font-size:12px;color:var(--text-muted);margin-top:-15px;margin-bottom:15px" class="price-yearly-note">Billed $290 annually</div>
<ul class="p-list">
<li>Unlimited books</li><li>200 MB max file size</li><li>Unlimited views</li>
<li>Everything in Pro</li><li>Custom domain</li><li>API access</li><li>Priority support</li>
<li>Unlimited store members</li><li>Export analytics data</li>
</ul>
<a href="/dashboard" class="btn btn-outline" style="width:100%;justify-content:center">Go Business</a>
</div>
</div>
<p style="text-align:center;color:#64748b;font-size:12px;margin-top:24px">All prices in USD. 10% GST will be applicable on top of the displayed price.</p>
</section>
<script>
function toggleTheme(){
const html=document.documentElement;
const current=html.getAttribute('data-theme');
const next=current==='dark'?'light':'dark';
html.setAttribute('data-theme',next);
localStorage.setItem('flipread-theme',next);
document.getElementById('theme-icon').className=next==='dark'?'fas fa-sun':'fas fa-moon';
}
function loadTheme(){
const saved=localStorage.getItem('flipread-theme')||'light';
document.documentElement.setAttribute('data-theme',saved);
document.getElementById('theme-icon').className=saved==='dark'?'fas fa-sun':'fas fa-moon';
}
loadTheme();

function toggleMenu(){
document.getElementById('mobile-menu').classList.toggle('active');
}

function toggleBilling(){
var c=document.getElementById('billing-toggle').checked;
var d=document.getElementById('toggle-dot');
d.style.transform=c?'translateX(22px)':'translateX(0)';
document.querySelectorAll('.price-monthly').forEach(function(el){el.style.display=c?'none':'inline';});
document.querySelectorAll('.price-yearly').forEach(function(el){el.style.display=c?'inline':'none';});
document.querySelectorAll('.price-yearly-note').forEach(function(el){el.style.display=c?'block':'none';});
}
toggleBilling(); // Initialize on load
</script>

<footer>© 2026 <a href="/">FlipRead</a>. Publish beautiful flipbooks from your PDFs and EPUBs.</footer>
</body></html>`;
}


export default app;
