/** @jsxImportSource hono/jsx */
import { escapeHtml } from './viewerUtils';

// Shared CSS variables for light/dark theme
const themeVars = `
  :root { --bg:#f9fafb; --text:#111827; --card:#ffffff; --border:#e5e7eb; --input-border:#d1d5db; --text-muted:#4b5563; --link:#6b7280; --link-hover:#374151; }
  [data-theme="dark"] { --bg:#0f172a; --text:#f8fafc; --card:#1e293b; --border:rgba(255,255,255,0.1); --input-border:#334155; --text-muted:#94a3b8; --link:#94a3b8; --link-hover:#e2e8f0; }
`;

// Shared base styles
const baseStyles = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;padding:20px}`;

// Shared card styles
const cardStyles = `.c{background:var(--card);padding:40px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.08);text-align:center;max-width:400px;width:90%;border:1px solid var(--border)}`;

// Shared form styles
const formStyles = `h2{margin-bottom:10px;font-size:24px;color:var(--text)}p{margin-bottom:25px;color:var(--text-muted);font-size:14px;line-height:1.6}input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid var(--input-border);background:var(--card);color:var(--text);font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s}input:focus{border-color:#3b82f6}button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer;transition:background .2s}button:hover{background:#2563eb}`;

// Shared message styles
const msgStyles = `.msg{margin-top:15px;font-size:13px;padding:10px;border-radius:6px;display:none}.msg.error{background:#fee2e2;color:#ef4444}.msg.success{background:#dcfce7;color:#16a34a}`;

// Dark mode auto-detect script
const DarkModeScript = () => (
  <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('shopublish-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}})();` }} />
);

// Favicon and apple icon
const FaviconLinks = ({ logoUrl }: { logoUrl: string }) => (
  <>
    <link rel="icon" type="image/png" href={logoUrl || '/logo.png'} />
    <link rel="apple-touch-icon" href={logoUrl || '/logo.png'} />
  </>
);

// Logo or emoji fallback
const LogoOrEmoji = ({ logoUrl, emoji, style }: { logoUrl?: string; emoji: string; style?: string }) => (
  logoUrl
    ? <img src={logoUrl} style={style || 'height:40px;margin-bottom:20px;border-radius:4px'} />
    : <div style={`font-size:48px;margin-bottom:20px`}>{emoji}</div>
);

// ─── Password Page ──────────────────────────────────────────────
export function passwordPage(slug: string, logoUrl: string = ''): string {
  const page = (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>Password Required — SHOPUBLISH</title>
      <FaviconLinks logoUrl={logoUrl} />
      <meta property="og:title" content="Password Required — SHOPUBLISH" />
      <meta property="og:image" content={logoUrl || '/logo.png'} />
      <style dangerouslySetInnerHTML={{ __html: `${themeVars}${baseStyles}${cardStyles}h2{margin-bottom:10px;font-size:22px;color:var(--text)}p{margin-bottom:25px;color:var(--text-muted);font-size:14px}input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid var(--input-border);background:var(--card);color:var(--text);font-size:14px;margin-bottom:15px;outline:none}input:focus{border-color:#3b82f6}button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer}button:hover{background:#2563eb}` }} />
      <DarkModeScript />
    </head>
    <body>
      <div class="c">
        <div style="font-size:48px;margin-bottom:20px">🔒</div>
        <h2>Password Required</h2>
        <p>This book is protected. Enter the password to continue.</p>
        <form onsubmit={`event.preventDefault();location.href='/read/${slug}?p='+encodeURIComponent(document.getElementById('pw').value)`}>
          <input type="password" id="pw" placeholder="Enter password" autofocus />
          <button type="submit">Unlock Book</button>
        </form>
      </div>
    </body>
    </html>
  );
  return '<!DOCTYPE html>' + page.toString();
}

// ─── Error Page ─────────────────────────────────────────────────
export function errorPage(title: string, message: string, logoUrl: string = ''): string {
  const safeTitle = escapeHtml(title);
  const safeMsg = escapeHtml(message);
  
  const page = (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>{safeTitle} — SHOPUBLISH</title>
      <FaviconLinks logoUrl={logoUrl} />
      <meta property="og:title" content={`${safeTitle} — SHOPUBLISH`} />
      <meta property="og:image" content={logoUrl || '/logo.png'} />
      <style dangerouslySetInnerHTML={{ __html: `${themeVars}${baseStyles}${cardStyles}h2{margin-bottom:10px;color:#ef4444}p{color:var(--text-muted);line-height:1.6}a{color:#3b82f6;text-decoration:none;margin-top:20px;display:inline-block}` }} />
      <DarkModeScript />
    </head>
    <body>
      <div class="c">
        <div style="font-size:48px;margin-bottom:20px">📖</div>
        <h2 dangerouslySetInnerHTML={{ __html: safeTitle }} />
        <p dangerouslySetInnerHTML={{ __html: safeMsg }} />
        <a href="/">← Back to SHOPUBLISH</a>
      </div>
    </body>
    </html>
  );
  return '<!DOCTYPE html>' + page.toString();
}

// ─── Member Access (Login) Page ─────────────────────────────────
const memberLoginScript = `
async function handleLogin(e) {
  e.preventDefault();
  var email = document.getElementById('email').value;
  var access_key = document.getElementById('key').value;
  var btn = document.getElementById('btn');
  var msg = document.getElementById('msg');
  if(!email || !access_key) return;
  btn.textContent = 'Verifying...';
  btn.disabled = true;
  msg.style.display = 'none';
  try {
    var owner_id = "__OWNER_ID__";
    var res = await fetch('/api/members/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, access_key: access_key, owner_id: owner_id })
    });
    var data = await res.json();
    if(data.success) {
      location.reload();
    } else {
      if(data.unverified) {
        msg.innerHTML = data.error + ' <a href="#" onclick="resendVerification(event)" style="color:#93c5fd;text-decoration:underline">Resend verification link</a>';
      } else {
        msg.textContent = data.error || 'Invalid credentials';
      }
      msg.className = 'msg error';
      msg.style.display = 'block';
      btn.textContent = 'Unlock Access';
      btn.disabled = false;
    }
  } catch(err) {
    msg.textContent = 'Network error';
    msg.className = 'msg error';
    msg.style.display = 'block';
    btn.textContent = 'Unlock Access';
    btn.disabled = false;
  }
}
async function resendVerification(e) {
  e.preventDefault();
  var email = document.getElementById('email').value;
  var msg = document.getElementById('msg');
  if(!email) return alert('Please enter your email address first.');
  try {
    var res = await fetch('/api/members/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, owner_id: "__OWNER_ID__" })
    });
    var data = await res.json();
    msg.textContent = data.message || 'A new verification link has been sent (valid for 30m).';
    msg.className = 'msg info';
    msg.style.background = 'rgba(59,130,246,0.2)';
    msg.style.color = '#93c5fd';
    msg.style.display = 'block';
  } catch(ex) {
    msg.textContent = 'Failed to resend link.';
    msg.className = 'msg error';
    msg.style.display = 'block';
  }
}`;

export function memberAccessPage(storeName: string, logoUrl: string = '', homeUrl: string = '/'): string {
  const safeName = escapeHtml(storeName || 'Member Access');
  const linkStyles = `.back{margin-top:20px;display:inline-block;color:var(--link);text-decoration:none;font-size:13px}.back:hover{color:var(--link-hover)}`;
  
  const page = (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>{safeName} — Login</title>
      <FaviconLinks logoUrl={logoUrl} />
      <meta property="og:title" content={`${safeName} — Login`} />
      <style dangerouslySetInnerHTML={{ __html: `${themeVars}${baseStyles}${cardStyles}${formStyles}${msgStyles}${linkStyles}` }} />
      <DarkModeScript />
    </head>
    <body>
      <div class="c">
        <LogoOrEmoji logoUrl={logoUrl} emoji="🔒" />
        <h2>Member Access</h2>
        <p>This content is private. Please enter your email and access key to view. Verification links are valid for 30 minutes.</p>
        <form id="loginForm" onsubmit="handleLogin(event)">
          <input type="email" id="email" placeholder="Email Address" required />
          <input type="text" id="key" placeholder="Access Key" required />
          <button type="submit" id="btn">Unlock Access</button>
        </form>
        <div id="msg" class="msg"></div>
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
          <a href="./register" style="color: #64748b; text-decoration: none; font-size: 13px;">Don't have access? Join here</a>
          <a href="./forgot-password" style="color: #64748b; text-decoration: none; font-size: 13px;">Forgot your access key?</a>
          <a href={homeUrl} style="color: #64748b; text-decoration: none; font-size: 13px;">← Back to Store</a>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: memberLoginScript }} />
    </body>
    </html>
  );
  return '<!DOCTYPE html>' + page.toString();
}

