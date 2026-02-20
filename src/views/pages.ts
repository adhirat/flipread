// FlipRead — Static Pages (Privacy, Terms, Contact, Documentation)

function pageShell(title: string, description: string, appUrl: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — FlipRead</title>
<meta name="description" content="${description}">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:title" content="${title} — FlipRead">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${appUrl}/logo.png">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
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
  --border:rgba(255,255,255,0.08);
  --glow-cyan:rgba(99, 102, 241, 0.4);
  --glow-magenta:rgba(244, 114, 182, 0.3);
  --shadow:rgba(0,0,0,0.5)
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Work Sans',sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow-x:hidden;transition:background 0.3s,color 0.3s}
body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background-image:radial-gradient(circle at 1px 1px,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:0.3;pointer-events:none;z-index:0}
nav{display:flex;justify-content:space-between;align-items:center;padding:10px 40px;position:fixed;top:0;width:100%;z-index:100;background:var(--bg-secondary);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 4px 30px var(--shadow)}
.logo{display:flex;align-items:center;gap:8px;text-decoration:none}
.logo img{height:26px;width:auto}
.logo span{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;letter-spacing:2px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{color:var(--text-secondary);text-decoration:none;font-size:14px;font-weight:600;transition:all .3s;letter-spacing:0.5px}
.nav-links a:hover{color:var(--accent-cyan)}
.theme-toggle{background:var(--bg-elevated);border:1px solid var(--border);border-radius:50px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;font-size:15px;color:var(--text-secondary)}
.theme-toggle:hover{border-color:var(--accent-cyan);box-shadow:0 0 20px var(--glow-cyan);transform:rotate(180deg)}
.btn{padding:9px 22px;border-radius:50px;font-weight:700;font-size:13px;cursor:pointer;transition:all .3s;text-decoration:none;display:inline-flex;align-items:center;gap:8px;border:none;text-transform:uppercase;letter-spacing:1px}
.btn-primary{background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));color:#fff;box-shadow:0 8px 30px var(--glow-magenta)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px var(--glow-cyan)}
.btn-outline{background:transparent;color:var(--text-primary);border:2px solid var(--accent-purple)}
.btn-outline:hover{border-color:var(--accent-cyan);background:var(--bg-elevated)}
.menu-btn{display:none;background:none;border:none;color:var(--text-primary);font-size:20px;cursor:pointer;padding:5px}

/* Page Content */
.page-container{max-width:800px;margin:0 auto;padding:120px 40px 80px;position:relative;z-index:1}
.page-breadcrumb{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);margin-bottom:32px}
.page-breadcrumb a{color:var(--accent-cyan);text-decoration:none;transition:color .3s}
.page-breadcrumb a:hover{color:var(--accent-magenta)}
.page-title{font-family:'Rajdhani',sans-serif;font-size:clamp(32px,5vw,48px);font-weight:700;margin-bottom:8px;letter-spacing:-0.5px}
.page-subtitle{color:var(--text-muted);font-size:15px;margin-bottom:48px;padding-bottom:32px;border-bottom:1px solid var(--border)}
.page-content h2{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;margin:40px 0 16px;padding-top:20px;letter-spacing:0.3px;color:var(--text-primary)}
.page-content h3{font-family:'Rajdhani',sans-serif;font-size:19px;font-weight:600;margin:28px 0 12px;color:var(--text-primary)}
.page-content p{color:var(--text-secondary);font-size:15px;line-height:1.9;margin-bottom:16px}
.page-content ul,.page-content ol{color:var(--text-secondary);font-size:15px;line-height:1.9;margin:12px 0 20px 24px}
.page-content li{margin-bottom:8px}
.page-content a{color:var(--accent-cyan);text-decoration:none;transition:color .3s}
.page-content a:hover{color:var(--accent-magenta)}
.page-content strong{color:var(--text-primary);font-weight:600}
.page-content .highlight-box{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px 28px;margin:24px 0;border-left:4px solid var(--accent-cyan)}
.page-content .highlight-box p{margin-bottom:0}
.page-content code{background:var(--bg-elevated);padding:2px 8px;border-radius:6px;font-size:14px;font-family:'SF Mono',Consolas,monospace;color:var(--accent-cyan)}
.page-content pre{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px 24px;margin:16px 0 24px;overflow-x:auto}
.page-content pre code{background:none;padding:0;font-size:13px;line-height:1.7;color:var(--text-secondary)}
.page-content table{width:100%;border-collapse:collapse;margin:20px 0 28px;font-size:14px}
.page-content table th,.page-content table td{text-align:left;padding:12px 16px;border-bottom:1px solid var(--border)}
.page-content table th{font-weight:600;color:var(--text-primary);background:var(--bg-secondary);font-family:'Rajdhani',sans-serif;font-size:15px;letter-spacing:0.3px}
.page-content table td{color:var(--text-secondary)}
.page-content table tr:hover td{background:var(--bg-secondary)}

