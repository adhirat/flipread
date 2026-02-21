
import { escapeHtml } from './viewerUtils';

export function passwordPage(slug: string, logoUrl: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Password Required — FlipRead</title>
<link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
<link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
<meta property="og:title" content="Password Required — FlipRead">
<meta property="og:image" content="${logoUrl || '/logo.png'}">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh}.c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}h2{margin-bottom:10px;font-size:22px}p{margin-bottom:25px;color:#94a3b8;font-size:14px}input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:14px;margin-bottom:15px;outline:none}input:focus{border-color:#3b82f6}button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer}button:hover{background:#2563eb}</style>
</head><body><div class="c"><div style="font-size:48px;margin-bottom:20px">🔒</div><h2>Password Required</h2><p>This book is protected. Enter the password to continue.</p>
<form onsubmit="event.preventDefault();location.href='/read/${slug}?p='+encodeURIComponent(document.getElementById('pw').value)">
<input type="password" id="pw" placeholder="Enter password" autofocus><button type="submit">Unlock Book</button></form></div></body></html>`;
}

export function errorPage(title: string, message: string, logoUrl: string = ''): string {
  const safeTitle = escapeHtml(title);
  const safeMsg = escapeHtml(message);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeTitle} — FlipRead</title>
<link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
<link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
<meta property="og:title" content="${safeTitle} — FlipRead">
<meta property="og:image" content="${logoUrl || '/logo.png'}">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh}.c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}h2{margin-bottom:10px;color:#f87171}p{color:#94a3b8;line-height:1.6}a{color:#3b82f6;text-decoration:none;margin-top:20px;display:inline-block}</style>
</head><body><div class="c"><div style="font-size:48px;margin-bottom:20px">📖</div><h2>${safeTitle}</h2><p>${safeMsg}</p><a href="/">← Back to FlipRead</a></div></body></html>`;
}

export function memberAccessPage(storeName: string, logoUrl: string = ''): string {
  const safeName = escapeHtml(storeName || 'Member Access');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeName} — Login</title>