// ─── Member Register Page ───────────────────────────────────────
const memberRegisterScript = `
async function handleRegistration(e) {
  e.preventDefault();
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var access_key = document.getElementById('key').value;
  var btn = document.getElementById('btn');
  var msg = document.getElementById('msg');
  if(!name || !email || !access_key) return;
  btn.textContent = 'Joining...';
  btn.disabled = true;
  msg.style.display = 'none';
  try {
    var res = await fetch('/api/members/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, access_key: access_key, owner_id: "__OWNER_ID__" })
    });
    var data = await res.json();
    if(data.success) {
      document.getElementById('regForm').style.display = 'none';
      msg.textContent = 'Success! Please check your email to verify your account. The link is valid for 30 minutes.';
      msg.className = 'msg success';
      msg.style.display = 'block';
    } else {
      msg.textContent = data.error || 'Registration failed';
      if (data.error === 'Email already registered. Please verify your account or resend verification link.') {
        msg.innerHTML += '<br><a href="#" onclick="resendVerification(event)" style="color:#93c5fd;text-decoration:underline;">Resend verification link</a>';
      }
      msg.className = 'msg error';
      msg.style.display = 'block';
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  } catch(err) {
    msg.textContent = 'Network error';
    msg.className = 'msg error';
    msg.style.display = 'block';
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
}
async function resendVerification(e) {
  e.preventDefault();
  var email = document.getElementById('email').value;
  var msg = document.getElementById('msg');
  if(!email) return alert('Please enter your email address first.');
  try {
    var res = await fetch('/api/members/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, owner_id: "__OWNER_ID__" })
    });
    var data = await res.json();
    msg.textContent = data.message || 'A new verification link has been sent (valid for 30m).';
    msg.className = 'msg success';
    msg.style.display = 'block';
  } catch(ex) {
    msg.textContent = 'Failed to resend link.';
    msg.className = 'msg error';
    msg.style.display = 'block';
  }
}`;

