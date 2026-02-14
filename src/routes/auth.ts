// Auth routes — registration, login, session management

import { Hono } from 'hono';
import type { Env, User } from '../lib/types';
import { generateId, hashPassword, verifyPassword } from '../lib/utils';
import { createToken } from '../middleware/auth';

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

export default auth;