/* Contact cards */
.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin:32px 0}
.contact-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center;transition:all .3s}
.contact-card:hover{border-color:var(--accent-cyan);transform:translateY(-4px);box-shadow:0 12px 40px var(--shadow)}
.contact-card i{font-size:28px;margin-bottom:14px;display:block;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.contact-card h3{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px}
.contact-card p{color:var(--text-muted);font-size:13px;margin-bottom:14px}
.contact-card a{color:var(--accent-cyan);font-size:14px;font-weight:600;text-decoration:none;transition:color .3s}
.contact-card a:hover{color:var(--accent-magenta)}

/* API endpoint cards */
.endpoint{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:18px 22px;margin:12px 0;display:flex;align-items:center;gap:14px;transition:all .3s}
.endpoint:hover{border-color:var(--accent-cyan);box-shadow:0 4px 20px var(--shadow)}
.endpoint .method{font-family:'SF Mono',Consolas,monospace;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;letter-spacing:0.5px;flex-shrink:0}
.method-get{background:#dcfce7;color:#166534}
.method-post{background:#dbeafe;color:#1e40af}
.method-patch{background:#fef9c3;color:#854d0e}
.method-delete{background:#fecaca;color:#991b1b}
:root[data-theme="dark"] .method-get{background:#052e16;color:#86efac}
:root[data-theme="dark"] .method-post{background:#172554;color:#93c5fd}
:root[data-theme="dark"] .method-patch{background:#422006;color:#fde68a}
:root[data-theme="dark"] .method-delete{background:#450a0a;color:#fca5a5}
.endpoint .path{font-family:'SF Mono',Consolas,monospace;font-size:13px;color:var(--text-primary);font-weight:500}
.endpoint .desc{color:var(--text-muted);font-size:13px;margin-left:auto}

/* Footer */
footer{padding:80px 40px 0;border-top:1px solid var(--border);position:relative;z-index:1;background:var(--bg-secondary)}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;max-width:1200px;margin:0 auto;padding-bottom:50px}
.footer-brand p{color:var(--text-secondary);font-size:14px;line-height:1.8;margin-top:16px;max-width:280px}
.footer-col h4{font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;margin-bottom:18px;letter-spacing:0.5px;text-transform:uppercase;color:var(--text-primary)}
.footer-col a{display:block;color:var(--text-muted);text-decoration:none;font-size:14px;padding:5px 0;transition:color .3s}
.footer-col a:hover{color:var(--accent-cyan)}
.footer-social{display:flex;gap:14px;margin-top:20px}
.footer-social a{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-muted);font-size:15px;transition:all .3s;padding:0}
.footer-social a:hover{border-color:var(--accent-cyan);color:var(--accent-cyan);box-shadow:0 0 15px var(--glow-cyan);transform:translateY(-2px)}
.footer-bottom{max-width:1200px;margin:0 auto;padding:24px 0;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--text-muted)}
.footer-bottom a{color:var(--accent-cyan);text-decoration:none;transition:color .3s}
.footer-bottom a:hover{color:var(--accent-magenta)}
@media(max-width:768px){
  nav{padding:8px 20px}
  .nav-links{display:none}
  .menu-btn{display:block}
  .page-container{padding:100px 20px 60px}
  .contact-grid{grid-template-columns:1fr}
  .endpoint{flex-wrap:wrap}
  .endpoint .desc{margin-left:0;width:100%;margin-top:4px}
  .footer-grid{grid-template-columns:1fr 1fr;gap:30px}
  .footer-bottom{flex-direction:column;gap:10px;text-align:center}
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
<a href="/#features">Features</a>
<a href="/#pricing">Pricing</a>
<a href="/dashboard" class="btn btn-outline">Login</a>
<a href="/dashboard?mode=register" class="btn btn-primary"><i class="fas fa-rocket"></i> Get Started</a>
</div>
<button class="menu-btn" onclick="document.getElementById('mobile-menu').classList.toggle('active')"><i class="fas fa-bars"></i></button>
</div>
</nav>

<div class="page-container">
<div class="page-breadcrumb">
<a href="/">Home</a> <span>›</span> <span>${title}</span>
</div>
${content}
</div>

<footer>
<div class="footer-grid">
<div class="footer-brand">
<a href="/" class="logo">
  <img src="/logo.png" alt="FlipRead Logo">
  <span>FlipRead</span>
</a>
<p>Transform your PDFs and EPUBs into beautiful, interactive flipbooks. Share your content with the world — instantly.</p>
<div class="footer-social">
<a href="https://x.com/adhirattech" target="_blank" title="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
<a href="https://www.linkedin.com/company/aadhirat" target="_blank" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
<a href="https://www.youtube.com/@adhirattech" target="_blank" title="YouTube"><i class="fab fa-youtube"></i></a>
<a href="https://github.com/adhirat" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
</div>
</div>
<div class="footer-col">
<h4>Product</h4>
<a href="/#features">Features</a>
<a href="/#pricing">Pricing</a>
<a href="/dashboard">Dashboard</a>
<a href="/docs">Documentation</a>
</div>
<div class="footer-col">
<h4>Resources</h4>
<a href="/dashboard?mode=register">Get Started</a>
<a href="/#pricing">Compare Plans</a>
<a href="/api/swagger">API Reference</a>
</div>
<div class="footer-col">
<h4>Legal</h4>
<a href="/privacy">Privacy Policy</a>
<a href="/terms">Terms & Conditions</a>
<a href="/contact">Contact</a>
</div>
</div>
<div class="footer-bottom">
<span>© 2026 <a href="/">FlipRead</a> by <a href="https://adhirat.com" target="_blank">Adhirat</a>. All rights reserved.</span>
<span>Made with <span style="color:var(--accent-magenta)">♥</span> on Cloudflare Workers</span>
</div>
</footer>

<script>
function toggleTheme(){
const html=document.documentElement;
const current=html.getAttribute('data-theme');
const next=current==='dark'?'light':'dark';
html.setAttribute('data-theme',next);
localStorage.setItem('flipread-theme',next);
document.getElementById('theme-icon').className=next==='dark'?'fas fa-sun':'fas fa-moon';
}
(function(){
const saved=localStorage.getItem('flipread-theme')||'light';
document.documentElement.setAttribute('data-theme',saved);
document.getElementById('theme-icon').className=saved==='dark'?'fas fa-sun':'fas fa-moon';
})();
</script>
</body></html>`;
}


// ── Privacy Policy ──────────────────────────────────────────────────
export function privacyPage(appUrl: string): string {
  return pageShell(
    'Privacy Policy',
    'Learn how FlipRead collects, uses, and protects your personal information.',
    appUrl,
    `
<h1 class="page-title">Privacy Policy</h1>
<p class="page-subtitle">Last updated: February 20, 2026</p>
<div class="page-content">

<div class="highlight-box">
<p>FlipRead is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform.</p>
</div>

<h2>1. Information We Collect</h2>
<h3>Account Information</h3>
<p>When you create an account, we collect your <strong>name</strong>, <strong>email address</strong>, and <strong>password</strong> (stored securely using industry-standard hashing). If you sign in with Google, we receive your name and email from Google's OAuth service.</p>

<h3>Content You Upload</h3>
<p>We store the files you upload (PDFs, EPUBs) and associated metadata such as book titles, cover images, and descriptions. These files are stored securely on Cloudflare R2 object storage.</p>

<h3>Usage Data</h3>
<p>We automatically collect:</p>
<ul>
<li>Page view counts for your published books</li>
<li>Activity logs (login events, content updates, settings changes)</li>
<li>Basic analytics such as geographic region of viewers</li>
<li>Browser type and device information for compatibility purposes</li>
</ul>

<h3>Payment Information</h3>
<p>Payment processing is handled entirely by <strong>Stripe</strong>. We do not store your credit card number, CVC, or full card details on our servers. Stripe provides us with a subscription status and billing email only.</p>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide and maintain the FlipRead platform</li>
<li>Process your subscription payments via Stripe</li>
<li>Display analytics and activity logs on your dashboard</li>
<li>Send essential account notifications (password resets, billing alerts)</li>
<li>Improve the platform and fix bugs</li>
<li>Enforce our Terms of Service</li>
</ul>
<p>We <strong>do not</strong> sell your personal information to third parties. We <strong>do not</strong> use your data for advertising purposes.</p>

<h2>3. Data Storage & Security</h2>
<p>Your data is processed and stored using Cloudflare's global edge network:</p>
<table>
<tr><th>Data Type</th><th>Storage</th><th>Encryption</th></tr>
<tr><td>Account data</td><td>Cloudflare D1 (SQLite)</td><td>Encrypted at rest</td></tr>
<tr><td>Uploaded files</td><td>Cloudflare R2</td><td>Encrypted at rest</td></tr>
<tr><td>Sessions</td><td>Cloudflare KV</td><td>JWT-signed tokens</td></tr>
<tr><td>Payments</td><td>Stripe (PCI DSS Level 1)</td><td>End-to-end encrypted</td></tr>
</table>

<h2>4. Data Sharing</h2>
<p>We share your data only with:</p>
<ul>
<li><strong>Cloudflare</strong> — infrastructure provider (data processing agreement in place)</li>
<li><strong>Stripe</strong> — payment processing (PCI DSS compliant)</li>
</ul>
<p>We may disclose information if required by law or to protect the rights and safety of our users.</p>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li><strong>Access</strong> your personal data through your dashboard</li>
<li><strong>Update</strong> your account information at any time</li>
<li><strong>Delete</strong> your account and all associated data by contacting us</li>
<li><strong>Export</strong> your data (available on Business plans)</li>
<li><strong>Withdraw consent</strong> for optional data processing</li>
</ul>

<h2>6. Cookies</h2>
<p>FlipRead uses minimal cookies:</p>
<ul>
<li><strong>Authentication token</strong> — a secure JWT stored in a cookie to keep you logged in</li>
<li><strong>Theme preference</strong> — stored in localStorage to remember your light/dark mode choice</li>
</ul>
<p>We do not use third-party tracking cookies or advertising cookies.</p>

<h2>7. Children's Privacy</h2>
<p>FlipRead is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please <a href="/contact">contact us</a> for removal.</p>

<h2>8. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent notice on the platform. Continued use of FlipRead after changes constitutes acceptance.</p>

<h2>9. Contact</h2>
<p>For privacy-related inquiries, please reach out at <a href="mailto:privacy@adhirat.com">privacy@adhirat.com</a> or visit our <a href="/contact">Contact page</a>.</p>

</div>`
  );
}


// ── Terms & Conditions ──────────────────────────────────────────────
export function termsPage(appUrl: string): string {
  return pageShell(
    'Terms & Conditions',
    'The terms governing your use of the FlipRead platform.',
    appUrl,
    `
<h1 class="page-title">Terms & Conditions</h1>
<p class="page-subtitle">Last updated: February 20, 2026</p>
<div class="page-content">

<div class="highlight-box">
<p>By accessing or using FlipRead, you agree to be bound by these Terms. If you do not agree, please do not use the platform.</p>
</div>

<h2>1. Acceptance of Terms</h2>
<p>These Terms of Service ("Terms") govern your access to and use of the FlipRead platform operated by Adhirat ("we", "us", "our"). By creating an account or using any part of the service, you agree to these Terms.</p>

<h2>2. Account Registration</h2>
<p>To use FlipRead, you must:</p>
<ul>
<li>Be at least 13 years of age</li>
<li>Provide accurate and complete registration information</li>
<li>Maintain the security of your account credentials</li>
<li>Notify us immediately of any unauthorized access to your account</li>
</ul>
<p>You are responsible for all activity that occurs under your account.</p>

<h2>3. Subscription Plans & Payments</h2>
<p>FlipRead offers Free, Basic, Pro, and Business subscription tiers. Paid plans are billed monthly or annually through Stripe.</p>
<ul>
<li><strong>Free trial</strong> — No credit card required. Limited to 1 book, 5 MB uploads, and 500 monthly views.</li>
<li><strong>Upgrades</strong> — Take effect immediately. You will be charged a prorated amount for the remaining billing period.</li>
<li><strong>Downgrades</strong> — Take effect at the end of the current billing period.</li>
<li><strong>Cancellations</strong> — You may cancel at any time. Access continues until the end of the paid period.</li>
<li><strong>Refunds</strong> — We offer a 14-day money-back guarantee on first-time paid subscriptions.</li>
</ul>

<h2>4. Acceptable Use</h2>
<p>You agree <strong>not</strong> to:</p>
<ul>
<li>Upload content that infringes copyright, trademarks, or other intellectual property rights</li>
<li>Distribute malware, viruses, or harmful code through uploaded files</li>
<li>Use the platform for illegal, fraudulent, or abusive purposes</li>
<li>Attempt to gain unauthorized access to other users' accounts or data</li>
<li>Use automated tools to scrape, crawl, or overload the platform</li>
<li>Resell, redistribute, or sublicense your FlipRead account</li>
</ul>
<p>We reserve the right to suspend or terminate accounts that violate these rules.</p>

<h2>5. Content Ownership</h2>
<p>You retain full ownership of all content you upload to FlipRead. By uploading content, you grant us a limited license to:</p>
<ul>
<li>Store and serve your content to authorized viewers</li>
<li>Generate thumbnails and previews for your bookstore</li>
<li>Process your files as necessary for the flipbook viewer</li>
</ul>
<p>We do <strong>not</strong> claim ownership over your content, and we will not use your content for any purpose other than providing the service.</p>

<h2>6. Service Availability</h2>
<p>We aim for 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance, deploy updates, or experience outages. We will make reasonable efforts to notify users of planned downtime.</p>

<h2>7. Data & Privacy</h2>
<p>Your use of FlipRead is also governed by our <a href="/privacy">Privacy Policy</a>, which describes how we collect, use, and protect your data.</p>

<h2>8. Limitation of Liability</h2>
<p>To the maximum extent permitted by law:</p>
<ul>
<li>FlipRead is provided "as is" without warranties of any kind</li>
<li>We are not liable for any indirect, incidental, or consequential damages</li>
<li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
</ul>

<h2>9. Intellectual Property</h2>
<p>The FlipRead name, logo, design, and underlying technology are the property of Adhirat. You may not copy, modify, or redistribute any part of the platform without prior written consent.</p>

<h2>10. Termination</h2>
<p>We may suspend or terminate your account if you violate these Terms. Upon termination:</p>
<ul>
<li>Your access to the dashboard and API will be revoked</li>
<li>Public links to your books will be disabled</li>
<li>Your files will be retained for 30 days, then permanently deleted</li>
</ul>
<p>You may request your data within the 30-day retention window.</p>

<h2>11. Governing Law</h2>
<p>These Terms are governed by the laws of Australia. Any disputes shall be resolved in the courts of New South Wales, Australia.</p>

<h2>12. Changes to Terms</h2>
<p>We may update these Terms from time to time. Material changes will be communicated via email or a notice on the platform. Continued use after changes constitutes acceptance.</p>

<h2>13. Contact</h2>
<p>For questions about these Terms, please contact us at <a href="mailto:legal@adhirat.com">legal@adhirat.com</a> or visit our <a href="/contact">Contact page</a>.</p>

</div>`
  );
}


// ── Contact ─────────────────────────────────────────────────────────
export function contactPage(appUrl: string): string {
  return pageShell(
    'Contact',
    'Get in touch with the FlipRead team for support, partnerships, or general inquiries.',
    appUrl,
    `
<h1 class="page-title">Contact Us</h1>
<p class="page-subtitle">We'd love to hear from you. Reach out through any of the channels below.</p>
<div class="page-content">

<div class="contact-grid">
<div class="contact-card">
<i class="fas fa-envelope"></i>
<h3>General Inquiries</h3>
<p>Questions about FlipRead</p>
<a href="mailto:hello@adhirat.com">hello@adhirat.com</a>
</div>
<div class="contact-card">
<i class="fas fa-life-ring"></i>
<h3>Support</h3>
<p>Technical issues & bugs</p>
<a href="mailto:support@adhirat.com">support@adhirat.com</a>
</div>
<div class="contact-card">
<i class="fas fa-handshake"></i>
<h3>Partnerships</h3>
<p>Business & integrations</p>
<a href="mailto:partnerships@adhirat.com">partnerships@adhirat.com</a>
</div>
</div>

<h2>Frequently Asked Questions</h2>

<h3>How do I reset my password?</h3>
<p>Click "Forgot Password" on the login page at <a href="/dashboard">/dashboard</a>. You'll receive a password reset link via email.</p>

<h3>What file formats are supported?</h3>
<p>FlipRead supports <strong>PDF</strong>, <strong>EPUB</strong>, <strong>DOCX</strong>, <strong>PPTX</strong>, <strong>XLSX/CSV</strong>, plain text, and common image formats (PNG, JPG, GIF, SVG, WebP). Each format is rendered with its own optimized viewer.</p>

<h3>What's the maximum file size I can upload?</h3>
<p>Upload limits depend on your plan:</p>
<table>
<tr><th>Plan</th><th>Max File Size</th></tr>
<tr><td>Free</td><td>5 MB</td></tr>
<tr><td>Basic</td><td>10 MB</td></tr>
<tr><td>Pro</td><td>50 MB</td></tr>
<tr><td>Business</td><td>200 MB</td></tr>
</table>

<h3>Can I use a custom domain?</h3>
<p>Yes! Pro and Business plans support custom domains for both individual books and your entire bookstore. Set up a CNAME record pointing to <code>flipread.adhirat.workers.dev</code> and configure it in your dashboard.</p>

<h3>How do I cancel my subscription?</h3>
<p>Go to <strong>Dashboard → Settings → Subscription</strong> and click "Cancel Plan". Your access continues until the end of the current billing period. We offer a 14-day refund policy on first-time subscriptions.</p>

<h3>Is my data secure?</h3>
<p>Absolutely. All data is encrypted at rest and in transit. Files are stored on Cloudflare R2, accounts on Cloudflare D1, and payments are processed by Stripe (PCI DSS Level 1 certified). Read our full <a href="/privacy">Privacy Policy</a>.</p>

<h2>Response Times</h2>
<table>
<tr><th>Plan</th><th>Expected Response</th></tr>
<tr><td>Free & Basic</td><td>Within 48 hours</td></tr>
<tr><td>Pro</td><td>Within 24 hours</td></tr>
<tr><td>Business</td><td>Priority — within 4 hours</td></tr>
</table>

<h2>Connect With Us</h2>
<p>Follow us for updates, tips, and new features:</p>
<ul>
<li><a href="https://x.com/adhirattech" target="_blank">X (Twitter)</a></li>
<li><a href="https://www.linkedin.com/company/aadhirat" target="_blank">LinkedIn</a></li>
<li><a href="https://www.youtube.com/@adhirattech" target="_blank">YouTube</a></li>
<li><a href="https://github.com/adhirat" target="_blank">GitHub</a></li>
</ul>

</div>`
  );
}


// ── Documentation ───────────────────────────────────────────────────
export function docsPage(appUrl: string): string {
  return pageShell(
    'Documentation',
    'Learn how to use the FlipRead platform, API, and customization options.',
    appUrl,
    `
<h1 class="page-title">Documentation</h1>
<p class="page-subtitle">Everything you need to get started with FlipRead.</p>
<div class="page-content">

<h2>Getting Started</h2>
<p>FlipRead lets you upload PDFs, EPUBs, and other documents and instantly generate shareable flipbook links. Here's how to get up and running in minutes:</p>
<ol>
<li><strong>Create an account</strong> — <a href="/dashboard?mode=register">Sign up for free</a> with your email or Google account.</li>
<li><strong>Upload a book</strong> — Click "Upload" on your dashboard to add a PDF, EPUB, or other supported file.</li>
<li><strong>Share the link</strong> — Each book gets a unique URL like <code>${appUrl}/read/my-book</code>. Share it anywhere.</li>
<li><strong>Customize</strong> — Edit the title, upload a cover image, set the background, or add password protection.</li>
</ol>

<h2>Supported File Formats</h2>
<table>
<tr><th>Format</th><th>Extension</th><th>Viewer</th></tr>
<tr><td>PDF Documents</td><td>.pdf</td><td>Page-flip flipbook with zoom</td></tr>
<tr><td>EPUB Books</td><td>.epub</td><td>Reflowable reader with ToC</td></tr>
<tr><td>Word Documents</td><td>.docx</td><td>Formatted document viewer</td></tr>
<tr><td>Presentations</td><td>.pptx</td><td>Slide viewer</td></tr>
<tr><td>Spreadsheets</td><td>.xlsx, .csv</td><td>Table viewer</td></tr>
<tr><td>Plain Text</td><td>.txt</td><td>Text reader</td></tr>
<tr><td>Images</td><td>.png, .jpg, .gif, .svg, .webp</td><td>Image viewer</td></tr>
</table>

<h2>Your Bookstore</h2>
<p>Every FlipRead user gets a public bookstore at <code>${appUrl}/store/your-handle</code>. You can customize it with:</p>
<ul>
<li><strong>Store name & logo</strong> — Brand your bookstore</li>
<li><strong>Description</strong> — Tell visitors what your store is about</li>
<li><strong>Themes</strong> — Choose from Magazine, Minimal, or Dark Luxe layouts</li>
<li><strong>Custom domain</strong> (Pro+) — Point your own domain to your store</li>
<li><strong>Privacy & Terms pages</strong> — Add legal pages to your store</li>
</ul>

<h2>Book Settings</h2>
<p>Each book can be customized through the dashboard:</p>
<table>
<tr><th>Setting</th><th>Description</th><th>Plan</th></tr>
<tr><td>Title & Slug</td><td>Custom URL-friendly name</td><td>All</td></tr>
<tr><td>Cover Image</td><td>Custom cover for store display</td><td>All</td></tr>
<tr><td>Background</td><td>Custom viewer background color</td><td>Basic+</td></tr>
<tr><td>Public/Private</td><td>Control visibility</td><td>All</td></tr>
<tr><td>Password</td><td>Protect content with a password</td><td>Pro+</td></tr>
<tr><td>Custom Domain</td><td>Serve book on your own domain</td><td>Pro+</td></tr>
</table>

<h2>API Reference</h2>
<p>FlipRead provides a REST API for Business plan users. Full interactive documentation is available at <a href="/api/swagger">Swagger UI</a>.</p>

<h3>Authentication</h3>
<p>All API requests require an API key sent in the <code>Authorization</code> header:</p>
<pre><code>Authorization: Bearer your-api-key-here</code></pre>
<p>Generate your API key from <strong>Dashboard → Settings → API Access</strong>.</p>

<h3>Key Endpoints</h3>

<div class="endpoint">
<span class="method method-post">POST</span>
<span class="path">/api/auth/login</span>
<span class="desc">Authenticate and get a session token</span>
</div>

<div class="endpoint">
<span class="method method-get">GET</span>
<span class="path">/api/auth/me</span>
<span class="desc">Get current user profile</span>
</div>

<div class="endpoint">
<span class="method method-get">GET</span>
<span class="path">/api/user/books</span>
<span class="desc">List all your books</span>
</div>

<div class="endpoint">
<span class="method method-post">POST</span>
<span class="path">/api/user/books</span>
<span class="desc">Upload a new book</span>
</div>

<div class="endpoint">
<span class="method method-patch">PATCH</span>
<span class="path">/api/user/books/:id</span>
<span class="desc">Update book metadata</span>
</div>

<div class="endpoint">
<span class="method method-delete">DELETE</span>
<span class="path">/api/user/books/:id</span>
<span class="desc">Delete a book</span>
</div>

<div class="endpoint">
<span class="method method-get">GET</span>
<span class="path">/api/user/analytics</span>
<span class="desc">Get view analytics data</span>
</div>

<div class="endpoint">
<span class="method method-get">GET</span>
<span class="path">/api/user/activity</span>
<span class="desc">Get activity log</span>
</div>

<p style="margin-top:24px">For complete request/response schemas, visit the <a href="/api/swagger">Swagger documentation</a>.</p>

<h2>Team Members</h2>
<p>Pro and Business plans support team collaboration:</p>
<ul>
<li><strong>Invite members</strong> — Send email invitations from Dashboard → Members</li>
<li><strong>Roles</strong> — Members can view your store and access shared books</li>
<li><strong>Limits</strong> — Pro allows up to 50 members, Business is unlimited</li>
</ul>

<h2>Billing & Plans</h2>
<p>View and manage your subscription from <strong>Dashboard → Settings → Subscription</strong>. Compare all plans on the <a href="/#pricing">Pricing page</a>.</p>
<ul>
<li>All prices are in <strong>USD</strong></li>
<li><strong>10% GST</strong> applies for Australian customers</li>
<li>Annual plans save you <strong>2 months</strong> compared to monthly billing</li>
<li>14-day money-back guarantee on first-time paid subscriptions</li>
</ul>

<h2>Need Help?</h2>
<p>Can't find what you're looking for? Visit our <a href="/contact">Contact page</a> or email <a href="mailto:support@adhirat.com">support@adhirat.com</a>.</p>

</div>`
  );
}