export function memberRegisterPage(storeName: string, logoUrl: string = '', homeUrl: string = '/'): string {
  const safeName = escapeHtml(storeName || 'Member Registration');
  const linkStyles = `.links{margin-top:20px;display:flex;flex-direction:column;gap:10px}.link{color:var(--link);text-decoration:none;font-size:13px}.link:hover{color:var(--link-hover)}`;
  
  const page = (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>{safeName} — Join</title>
      <FaviconLinks logoUrl={logoUrl} />
      <style dangerouslySetInnerHTML={{ __html: `${themeVars}${baseStyles}${cardStyles}${formStyles}${msgStyles}${linkStyles}` }} />
      <DarkModeScript />
    </head>
    <body>
      <div class="c">
        <LogoOrEmoji logoUrl={logoUrl} emoji="✨" />
        <h2>Join {safeName}</h2>
        <p>Create an account to access private content and receive updates. Verification links are valid for 30 minutes.</p>
        <form id="regForm" onsubmit="handleRegistration(event)">
          <input type="text" id="name" placeholder="Full Name" required />
          <input type="email" id="email" placeholder="Email Address" required />
          <input type="password" id="key" placeholder="Create Access Key (Min 6 chars)" required minlength={6} />
          <button type="submit" id="btn">Create Account</button>
        </form>
        <div id="msg" class="msg"></div>
        <div class="links">
          <a href="./login" class="link">Already a member? Login</a>
          <a href={homeUrl} class="link">← Back to Store</a>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: memberRegisterScript }} />
    </body>
    </html>
  );
  return '<!DOCTYPE html>' + page.toString();
}

