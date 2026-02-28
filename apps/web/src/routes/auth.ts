// Auth routes — registration, login, session management

import { Hono } from 'hono';
import type { Env, User } from '../lib/types';
import { generateId, hashPassword, verifyPassword } from '../lib/utils';
import { createToken, verifyToken, extractToken } from '../middleware/auth';
import { logActivity } from '../lib/activity';

/** Basic email format check — rejects obvious typos before they hit the DB. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Returns dev-only error details; never leaks internals to production clients. */
function devDetails(env: Env, err: unknown): object {
  if (!env.APP_URL.includes('localhost')) return {};
  const e = err as Error;
  return { message: e.message, stack: e.stack };
}

type Variables = { user: User };

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/auth/register
auth.post('/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json<{
      email: string; password: string; name: string;
    }>();

    if (!email || !isValidEmail(email)) {
      return c.json({ error: 'A valid email address is required' }, 400);
    }
    if (!password || password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    if (!c.env.DB) {
      console.error('Database binding DB is missing');
      return c.json({ error: 'Server configuration error: Database missing' }, 500);
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
    const storeHandle = (name || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + id.slice(0, 4);

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, store_handle, password_hash, plan) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email.toLowerCase().trim(), name || '', storeHandle, passwordHash, 'free').run();

    const token = await createToken(id, c.env.JWT_SECRET);

    // Set cookie
    c.header('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`);

    // Log activity — non-blocking
    logActivity(c, id, 'register', 'user', id, { email });

    return c.json({ user: { id, email, name, plan: 'free' }, token });
  } catch (err: unknown) {
    console.error('Registration Error:', err);
    return c.json({ error: 'Registration failed', ...devDetails(c.env, err) }, 500);
  }
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();

    if (!email || !isValidEmail(email) || !password) {
      return c.json({ error: 'Valid email and password required' }, 400);
    }

    if (!c.env.DB) {
      console.error('Database binding DB is missing');
      return c.json({ error: 'Server configuration error: Database missing' }, 500);
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

    // Log activity — non-blocking
    logActivity(c, user.id, 'login', 'user', user.id);

    return c.json({
      user: { id: user.id, email: user.email, name: user.name, store_handle: user.store_handle, plan: user.plan },
      token,
    });
  } catch (err: unknown) {
    console.error('Login Error:', err);
    return c.json({ error: 'Login failed', ...devDetails(c.env, err) }, 500);
  }
});

// POST /api/auth/logout
auth.post('/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  return c.json({ success: true });
});

// GET /api/auth/me — get current user
auth.get('/me', async (c) => {
  const tokenStr = extractToken(c);
  if (!tokenStr) return c.json({ user: null });

  const decoded = await verifyToken(tokenStr, c.env.JWT_SECRET);
  if (!decoded) return c.json({ user: null });

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, store_handle, avatar_url, plan, store_name, store_logo_url, store_settings, created_at FROM users WHERE id = ?'
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
      subject: 'Reset your SHOPUBLISH password',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#4f46e5;">Reset Your Password</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>We received a request to reset your password for your SHOPUBLISH account. Click the button below to set a new password:</p>
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
