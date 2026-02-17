// Auth routes — registration, login, session management

import { Hono } from 'hono';
import type { Env, User } from '../lib/types';
import { generateId, hashPassword, verifyPassword } from '../lib/utils';
import { createToken } from '../middleware/auth';
import { logActivity } from '../lib/activity';

type Variables = { user: User };

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/auth/register
auth.post('/register', async (c) => {
  const { email, password, name } = await c.req.json<{
    email: string; password: string; name: string;
  }>();

  if (!email || !password || password.length < 8) {
    return c.json({ error: 'Email and password (min 8 chars) required' }, 400);
  }

  // Check existing
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first();
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash, plan) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, email.toLowerCase().trim(), name || '', passwordHash, 'free').run();

  const token = await createToken(id, c.env.JWT_SECRET);

  // Set cookie
  c.header('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`);

  // Log activity
  await logActivity(c, id, 'register', 'user', id, { email });

  return c.json({ user: { id, email, name, plan: 'free' }, token });
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<User>();

  if (!user || !user.password_hash) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createToken(user.id, c.env.JWT_SECRET);

  c.header('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`);

  // Log activity
  await logActivity(c, user.id, 'login', 'user', user.id);

  return c.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    token,
  });
});

// POST /api/auth/logout
auth.post('/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  return c.json({ success: true });
});

// GET /api/auth/me — get current user
auth.get('/me', async (c) => {
  // Quick token check without full middleware
  let tokenStr: string | undefined;
  const cookies = c.req.header('Cookie');
  if (cookies) {
    const match = cookies.match(/(?:^|;\s*)token=([^;]*)/);
    if (match) tokenStr = decodeURIComponent(match[1]);
  }
  if (!tokenStr) {
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) tokenStr = authHeader.slice(7);
  }

  if (!tokenStr) return c.json({ user: null });

  const { verifyToken } = await import('../middleware/auth');
  const decoded = await verifyToken(tokenStr, c.env.JWT_SECRET);
  if (!decoded) return c.json({ user: null });

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, avatar_url, plan, store_name, store_logo_url, store_settings, created_at FROM users WHERE id = ?'
  ).bind(decoded.sub).first();

  return c.json({ user: user || null });
});

// POST /api/auth/forgot-password
auth.post('/forgot-password', async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!email) return c.json({ error: 'Email required' }, 400);

  const user = await c.env.DB.prepare('SELECT id, name FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<{ id: string; name: string }>();

  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return c.json({ success: true, message: 'If an account exists with this email, you will receive a reset link.' });
  }

  const token = crypto.randomUUID();
  await c.env.KV.put(`reset_token:${token}`, user.id, { expirationTtl: 3600 });

  const resetUrl = `${c.env.APP_URL}/dashboard?mode=reset&token=${token}`;
  
  // Send email via new service
  try {
    const { sendEmail } = await import('../services/email');
    const sent = await sendEmail(c.env, {
      to: email,
      subject: 'Reset your FlipRead password',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#4f46e5;">Reset Your Password</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>We received a request to reset your password for your FlipRead account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:20px 0;">Reset Password</a>
          <p style="color:#64748b;font-size:14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>`
    });
    
    if (!sent) {
      console.error('Email sending failed');
      return c.json({ error: 'Failed to send reset email' }, 500);
    }
  } catch (err) {
    console.error('Email error:', err);
    return c.json({ error: 'Failed to send reset email' }, 500);
  }

  return c.json({ success: true, message: 'Reset link sent to your email.' });
});

// POST /api/auth/reset-password
auth.post('/reset-password', async (c) => {
  const { token, password } = await c.req.json<{ token: string; password: string }>();
  if (!token || !password || password.length < 8) {
    return c.json({ error: 'Token and password (min 8 chars) required' }, 400);
  }

  const userId = await c.env.KV.get(`reset_token:${token}`);
  if (!userId) {
    return c.json({ error: 'Invalid or expired reset token' }, 400);
  }

  const passwordHash = await hashPassword(password);
  await c.env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(passwordHash, userId)
    .run();

  await c.env.KV.delete(`reset_token:${token}`);

  return c.json({ success: true, message: 'Password reset successful. You can now log in.' });
});

export default auth;
