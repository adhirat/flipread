// FlipRead — Main Worker Entry Point

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './lib/types';
import authRoutes from './routes/auth';
import bookRoutes from './routes/books';
import viewerRoutes from './routes/viewer';
import storeRoutes from './routes/store'; // public storefront
import billingRoutes from './routes/billing';
import userRoutes from './routes/user';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('/*', cors({
  origin: (origin) => origin || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/books', bookRoutes);
app.route('/api/billing', billingRoutes);
app.route('/api/user', userRoutes);

// Public Routes
app.route('/read', viewerRoutes);
app.route('/store', storeRoutes);

// Landing page
app.get('/', (c) => {
  return c.html(landingPage(c.env.APP_URL));
});

// Dashboard
app.get('/dashboard', (c) => {
  return c.html(dashboardPage(c.env.APP_URL));
});

function landingPage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>FlipRead — Turn Your PDFs & EPUBs into Beautiful Flipbooks</title>
<meta name="description" content="Upload PDFs or EPUBs and generate shareable flipbook links. Free to start.">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root[data-theme="dark"]{
  --bg-primary:#050510;
  --bg-secondary:#0d0d1a;
  --bg-card:#1a1a2e;
  --bg-elevated:#252540;
  --text-primary:#f0f4ff;
  --text-secondary:#a0aec0;
  --text-muted:#64748b;
  --accent-cyan:#00d4ff;
  --accent-magenta:#ff006e;
  --accent-purple:#8b5cf6;
  --accent-blue:#3b82f6;
  --border:rgba(255,255,255,0.08);
  --glow-cyan:rgba(0,212,255,0.4);
  --glow-magenta:rgba(255,0,110,0.3);
  --shadow:rgba(0,0,0,0.5)
}
:root[data-theme="light"]{
  --bg-primary:#ffffff;
  --bg-secondary:#f8fafc;
  --bg-card:#ffffff;
  --bg-elevated:#f1f5f9;
  --text-primary:#0f172a;
  --text-secondary:#334155;
  --text-muted:#64748b;
  --accent-cyan:#0891b2;
  --accent-magenta:#db2777;
  --accent-purple:#7c3aed;
  --accent-blue:#2563eb;
  --border:rgba(0,0,0,0.1);
  --glow-cyan:rgba(8,145,178,0.2);
  --glow-magenta:rgba(219,39,119,0.2);
  --shadow:rgba(0,0,0,0.1)
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Work Sans',sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow-x:hidden;transition:background 0.3s,color 0.3s}
body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background-image:radial-gradient(circle at 1px 1px,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:0.3;pointer-events:none;z-index:0}
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;position:fixed;top:0;width:100%;z-index:100;background:var(--bg-secondary);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 4px 30px var(--shadow)}
.logo{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;letter-spacing:2px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase;position:relative}
.logo::before{content:'';position:absolute;bottom:-4px;left:0;width:40%;height:2px;background:var(--accent-cyan);box-shadow:0 0 10px var(--glow-cyan)}
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
.p-card{background:var(--bg-card);border:2px solid var(--border);border-radius:24px;padding:40px;transition:all .4s;position:relative;overflow:hidden}
.p-card::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,var(--glow-cyan),transparent);opacity:0;animation:rotate 4s linear infinite;pointer-events:none}
.p-card:hover::after{opacity:0.1}
@keyframes rotate{to{transform:rotate(360deg)}}
.p-card.pop{border-color:var(--accent-cyan);box-shadow:0 0 40px var(--glow-cyan);position:relative}
.p-card.pop::before{content:'POPULAR';position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;font-size:11px;font-weight:700;padding:6px 18px;border-radius:50px;letter-spacing:1.5px;box-shadow:0 4px 20px var(--glow-cyan)}
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
@media(max-width:768px){nav{padding:16px 20px}.nav-links a:not(.btn){display:none}.hero{padding:120px 20px 80px}.features,.pricing{padding:80px 20px}}
</style>
</head>
<body>
<nav>
<div class="logo">FlipRead</div>
<div class="nav-links">
<a href="#features">Features</a>
<a href="#pricing">Pricing</a>
<div class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
<i class="fas fa-sun" id="theme-icon"></i>
</div>
<a href="/dashboard" class="btn btn-outline">Login</a>
<a href="/dashboard" class="btn btn-primary"><i class="fas fa-rocket"></i> Get Started</a>
</div>
</nav>

<section class="hero">
<h1>Turn Your Books into <span class="grad">Stunning Flipbooks</span></h1>
<p>Upload a PDF or EPUB, get a shareable link instantly. Your readers experience a beautiful page-flipping book — right in their browser, on any device.</p>
<div class="hero-btns">
<a href="/dashboard" class="btn btn-primary"><i class="fas fa-rocket"></i> Start Free</a>
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
<input type="checkbox" id="billing-toggle" onchange="toggleBilling()" style="opacity:0;width:0;height:0">
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
<a href="/dashboard" class="btn btn-outline" style="width:100%;justify-content:center">Get Started</a>
</div>
<div class="p-card">
<div class="p-name">Basic</div>
<div style="color:#64748b;font-size:13px">For getting started</div>
<div class="p-price"><span class="price-monthly">$2<span class="p-unit">/mo</span></span><span class="price-yearly" style="display:none">$20<span class="p-unit">/yr</span></span></div>
<ul class="p-list">
<li>2 published books</li><li>10 MB max file size</li><li>2,000 monthly views</li>
<li>Bookstore page</li><li>Basic analytics</li>
</ul>
<a href="/dashboard" class="btn btn-outline" style="width:100%;justify-content:center">Upgrade to Basic</a>
</div>
<div class="p-card pop">
<div class="p-name">Pro</div>
<div style="color:#64748b;font-size:13px">For creators & educators</div>
<div class="p-price"><span class="price-monthly">$9<span class="p-unit">/mo</span></span><span class="price-yearly" style="display:none">$90<span class="p-unit">/yr</span></span></div>
<ul class="p-list">
<li>50 published books</li><li>50 MB max file size</li><li>50,000 monthly views</li>
<li>Custom slugs & themes</li><li>Password protection</li><li>Remove branding</li><li>Detailed analytics</li>
</ul>
<a href="/dashboard" class="btn btn-primary" style="width:100%;justify-content:center">Upgrade to Pro</a>
</div>
<div class="p-card">
<div class="p-name">Business</div>
<div style="color:#64748b;font-size:13px">For publishers & teams</div>
<div class="p-price"><span class="price-monthly">$29<span class="p-unit">/mo</span></span><span class="price-yearly" style="display:none">$290<span class="p-unit">/yr</span></span></div>
<ul class="p-list">
<li>Unlimited books</li><li>200 MB max file size</li><li>Unlimited views</li>
<li>Everything in Pro</li><li>Custom domain</li><li>API access</li><li>Priority support</li>
</ul>
<a href="/dashboard" class="btn btn-outline" style="width:100%;justify-content:center">Go Business</a>
</div>
</div>
<p style="text-align:center;color:#64748b;font-size:12px;margin-top:24px">All prices in USD. GST will be added at checkout where applicable.</p>
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
const saved=localStorage.getItem('flipread-theme')||'dark';
document.documentElement.setAttribute('data-theme',saved);
document.getElementById('theme-icon').className=saved==='dark'?'fas fa-sun':'fas fa-moon';
}
loadTheme();