<link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
<link rel="apple-touch-icon" href="${logoUrl || '/apple-touch-icon.png'}">
<meta property="og:title" content="${safeName} — Login">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column}
  .c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}
  h2{margin-bottom:10px;font-size:24px;color:#f8fafc}
  p{margin-bottom:25px;color:#94a3b8;font-size:14px;line-height:1.6}
  input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s}
  input:focus{border-color:#3b82f6}
  button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer;transition:background .2s}
  button:hover{background:#2563eb}
  .msg{margin-top:15px;font-size:13px;padding:10px;border-radius:6px;display:none}
  .msg.error{background:rgba(239,68,68,0.2);color:#fca5a5}
  .back{margin-top:20px;display:inline-block;color:#64748b;text-decoration:none;font-size:13px}
  .back:hover{color:#94a3b8}
</style>
</head>
<body>
  <div class="c">
  ${logoUrl ? `<img src="${logoUrl}" style="height:40px;margin-bottom:20px;border-radius:4px">` : '<div style="font-size:48px;margin-bottom:20px">🔒</div>'}
  <h2>Member Access</h2>
  <p>This content is private. Please enter your email and access key to view.</p>
  <form id="loginForm" onsubmit="handleLogin(event)">
    <input type="email" id="email" placeholder="Email Address" required>
    <input type="text" id="key" placeholder="Access Key" required>
    <button type="submit" id="btn">Unlock Access</button>
  </form>
  <div id="msg" class="msg"></div>
  <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
    <a href="./register" style="color: #64748b; text-decoration: none; font-size: 13px;">Don't have access? Join here</a>
    <a href="./forgot-password" style="color: #64748b; text-decoration: none; font-size: 13px;">Forgot your access key?</a>
    <a href="/" style="color: #64748b; text-decoration: none; font-size: 13px;">← Back to Store</a>
  </div>
</div>
<script>
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const access_key = document.getElementById('key').value;
  const btn = document.getElementById('btn');
  const msg = document.getElementById('msg');
  
  if(!email || !access_key) return;

  btn.textContent = 'Verifying...';
  btn.disabled = true;
  msg.style.display = 'none';

  try {
    const owner_id = "__OWNER_ID__"; 
    const res = await fetch('/api/members/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, access_key, owner_id })
    });
    
    const data = await res.json();
    if(data.success) {
      location.reload();
    } else {
      msg.textContent = data.error || 'Invalid credentials';
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
</script>
</body>
</html>`;
}

export function memberRegisterPage(storeName: string, logoUrl: string = ''): string {
  const safeName = escapeHtml(storeName || 'Member Registration');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeName} — Join</title>
<link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;padding:20px}
  .c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:100%}
  h2{margin-bottom:10px;font-size:24px;color:#f8fafc}
  p{margin-bottom:25px;color:#94a3b8;font-size:14px;line-height:1.6}
  input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s}
  input:focus{border-color:#3b82f6}
  button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer;transition:background .2s}
  button:hover{background:#2563eb}
  .msg{margin-top:15px;font-size:13px;padding:10px;border-radius:6px;display:none}
  .msg.error{background:rgba(239,68,68,0.2);color:#fca5a5}
  .msg.success{background:rgba(34,197,94,0.2);color:#86efac}
  .links{margin-top:20px;display:flex;flex-direction:column;gap:10px}
  .link{color:#64748b;text-decoration:none;font-size:13px}
  .link:hover{color:#94a3b8}
</style>
</head>
<body>
<div class="c">
  ${logoUrl ? `<img src="${logoUrl}" style="height:40px;margin-bottom:20px;border-radius:4px">` : '<div style="font-size:48px;margin-bottom:20px">✨</div>'}
  <h2>Join ${safeName}</h2>
  <p>Create an account to access private content and receive updates.</p>
  <form id="regForm" onsubmit="handleRegistration(event)">
    <input type="text" id="name" placeholder="Full Name" required>
    <input type="email" id="email" placeholder="Email Address" required>
    <button type="submit" id="btn">Create Account</button>
  </form>
  <div id="msg" class="msg"></div>
  <div class="links">
    <a href="./login" class="link">Already a member? Login</a>
    <a href="/" class="link">← Back to Store</a>
  </div>
</div>
<script>
async function handleRegistration(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const btn = document.getElementById('btn');
  const msg = document.getElementById('msg');
  
  if(!name || !email) return;

  btn.textContent = 'Joining...';
  btn.disabled = true;
  msg.style.display = 'none';

  try {
    const res = await fetch('/api/members/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, owner_id: "__OWNER_ID__" })
    });
    const data = await res.json();
    if(data.success) {
      msg.textContent = 'Success! Please check your email for access instructions.';
      msg.className = 'msg success';
      msg.style.display = 'block';
      document.getElementById('regForm').style.display = 'none';
    } else {
      msg.textContent = data.error || 'Registration failed';
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
</script>
</body>
</html>`;
}

export function memberForgotPage(storeName: string, logoUrl: string = ''): string {
  const safeName = escapeHtml(storeName || 'Member Access');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeName} — Reset Access</title>
<link rel="icon" type="image/png" href="${logoUrl || '/favicon.png'}">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column}
  .c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}
  h2{margin-bottom:10px;font-size:24px;color:#f8fafc}
  p{margin-bottom:25px;color:#94a3b8;font-size:14px;line-height:1.6}
  input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s}
  input:focus{border-color:#3b82f6}
  button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer;transition:background .2s}
  button:hover{background:#2563eb}
  .msg{margin-top:15px;font-size:13px;padding:10px;border-radius:6px;display:none}
  .msg.error{background:rgba(239,68,68,0.2);color:#fca5a5}
  .msg.success{background:rgba(34,197,94,0.2);color:#86efac}
  .back{margin-top:20px;display:inline-block;color:#64748b;text-decoration:none;font-size:13px}
  .back:hover{color:#94a3b8}
</style>
</head>
<body>
<div class="c">
  <div style="font-size:48px;margin-bottom:20px">🔑</div>
  <h2>Reset Access</h2>
  <p>Enter your email address and we'll resend your access key.</p>
  <form id="forgotForm" onsubmit="handleForgot(event)">
    <input type="email" id="email" placeholder="Email Address" required>
    <button type="submit" id="btn">Resend Key</button>
  </form>
  <div id="msg" class="msg"></div>
  <a href="./login" class="back">← Back to Login</a>
</div>
<script>
async function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const btn = document.getElementById('btn');
  const msg = document.getElementById('msg');
  
  btn.textContent = 'Sending...';
  btn.disabled = true;
  msg.style.display = 'none';

  try {
    const res = await fetch('/api/members/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, owner_id: "__OWNER_ID__" })
    });
    const data = await res.json();
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
}
</script>
</body>
</html>`;
}