// ─── Member Forgot Password Page ────────────────────────────────
const memberForgotScript = `
async function handleForgot(e) {
  e.preventDefault();
  var email = document.getElementById('email').value;
  var btn = document.getElementById('btn');
  var msg = document.getElementById('msg');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  msg.style.display = 'none';
  try {
    var res = await fetch('/api/members/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, owner_id: "__OWNER_ID__" })
    });
    var data = await res.json();
    if(data.success) {
      msg.textContent = 'If an account exists, your key has been sent.';
      msg.className = 'msg success';
      msg.style.display = 'block';
    } else {
      msg.textContent = data.error || 'Request failed';
      msg.className = 'msg error';
      msg.style.display = 'block';
      btn.textContent = 'Resend Key';
      btn.disabled = false;
    }
  } catch(err) {
    msg.textContent = 'Network error';
    msg.className = 'msg error';
    msg.style.display = 'block';
    btn.textContent = 'Resend Key';
    btn.disabled = false;
  }
}`;

export function memberForgotPage(storeName: string, logoUrl: string = '', homeUrl: string = '/'): string {
  const safeName = escapeHtml(storeName || 'Member Access');
  const linkStyles = `.back{margin-top:20px;display:inline-block;color:var(--link);text-decoration:none;font-size:13px}.back:hover{color:var(--link-hover)}`;
  
  const page = (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>{safeName} — Reset Access</title>
      <FaviconLinks logoUrl={logoUrl} />
      <style dangerouslySetInnerHTML={{ __html: `${themeVars}${baseStyles}${cardStyles}${formStyles}${msgStyles}${linkStyles}` }} />
      <DarkModeScript />
    </head>
    <body>
      <div class="c">
        <div style="font-size:48px;margin-bottom:20px">🔑</div>
        <h2>Reset Access</h2>
        <p>Enter your email address and we'll resend your access key.</p>
        <form id="forgotForm" onsubmit="handleForgot(event)">
          <input type="email" id="email" placeholder="Email Address" required />
          <button type="submit" id="btn">Resend Key</button>
        </form>
        <div id="msg" class="msg"></div>
        <a href="./login" class="back">← Back to Login</a>
        <a href={homeUrl} class="back" style="display:block;margin-top:10px">← Back to Store</a>
      </div>
      <script dangerouslySetInnerHTML={{ __html: memberForgotScript }} />
    </body>
    </html>
  );
  return '<!DOCTYPE html>' + page.toString();
}

// ─── Verification Success Page ──────────────────────────────────
export function verificationSuccessPage(storeName: string, logoUrl: string = '', homeUrl: string = '/'): string {
  const safeName = escapeHtml(storeName || 'Member Verification');
  
  const page = (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>Account Verified — {safeName}</title>
      <FaviconLinks logoUrl={logoUrl} />
      <style dangerouslySetInnerHTML={{ __html: `${themeVars}${baseStyles}${cardStyles}h2{margin-bottom:15px;font-size:24px;color:#10b981}p{margin-bottom:25px;color:var(--text-muted);font-size:15px;line-height:1.6}.btn{display:inline-block;padding:12px 24px;border-radius:8px;background:#3b82f6;color:#fff;font-weight:600;text-decoration:none;transition:background .2s}.btn:hover{background:#2563eb}` }} />
      <DarkModeScript />
    </head>
    <body>
      <div class="c">
        <div style="font-size:64px;margin-bottom:20px">✅</div>
        <h2>Account Verified!</h2>
        <p>Your email has been successfully verified. In private stores, the owner may need to activate your account before you gain full access.</p>
        <div style="display:flex;flex-direction:column;gap:15px">
          <a href="./login" class="btn">Proceed to Login</a>
          <a href={homeUrl} style="color:#64748b;font-size:14px;text-decoration:none">Back to Store</a>
        </div>
      </div>
    </body>
    </html>
  );
  return '<!DOCTYPE html>' + page.toString();
}
