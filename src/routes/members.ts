
import { Hono, Context } from 'hono';
import type { Env, StoreMember } from '../lib/types';
import { getCookie, setCookie } from 'hono/cookie';
import { getPlanLimits } from '../lib/plans';
import { authMiddleware } from '../middleware/auth';

const members = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Apply auth middleware to all routes except /verify
members.use('/*', async (c, next) => {
  // Skip auth for the public verify endpoint
  if ((c.req.path.endsWith('/verify') || c.req.path.endsWith('/register') || c.req.path.endsWith('/forgot')) && c.req.method === 'POST') {
    return next();
  }
  return authMiddleware()(c, next);
});

// GET /api/members — List members for current user's store
members.get('/', async (c) => {
  const user = c.get('user');
  
  const results = await c.env.DB.prepare(
    `SELECT * FROM store_members WHERE store_owner_id = ? ORDER BY created_at DESC`
  ).bind(user.id).all<StoreMember>();

  return c.json({ members: results.results || [] });
});

// POST /api/members — Add a new member
members.post('/', async (c) => {
  const user = c.get('user');
  const { email, name } = await c.req.json();

  if (!email) return c.json({ error: 'Email is required' }, 400);

  // Check plan limits
  const planLimits = getPlanLimits(user.plan);
  const maxMembers = planLimits.maxMembers;

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM store_members WHERE store_owner_id = ?`
  ).bind(user.id).first<{ count: number }>();
  
  const count = countResult?.count || 0;

  if (count >= maxMembers) {
    return c.json({ error: `Plan limit reached. Your ${user.plan} plan allows ${maxMembers} members. Upgrade to add more.` }, 403);
  }

  // Generate Access Key
  const accessKey = crypto.randomUUID();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      `INSERT INTO store_members (id, store_owner_id, email, name, access_key) VALUES (?, ?, ?, ?, ?)`
    ).bind(id, user.id, email, name || '', accessKey).run();

    // In a real app, send email here with the key
    // await sendMemberInviteEmail(email, user.store_name, accessKey);

    return c.json({ member: { id, email, name, access_key: accessKey, is_active: 1 } });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ error: 'Member with this email already exists' }, 409);
    }
    return c.json({ error: 'Failed to add member' }, 500);
  }
});

// PATCH /api/members/:id — Update member
members.patch('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { name, is_active } = await c.req.json();

  const updates = [];
  const validFields = [];

  if (name !== undefined) { updates.push('name = ?'); validFields.push(name); }
  if (is_active !== undefined) { updates.push('is_active = ?'); validFields.push(is_active ? 1 : 0); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  validFields.push(id);
  validFields.push(user.id);

  await c.env.DB.prepare(
    `UPDATE store_members SET ${updates.join(', ')} WHERE id = ? AND store_owner_id = ?`
  ).bind(...validFields).run();

  return c.json({ success: true });
});

// DELETE /api/members/:id — Remove member
members.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  await c.env.DB.prepare(
    `DELETE FROM store_members WHERE id = ? AND store_owner_id = ?`
  ).bind(id, user.id).run();

  return c.json({ success: true });
});

// POST /api/member/verify — Public endpoint for member login
// No auth middleware, but validates access key
members.post('/verify', async (c) => {
  const { email, access_key, owner_id } = await c.req.json();

  if (!email || !access_key || !owner_id) {
    return c.json({ error: 'Missing credentials' }, 400);
  }

  const member = await c.env.DB.prepare(
    `SELECT * FROM store_members WHERE store_owner_id = ? AND email = ? AND access_key = ? AND is_active = 1`
  ).bind(owner_id, email, access_key).first<StoreMember>();

  if (!member) {
    return c.json({ error: 'Invalid credentials or inactive account' }, 401);
  }

  // Set cookie with member ID and access key signature (or just access key if HTTPS)
  // For simplicity, we just store the access key signed/encoded
  // In production, use a proper session token or signed JWT
  // Here we'll just set a simple cookie "mk_<owner_id>" = access_key
  
  const cookieName = `mk_${owner_id}`;
  setCookie(c, cookieName, access_key, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return c.json({ success: true });
});

// POST /api/members/register — Public registration
members.post('/register', async (c) => {
  const { email, name, owner_id } = await c.req.json();
  if (!email || !owner_id) return c.json({ error: 'Missing information' }, 400);

  // Check if owner exists
  const owner = await c.env.DB.prepare('SELECT id, plan FROM users WHERE id = ?').bind(owner_id).first();
  if (!owner) return c.json({ error: 'Store not found' }, 404);

  // Check plan limits
  const planLimits = getPlanLimits(owner.plan as string);
  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM store_members WHERE store_owner_id = ?`
  ).bind(owner_id).first<{ count: number }>();
  
  if ((countResult?.count || 0) >= planLimits.maxMembers) {
    return c.json({ error: 'Store has reached its member limit' }, 403);
  }

  const accessKey = crypto.randomUUID();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      `INSERT INTO store_members (id, store_owner_id, email, name, access_key) VALUES (?, ?, ?, ?, ?)`
    ).bind(id, owner_id, email, name || '', accessKey).run();

    // In production, send email with access key
    return c.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ error: 'Member already exists' }, 409);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// POST /api/members/forgot — Resend access key
members.post('/forgot', async (c) => {
  const { email, owner_id } = await c.req.json();
  if (!email || !owner_id) return c.json({ error: 'Missing information' }, 400);

  const member = await c.env.DB.prepare(
    'SELECT access_key FROM store_members WHERE store_owner_id = ? AND email = ? AND is_active = 1'
  ).bind(owner_id, email).first<{ access_key: string }>();

  if (member) {
    // In production, send email with member.access_key
  }

  // Always return success for security
  return c.json({ success: true });
});

export default members;
