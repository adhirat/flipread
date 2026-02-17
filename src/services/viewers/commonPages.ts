
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
  <a href="/" class="back">← Back to Store</a>
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
    // We need owner ID but don't have it easily here unless passed via template
    // However, the verify endpoint needs it.
    // For now, let's assume this page is served on a route that knows the owner ID,
    // and we embed it here.
    const owner_id = "${'__OWNER_ID__'}"; 
    
    // Check if we are on a custom domain or path that implies owner context
    // Actually, store pages usually know the owner.
    // Let's rely on the server to replace __OWNER_ID__ or pass it as arg.
    
    const res = await fetch('/api/members/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, access_key, owner_id: window.ownerId })
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
// Set owner ID from template injection
window.ownerId = "${'__OWNER_ID__'}";
</script>
</body>
</html>`;
}