function toggleBilling(){
var c=document.getElementById('billing-toggle').checked;
var d=document.getElementById('toggle-dot');
d.style.transform=c?'translateX(22px)':'translateX(0)';
document.querySelectorAll('.price-monthly').forEach(function(el){el.style.display=c?'none':'inline';});
document.querySelectorAll('.price-yearly').forEach(function(el){el.style.display=c?'inline':'none';});
}
</script>

<footer>© 2026 <a href="/">FlipRead</a>. Publish beautiful flipbooks from your PDFs and EPUBs.</footer>
</body></html>`;
}

function dashboardPage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dashboard — FlipRead</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root[data-theme="dark"]{
  --bg-primary:#050510;
  --bg-secondary:#0d0d1a;
  --bg-card:#1a1a2e;
  --bg-elevated:#252540;
  --text-primary:#f0f4ff;
  --text-secondary:#a0aec0;
  --text-muted:#64748b;
  --accent-cyan:#00d4ff;
  --accent-magenta:#ff006e;
  --accent-purple:#8b5cf6;
  --accent-blue:#3b82f6;
  --border:rgba(255,255,255,0.08);
  --glow-cyan:rgba(0,212,255,0.4);
  --glow-magenta:rgba(255,0,110,0.3);
  --shadow:rgba(0,0,0,0.5)
}
:root[data-theme="light"]{
  --bg-primary:#ffffff;
  --bg-secondary:#f8fafc;
  --bg-card:#ffffff;
  --bg-elevated:#f1f5f9;
  --text-primary:#0f172a;
  --text-secondary:#334155;
  --text-muted:#64748b;
  --accent-cyan:#0891b2;
  --accent-magenta:#db2777;
  --accent-purple:#7c3aed;
  --accent-blue:#2563eb;
  --border:rgba(0,0,0,0.1);
  --glow-cyan:rgba(8,145,178,0.2);
  --glow-magenta:rgba(219,39,119,0.2);
  --shadow:rgba(0,0,0,0.1)
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Work Sans',sans-serif;background:var(--bg-primary);color:var(--text-primary);min-height:100vh;transition:background 0.3s,color 0.3s}
body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background-image:radial-gradient(circle at 1px 1px,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:0.3;pointer-events:none;z-index:0}
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;background:var(--bg-secondary);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;box-shadow:0 4px 30px var(--shadow)}
.logo{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;letter-spacing:2px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none;text-transform:uppercase;position:relative}
.logo::before{content:'';position:absolute;bottom:-4px;left:0;width:40%;height:2px;background:var(--accent-cyan);box-shadow:0 0 10px var(--glow-cyan)}
.nav-r{display:flex;gap:24px;align-items:center}
.nav-r a,.nav-r button{color:var(--text-secondary);text-decoration:none;font-size:14px;background:none;border:none;cursor:pointer;font-weight:600;transition:all .3s}
.nav-r a:hover,.nav-r button:hover{color:var(--accent-cyan);text-shadow:0 0 20px var(--glow-cyan)}
.theme-toggle{background:var(--bg-elevated);border:1px solid var(--border);border-radius:50px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;font-size:16px;color:var(--text-secondary)}
.theme-toggle:hover{border-color:var(--accent-cyan);box-shadow:0 0 20px var(--glow-cyan);transform:rotate(180deg)}
.main{max-width:1200px;margin:0 auto;padding:40px 20px;position:relative;z-index:1}
.header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;flex-wrap:wrap;gap:20px}
h2{font-family:'Rajdhani',sans-serif;font-size:32px;font-weight:700;letter-spacing:-0.5px}
.auth-box{max-width:440px;margin:100px auto;background:var(--bg-card);padding:50px;border-radius:28px;border:1px solid var(--border);box-shadow:0 25px 60px var(--shadow);position:relative;overflow:hidden}
.auth-box::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,var(--glow-cyan),transparent);opacity:0.1;animation:rotate 6s linear infinite;pointer-events:none}
@keyframes rotate{to{transform:rotate(360deg)}}
.auth-box h2{text-align:center;margin-bottom:36px;font-family:'Rajdhani',sans-serif;font-size:32px}
.auth-box input{width:100%;padding:16px;border-radius:14px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-size:15px;margin-bottom:18px;outline:none;transition:all .3s}
.auth-box input:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 3px var(--glow-cyan)}
.auth-box button{width:100%;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;font-weight:700;font-size:15px;cursor:pointer;transition:all .3s;text-transform:uppercase;letter-spacing:1px}
.auth-box button:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--glow-magenta)}
.auth-box .toggle{text-align:center;margin-top:24px;font-size:14px;color:var(--text-secondary)}
.auth-box .toggle a{color:var(--accent-cyan);cursor:pointer;font-weight:700;transition:color .3s}
.auth-box .toggle a:hover{color:var(--accent-magenta)}
.upload-zone{background:var(--bg-card);border:2px dashed var(--border);border-radius:24px;padding:70px;text-align:center;cursor:pointer;transition:all .4s;margin-bottom:50px;position:relative;overflow:hidden}
.upload-zone::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--glow-cyan),var(--glow-magenta));opacity:0;transition:opacity .4s}
.upload-zone:hover{border-color:var(--accent-cyan);background:var(--bg-elevated);box-shadow:0 0 40px var(--glow-cyan)}
.upload-zone:hover::before{opacity:0.05}
.upload-zone i{font-size:56px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:20px;filter:drop-shadow(0 0 20px var(--glow-cyan))}
.upload-zone p{color:var(--text-secondary);font-size:16px;font-weight:500}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:32px;margin-bottom:28px;transition:all .3s}
.card:hover{border-color:var(--accent-purple);box-shadow:0 8px 40px var(--shadow)}
.book-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:28px}
.book-item{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .4s;position:relative}
.book-item::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--glow-cyan),var(--glow-magenta));opacity:0;transition:opacity .4s;pointer-events:none}
.book-item:hover{border-color:var(--accent-cyan);transform:translateY(-6px);box-shadow:0 20px 60px var(--shadow)}
.book-item:hover::before{opacity:0.05}
.book-cover-mini{height:180px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--border)}
.book-cover-mini img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.book-item:hover .book-cover-mini img{transform:scale(1.05)}
.book-content{padding:20px}
.book-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:17px;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0.5px}
.book-meta{font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.book-actions{display:flex;gap:10px;margin-top:16px}
.book-actions button{flex:1;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-secondary);padding:10px;border-radius:12px;cursor:pointer;font-size:12px;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600}
.book-actions button:hover{background:var(--accent-purple);color:#fff;border-color:var(--accent-purple);box-shadow:0 4px 20px var(--glow-magenta)}
.book-actions .del:hover{background:var(--accent-magenta);border-color:var(--accent-magenta)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:50px}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:32px;position:relative;overflow:hidden;transition:all .3s}
.stat-card::after{content:'';position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,var(--glow-cyan),transparent);opacity:0;animation:rotate 8s linear infinite}
.stat-card:hover{border-color:var(--accent-cyan);box-shadow:0 8px 40px var(--shadow)}
.stat-card:hover::after{opacity:0.05}
.stat-val{font-family:'Rajdhani',sans-serif;font-size:42px;font-weight:700;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.stat-label{font-size:14px;color:var(--text-secondary);font-weight:600;letter-spacing:0.5px}
.stat-upgrade{position:absolute;top:24px;right:24px}
.btn-upg{font-size:11px;padding:6px 16px;border-radius:50px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;border:none;cursor:pointer;font-weight:700;text-transform:uppercase;letter-spacing:1px;transition:all .3s;box-shadow:0 4px 20px var(--glow-cyan)}
.btn-upg:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--glow-magenta)}
.msg{padding:16px 24px;border-radius:14px;font-size:14px;margin-bottom:28px;display:none;animation:slideIn 0.4s;font-weight:600;letter-spacing:0.3px}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
.msg.success{display:block;background:rgba(0,212,255,0.1);color:var(--accent-cyan);border:1px solid var(--accent-cyan);box-shadow:0 4px 20px var(--glow-cyan)}
.msg.error{display:block;background:rgba(255,0,110,0.1);color:var(--accent-magenta);border:1px solid var(--accent-magenta);box-shadow:0 4px 20px var(--glow-magenta)}
.plan-badge{font-size:11px;padding:5px 14px;border-radius:50px;font-weight:700;text-transform:uppercase;margin-left:10px;letter-spacing:1px;box-shadow:0 2px 10px var(--glow-cyan)}
.plan-free{background:rgba(148,163,184,0.15);color:var(--text-muted);border:1px solid var(--border)}
.plan-basic{background:rgba(0,212,255,0.15);color:var(--accent-cyan);border:1px solid var(--accent-cyan)}
.plan-pro{background:rgba(139,92,246,0.15);color:var(--accent-purple);border:1px solid var(--accent-purple)}
.plan-business{background:rgba(255,0,110,0.15);color:var(--accent-magenta);border:1px solid var(--accent-magenta)}
.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(10px)}
.modal-content{background:var(--bg-card);width:100%;max-width:540px;border-radius:28px;padding:50px;position:relative;border:1px solid var(--border);box-shadow:0 25px 80px var(--shadow);animation:modalPop 0.3s}
@keyframes modalPop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
.close-btn{position:absolute;top:24px;right:24px;color:var(--text-muted);cursor:pointer;font-size:24px;transition:all .3s;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bg-elevated)}
.close-btn:hover{color:var(--accent-magenta);background:var(--accent-magenta);color:#fff;transform:rotate(90deg)}
.form-group{margin-bottom:24px}
.form-group label{display:block;font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px}
.form-group input,.form-group textarea,.form-group select{width:100%;padding:14px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);outline:none;transition:all .3s;font-family:'Work Sans',sans-serif}
.form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 3px var(--glow-cyan)}
.tab-row{display:flex;gap:32px;border-bottom:2px solid var(--border);margin-bottom:40px}
.tab{font-family:'Rajdhani',sans-serif;padding:16px 8px;font-size:18px;font-weight:700;color:var(--text-muted);cursor:pointer;position:relative;transition:all .3s;letter-spacing:0.5px;text-transform:uppercase}
.tab:hover{color:var(--text-secondary)}
.tab.active{color:var(--text-primary)}
.tab.active::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:3px;background:linear-gradient(90deg,var(--accent-cyan),var(--accent-magenta));box-shadow:0 0 10px var(--glow-cyan)}
.hidden{display:none}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<nav>
<a href="/" class="logo">FlipRead</a>
<div class="nav-r" id="nav-auth">
<span id="user-info"></span>
<div class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
<i class="fas fa-sun" id="theme-icon"></i>
</div>
<button onclick="logout()">Logout</button>
</div>
</nav>

<div class="main">
<!-- Auth View -->
<div id="auth-view" class="auth-box hidden">
<h2 id="auth-title">Welcome back</h2>
<div id="auth-msg" class="msg"></div>
<input id="auth-name" placeholder="Full Name" class="hidden">
<input id="auth-email" placeholder="Email Address" type="email">
<input id="auth-pass" placeholder="Password" type="password">
<button onclick="submitAuth()" id="auth-btn">Sign In</button>
<div class="toggle"><span id="auth-toggle-text">New to FlipRead?</span> <a onclick="toggleAuthMode()" id="auth-toggle-link">Create account</a></div>
</div>

<!-- Dashboard View -->
<div id="dash-view" class="hidden">
<div class="header-row">
<h2 id="dash-title">Library</h2>
<div id="dash-msg" class="msg" style="margin-bottom:0;margin-left:20px;flex:1"></div>
<a href="#" id="store-link-top" target="_blank" style="color:var(--p-500);font-weight:600;text-decoration:none;font-size:14px"><i class="fas fa-store"></i> View My Store</a>
</div>

<div class="stats">
<div class="stat-card">
  <div class="stat-val" id="s-books">0</div>
  <div class="stat-label">Published Books</div>
</div>
<div class="stat-card">
  <div class="stat-val" id="s-views">0</div>
  <div class="stat-label">Total Read Views</div>
</div>
<div class="stat-card">
  <div class="stat-val" id="s-plan-text">Free</div>
  <div class="stat-label">Current Plan</div>
  <div class="stat-upgrade" id="upgrade-area">
    <button class="btn-upg" onclick="showModal('upgrade-modal')">Upgrade</button>
  </div>
</div>
</div>

<div class="tab-row">
<div class="tab active" onclick="switchTab('books')">My Books</div>
<div class="tab" onclick="switchTab('store')">Store Customization</div>
</div>

<div id="books-tab">
  <div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()">
  <i class="fas fa-plus-circle"></i>
  <p>Drop a PDF or EPUB file to publish</p>
  <p style="font-size:12px;margin-top:8px;color:#475569" id="limit-text"></p>
  </div>
  <input type="file" id="file-input" accept=".pdf,.epub" style="display:none" onchange="uploadBook(event)">

  <div class="book-grid" id="book-grid"></div>
</div>

<div id="store-tab" class="hidden">
  <div class="card">
    <div class="form-group">
      <label>Store Name</label>
      <input type="text" id="st-name" placeholder="e.g. My Awesome Collection">
    </div>
    <div class="form-group">
      <label>Store Logo</label>
      <div style="display:flex;gap:16px;align-items:center">
        <div id="st-logo-preview" style="width:60px;height:60px;background:#000;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center">
          <i class="fas fa-image" style="opacity:0.2"></i>
        </div>
        <button class="btn-upg" style="background:#1e293b" onclick="document.getElementById('logo-input').click()">Upload New Label</button>
      </div>
      <input type="file" id="logo-input" accept="image/*" style="display:none" onchange="uploadLogo(event)">
    </div>
    <div class="form-group">
      <label>Store Description</label>
      <textarea id="st-desc" rows="3" placeholder="A brief about your collection..."></textarea>
    </div>
    <div class="form-group">
      <label>Privacy Policy URL (Optional)</label>
      <input type="text" id="st-privacy" placeholder="https://...">
    </div>
    <div class="form-group">
      <label>Terms of Service URL (Optional)</label>
      <input type="text" id="st-terms" placeholder="https://...">
    </div>
    <button onclick="saveStoreSettings()" class="auth-box button" style="width:auto;padding:12px 30px">Save Storefront</button>
  </div>
</div>
</div>
</div>

<!-- Edit Book Modal -->
<div id="edit-modal" class="modal">
<div class="modal-content">
<div class="close-btn" onclick="hideModal('edit-modal')">&times;</div>
<h2 style="margin-bottom:24px">Edit Book</h2>
<input type="hidden" id="edit-id">
<div class="form-group">
  <label>Title</label>
  <input type="text" id="edit-title">
</div>
<div class="form-group">
  <label>Cover Image</label>
  <div style="display:flex;gap:16px;align-items:center">
    <div id="edit-cover-preview" style="width:50px;height:70px;background:#000;border-radius:6px;overflow:hidden"></div>
    <button class="btn-upg" style="background:#1e293b" onclick="document.getElementById('cover-input').click()">Change Cover</button>
  </div>
  <input type="file" id="cover-input" accept="image/*" style="display:none" onchange="uploadCover(event)">
</div>
<div class="form-group">
  <label>Visibility</label>
  <select id="edit-public">
    <option value="1">Public (Show on Store)</option>
    <option value="0">Private (Link only)</option>
  </select>
</div>
<div class="form-group" id="pass-group">
  <label>Password Protection <span style="font-size:11px;color:var(--p-500)" id="pass-note"></span></label>
  <input type="password" id="edit-pass" placeholder="Leave empty for no password">
</div>
<button onclick="saveBook()" class="auth-box button">Save Changes</button>
</div>
</div>

<!-- Upgrade Modal -->
<div id="upgrade-modal" class="modal">
<div class="modal-content" style="max-width:400px;text-align:center">
<div class="close-btn" onclick="hideModal('upgrade-modal')">&times;</div>
<h2 style="margin-bottom:12px">Upgrade Plan</h2>
<p style="color:var(--text-muted);font-size:14px;margin-bottom:30px">Choose a plan to unlock higher limits and password protection.</p>
<div style="display:flex;background:var(--bg-900);padding:4px;border-radius:100px;margin-bottom:30px">
  <button id="int-monthly" onclick="setInt('monthly')" style="flex:1;border:none;background:var(--p-500);color:#fff;padding:8px;border-radius:100px;font-weight:600;font-size:13px;cursor:pointer">Monthly</button>
  <button id="int-yearly" onclick="setInt('yearly')" style="flex:1;border:none;background:none;color:var(--text-muted);padding:8px;border-radius:100px;font-weight:600;font-size:13px;cursor:pointer">Yearly (Save 20%)</button>
</div>
<div class="card" style="margin-bottom:16px">
  <h3 style="margin-bottom:8px">Basic</h3>
  <div style="font-size:32px;font-weight:700;margin-bottom:16px" id="basic-price">$2/mo</div>
  <ul style="text-align:left;font-size:13px;color:var(--text-muted);margin-bottom:20px;list-style:none">
    <li><i class="fas fa-check" style="color:#4ade80"></i> 2 Books · 10 MB each</li>
    <li><i class="fas fa-check" style="color:#4ade80"></i> 2,000 Monthly Views</li>
  </ul>
  <button class="auth-box button" onclick="checkout('basic')" style="background:var(--bg-700)">Select Basic</button>
</div>
<div class="card" style="border:1px solid #3b82f6;background:rgba(59,130,246,0.05);margin-bottom:16px">
  <h3 style="margin-bottom:8px">Pro Plan</h3>
  <div style="font-size:32px;font-weight:700;margin-bottom:16px" id="pro-price">$9/mo</div>
  <ul style="text-align:left;font-size:13px;color:var(--text-muted);margin-bottom:20px;list-style:none">
    <li><i class="fas fa-check" style="color:#4ade80"></i> 50 MB Upload Limit</li>
    <li><i class="fas fa-check" style="color:#4ade80"></i> Password Protection</li>
    <li><i class="fas fa-check" style="color:#4ade80"></i> Custom Cover Images</li>
  </ul>
  <button class="auth-box button" onclick="checkout('pro')">Select Pro</button>
</div>
<div class="card">
  <h3 style="margin-bottom:8px">Business</h3>
  <div style="font-size:32px;font-weight:700;margin-bottom:16px" id="biz-price">$29/mo</div>
  <button class="auth-box button" onclick="checkout('business')" style="background:var(--bg-700)">Select Business</button>
</div>
</div>
</div>

<script>
const API = '';
let currentUser = null;
let currentBooks = [];
let isRegister = false;
let currentInterval = 'monthly';

async function checkAuth() {
  try {
    const res = await fetch(API + '/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    if (data.user) { currentUser = data.user; showDashboard(); }
    else { showAuth(); }
  } catch { showAuth(); }
}

function showAuth() {
  document.getElementById('auth-view').classList.remove('hidden');
  document.getElementById('dash-view').classList.add('hidden');
  document.getElementById('nav-auth').style.display = 'none';
}

function showDashboard() {
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('dash-view').classList.remove('hidden');
  document.getElementById('nav-auth').style.display = 'flex';
  
  const userInfo = document.getElementById('user-info');
  userInfo.innerHTML = '<span style="font-weight:600">' + esc(currentUser.name || currentUser.email) + '</span>' + 
                      '<span class="plan-badge plan-' + currentUser.plan + '">' + currentUser.plan + '</span>';
  
  document.getElementById('s-plan-text').textContent = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
  document.getElementById('upgrade-area').classList.toggle('hidden', currentUser.plan === 'business');
  
  const username = (currentUser.name || 'user').toLowerCase().replace(/\\s+/g, '-');
  document.getElementById('store-link-top').href = '/store/' + encodeURIComponent(username);
  
  const limits = { free: '5 MB', basic: '10 MB', pro: '50 MB', business: '200 MB' };
  document.getElementById('limit-text').textContent = 'Max ' + (limits[currentUser.plan] || '5 MB') + ' per book';

  // Load store settings into inputs
  document.getElementById('st-name').value = currentUser.store_name || '';
  const st = JSON.parse(currentUser.store_settings || '{}');
  document.getElementById('st-desc').value = st.description || '';
  document.getElementById('st-privacy').value = st.privacy_policy || '';
  document.getElementById('st-terms').value = st.terms || '';
  if (currentUser.store_logo_url) {
    document.getElementById('st-logo-preview').innerHTML = '<img src="' + esc(currentUser.store_logo_url) + '" style="width:100%;height:100%;object-fit:cover">';
  }

  loadBooks();
}

function toggleAuthMode() {
  isRegister = !isRegister;
  document.getElementById('auth-title').textContent = isRegister ? 'Create your account' : 'Welcome back';
  document.getElementById('auth-btn').textContent = isRegister ? 'Create Account' : 'Sign In';
  document.getElementById('auth-name').classList.toggle('hidden', !isRegister);
  document.getElementById('auth-toggle-text').textContent = isRegister ? 'Already have an account?' : 'New to FlipRead?';
  document.getElementById('auth-toggle-link').textContent = isRegister ? 'Sign In' : 'Create account';
}

async function submitAuth() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;
  const name = document.getElementById('auth-name').value;
  const msgEl = document.getElementById('auth-msg');

  const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
  const body = isRegister ? { email, password, name } : { email, password };

  try {
    const res = await fetch(API + endpoint, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.user) { currentUser = data.user; showDashboard(); }
    else { msgEl.textContent = data.error || 'Failed'; msgEl.className = 'msg error'; }
  } catch { msgEl.textContent = 'Network error'; msgEl.className = 'msg error'; }
}

async function logout() {
  await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' });
  currentUser = null; showAuth();
}

async function loadBooks() {
  try {
    const res = await fetch(API + '/api/books', { credentials: 'include' });
    const data = await res.json();
    const grid = document.getElementById('book-grid');
    currentBooks = data.books || [];
    document.getElementById('s-books').textContent = currentBooks.length;
    document.getElementById('s-views').textContent = currentBooks.reduce(function(s, b) { return s + b.view_count; }, 0);

    if (currentBooks.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:100px 20px;color:var(--text-muted)"><i class="fas fa-book-open" style="font-size:48px;display:block;margin-bottom:20px;opacity:0.2"></i>Your library is empty.</div>';
      return;
    }

    grid.innerHTML = currentBooks.map(function(b) {
      const url = location.origin + '/read/' + b.slug;
      return '<div class="book-item">' + 
        '<div class="book-cover-mini">' + 
          (b.cover_url ? '<img src="' + esc(b.cover_url) + '">' : '<i class="fas fa-file-' + (b.type === 'pdf' ? 'pdf' : 'book') + '" style="font-size:40px;color:rgba(255,255,255,0.1)"></i>') +
        '</div>' +
        '<div class="book-content">' +
          '<div class="book-title">' + esc(b.title) + '</div>' +
          '<div class="book-meta"><span>' + b.type.toUpperCase() + ' &#183; ' + formatSize(b.file_size_bytes) + '</span><span><i class="fas fa-eye"></i> ' + b.view_count + '</span></div>' +
          '<div class="book-actions">' +
            '<button title="Edit" onclick="editBook(\\'' + b.id + '\\')"><i class="fas fa-pen"></i> Edit</button>' +
            '<button title="Copy Link" onclick="copyText(\\'' + esc(url) + '\\', this)"><i class="fas fa-link"></i></button>' +
            '<button title="View" onclick="window.open(\\'' + esc(url) + '\\',\\'_blank\\')"><i class="fas fa-external-link-alt"></i></button>' +
            '<button class="del" title="Delete" onclick="deleteBook(\\'' + b.id + '\\')"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) { console.error(e); }
}

function switchTab(t) {
  document.getElementById('books-tab').classList.toggle('hidden', t !== 'books');
  document.getElementById('store-tab').classList.toggle('hidden', t !== 'store');
  const tabs = document.querySelectorAll('.tab');
  tabs[0].classList.toggle('active', t === 'books');
  tabs[1].classList.toggle('active', t === 'store');
}

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }

function editBook(id) {
  const b = currentBooks.find(function(x) { return x.id === id; });
  if (!b) return;
  document.getElementById('edit-id').value = b.id;
  document.getElementById('edit-title').value = b.title;
  document.getElementById('edit-public').value = b.is_public;
  document.getElementById('edit-pass').value = b.password || '';
  var noPass = currentUser.plan === 'free' || currentUser.plan === 'basic';
  document.getElementById('edit-pass').disabled = noPass;
  document.getElementById('pass-note').textContent = noPass ? '(Requires Pro)' : '';
  
  if (b.cover_url) {
    document.getElementById('edit-cover-preview').innerHTML = '<img src="' + esc(b.cover_url) + '" style="width:100%;height:100%;object-fit:cover">';
  } else {
    document.getElementById('edit-cover-preview').innerHTML = '';
  }
  showModal('edit-modal');
}

async function saveBook() {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const is_public = parseInt(document.getElementById('edit-public').value);
  const password = document.getElementById('edit-pass').value || null;

  try {
    const res = await fetch(API + '/api/books/' + id, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, is_public, password })
    });
    if (res.ok) { hideModal('edit-modal'); loadBooks(); }
  } catch(e) { alert('Failed to save'); }
}

async function uploadBook(e) {
  const file = e.target.files[0];
  if (!file) return;
  const msgEl = document.getElementById('dash-msg');
  msgEl.textContent = 'Uploading high-quality file...'; msgEl.className = 'msg success';

  const fd = new FormData();
  fd.append('file', file);
  fd.append('title', file.name.replace(/\\.(pdf|epub)$/i, ''));

  try {
    const res = await fetch(API + '/api/books/upload', {
      method: 'POST', credentials: 'include', body: fd
    });
    const data = await res.json();
    if (data.book) {
      msgEl.textContent = 'Published successfully!';
      msgEl.className = 'msg success';
      loadBooks();
    } else {
      msgEl.textContent = data.error || 'Upload failed';
      msgEl.className = 'msg error';
    }
  } catch { msgEl.textContent = 'Upload failed'; msgEl.className = 'msg error'; }
  e.target.value = '';
}

async function uploadCover(e) {
  const file = e.target.files[0];
  if (!file) return;
  const id = document.getElementById('edit-id').value;
  
  const fd = new FormData();
  fd.append('cover', file);
  
  try {
    const res = await fetch(API + '/api/books/' + id + '/cover', {
      method: 'POST', credentials: 'include', body: fd
    });
    const data = await res.json();
    if (data.cover_url) {
      document.getElementById('edit-cover-preview').innerHTML = '<img src="' + esc(data.cover_url) + '" style="width:100%;height:100%;object-fit:cover">';
      loadBooks();
    }
  } catch(e) { alert('Upload failed'); }
}

async function uploadLogo(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('logo', file);
  try {
    const res = await fetch(API + '/api/user/store/logo', {
      method: 'POST', credentials: 'include', body: fd
    });
    const data = await res.json();
    if (data.logo_url) {
      document.getElementById('st-logo-preview').innerHTML = '<img src="' + esc(data.logo_url) + '" style="width:100%;height:100%;object-fit:cover">';
    }
  } catch(e) { alert('Upload failed'); }
}

async function saveStoreSettings() {
  const store_name = document.getElementById('st-name').value;
  const store_settings = {
    description: document.getElementById('st-desc').value,
    privacy_policy: document.getElementById('st-privacy').value,
    terms: document.getElementById('st-terms').value
  };
  
  try {
    const res = await fetch(API + '/api/user/store', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_name, store_settings })
    });
    if (res.ok) { 
      const msgEl = document.getElementById('dash-msg');
      msgEl.textContent = 'Storefront updated!'; msgEl.className = 'msg success';
      setTimeout(() => msgEl.className = 'msg', 3000);
    }
  } catch(e) { alert('Failed to save'); }
}

async function checkout(plan) {
  try {
    const res = await fetch(API + '/api/billing/checkout', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, interval: currentInterval })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || 'Failed to start checkout');
  } catch { alert('Network error'); }
}

function setInt(val) {
  currentInterval = val;
  document.getElementById('int-monthly').style.background = val === 'monthly' ? 'var(--p-500)' : 'none';
  document.getElementById('int-monthly').style.color = val === 'monthly' ? '#fff' : 'var(--text-muted)';
  document.getElementById('int-yearly').style.background = val === 'yearly' ? 'var(--p-500)' : 'none';
  document.getElementById('int-yearly').style.color = val === 'yearly' ? '#fff' : 'var(--text-muted)';
  document.getElementById('basic-price').textContent = val === 'monthly' ? '$2/mo' : '$20/yr';
  document.getElementById('pro-price').textContent = val === 'monthly' ? '$9/mo' : '$89/yr';
  document.getElementById('biz-price').textContent = val === 'monthly' ? '$29/mo' : '$289/yr';
}

async function deleteBook(id) {
  if (!confirm('Permanently delete this book?')) return;
  await fetch(API + '/api/books/' + id, { method: 'DELETE', credentials: 'include' });
  loadBooks();
}

function copyText(txt, btn) { 
  navigator.clipboard.writeText(txt); 
  const old = btn.innerHTML; 
  btn.innerHTML = '<i class="fas fa-check"></i>'; 
  setTimeout(() => btn.innerHTML = old, 2000); 
}

function formatSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleTheme(){
const html=document.documentElement;
const current=html.getAttribute('data-theme');
const next=current==='dark'?'light':'dark';
html.setAttribute('data-theme',next);
localStorage.setItem('flipread-theme',next);
document.getElementById('theme-icon').className=next==='dark'?'fas fa-sun':'fas fa-moon';
}
function loadTheme(){
const saved=localStorage.getItem('flipread-theme')||'dark';
document.documentElement.setAttribute('data-theme',saved);
const icon=document.getElementById('theme-icon');
if(icon)icon.className=saved==='dark'?'fas fa-sun':'fas fa-moon';
}
loadTheme();

checkAuth();
</script>
</body></html>`;
}

export default app;
