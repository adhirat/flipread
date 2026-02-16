
import { escapeHtml } from './viewerUtils';

export function passwordPage(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Password Required — FlipRead</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh}.c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}h2{margin-bottom:10px;font-size:22px}p{margin-bottom:25px;color:#94a3b8;font-size:14px}input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:14px;margin-bottom:15px;outline:none}input:focus{border-color:#3b82f6}button{width:100%;padding:12px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;cursor:pointer}button:hover{background:#2563eb}</style>
</head><body><div class="c"><div style="font-size:48px;margin-bottom:20px">🔒</div><h2>Password Required</h2><p>This book is protected. Enter the password to continue.</p>
<form onsubmit="event.preventDefault();location.href='/read/${slug}?p='+encodeURIComponent(document.getElementById('pw').value)">
<input type="password" id="pw" placeholder="Enter password" autofocus><button type="submit">Unlock Book</button></form></div></body></html>`;
}

export function errorPage(title: string, message: string): string {
  const safeTitle = escapeHtml(title);
  const safeMsg = escapeHtml(message);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeTitle} — FlipRead</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh}.c{background:#1e293b;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;max-width:400px;width:90%}h2{margin-bottom:10px;color:#f87171}p{color:#94a3b8;line-height:1.6}a{color:#3b82f6;text-decoration:none;margin-top:20px;display:inline-block}</style>
</head><body><div class="c"><div style="font-size:48px;margin-bottom:20px">📖</div><h2>${safeTitle}</h2><p>${safeMsg}</p><a href="/">← Back to FlipRead</a></div></body></html>`;
}
