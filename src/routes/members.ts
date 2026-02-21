
import { Hono, Context } from 'hono';
import type { Env, StoreMember } from '../lib/types';
import { getCookie, setCookie } from 'hono/cookie';
import { getPlanLimits } from '../lib/plans';
import { authMiddleware } from '../middleware/auth';
import { errorPage, verificationSuccessPage } from '../services/viewerTemplates';
import { sendEmail } from '../services/email';

const members = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Apply auth middleware to all routes except public endpoints
members.use('/*', async (c, next) => {
  const path = c.req.path;
  const isPublicPost = (path.endsWith('/verify') || path.endsWith('/register') || path.endsWith('/forgot') || path.endsWith('/resend-verification')) && c.req.method === 'POST';
  const isPublicGet = path.includes('/verify-email/') && c.req.method === 'GET';
  
  if (isPublicPost || isPublicGet) {
    return next();
  }
  return authMiddleware()(c, next);
});

// GET /api/members — List members for current user's store
members.get('/', async (c) => {
  const user = c.get('user');
  const { archived } = c.req.query();
  
  const query = archived === 'true' 
    ? `SELECT * FROM store_members WHERE store_owner_id = ? AND is_archived = 1 ORDER BY created_at DESC`
    : `SELECT * FROM store_members WHERE store_owner_id = ? AND is_archived = 0 ORDER BY created_at DESC`;

  const results = await c.env.DB.prepare(query).bind(user.id).all<StoreMember>();

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

  // When admin adds a member, they are verified and active by default
  const accessKey = crypto.randomUUID();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      `INSERT INTO store_members (id, store_owner_id, email, name, access_key, is_verified, is_active) VALUES (?, ?, ?, ?, ?, 1, 1)`
    ).bind(id, user.id, email, name || '', accessKey).run();

    // Send invite email with access key
    await sendEmail(c.env, {
      to: email,
      subject: `Invite to ${user.store_name || 'Store'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5;">You've been added to ${user.store_name || 'the store'}!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>The owner of <strong>${user.store_name || user.name}</strong> has added you as a member. You can now access their private books and collections using your unique access key:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; border: 1px dashed #cbd5e1;">
            ${accessKey}
          </div>
          <p>You can log in at: <a href="${c.env.APP_URL}/store/${user.store_handle || user.id}">${c.env.APP_URL}/store/${user.store_handle || user.id}</a></p>
          <p style="color: #64748b; font-size: 14px;">Keep your access key safe!</p>
        </div>
      `
    });

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
  const { name, is_active, is_archived } = await c.req.json();

  const updates = [];
  const validFields = [];

  if (name !== undefined) { updates.push('name = ?'); validFields.push(name); }
  if (is_active !== undefined) { updates.push('is_active = ?'); validFields.push(is_active ? 1 : 0); }
  if (is_archived !== undefined) { updates.push('is_archived = ?'); validFields.push(is_archived ? 1 : 0); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  validFields.push(id);
  validFields.push(user.id);

  await c.env.DB.prepare(
    `UPDATE store_members SET ${updates.join(', ')} WHERE id = ? AND store_owner_id = ?`
  ).bind(...validFields).run();

  return c.json({ success: true });
});

// POST /api/members/bulk — Bulk actions
members.post('/bulk', async (c) => {
  const user = c.get('user');
  const { ids, action } = await c.req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: 'No members selected' }, 400);
  }

  const placeholders = ids.map(() => '?').join(',');
  
  if (action === 'delete') {
    await c.env.DB.prepare(
      `DELETE FROM store_members WHERE store_owner_id = ? AND id IN (${placeholders})`
    ).bind(user.id, ...ids).run();
  } else if (action === 'archive') {
    await c.env.DB.prepare(
      `UPDATE store_members SET is_archived = 1 WHERE store_owner_id = ? AND id IN (${placeholders})`
    ).bind(user.id, ...ids).run();
  } else if (action === 'restore') {
     await c.env.DB.prepare(
      `UPDATE store_members SET is_archived = 0 WHERE store_owner_id = ? AND id IN (${placeholders})`
    ).bind(user.id, ...ids).run();
  } else if (action === 'activate') {
    await c.env.DB.prepare(
      `UPDATE store_members SET is_active = 1 WHERE store_owner_id = ? AND id IN (${placeholders})`
    ).bind(user.id, ...ids).run();
  } else if (action === 'deactivate') {
    await c.env.DB.prepare(
      `UPDATE store_members SET is_active = 0 WHERE store_owner_id = ? AND id IN (${placeholders})`
    ).bind(user.id, ...ids).run();
  }

  return c.json({ success: true });
});

// POST /api/members/:id/resend-verification — Admin resend
members.post('/:id/resend-verification', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const member = await c.env.DB.prepare(
    'SELECT * FROM store_members WHERE id = ? AND store_owner_id = ?'
  ).bind(id, user.id).first<StoreMember>();

  if (!member) return c.json({ error: 'Member not found' }, 404);
  
  const newToken = crypto.randomUUID();
  await c.env.DB.prepare(
    `UPDATE store_members SET verification_token = ?, verification_expires_at = datetime('now', '+30 minutes') WHERE id = ?`
  ).bind(newToken, id).run();

  const verificationUrl = `${c.env.APP_URL}/api/members/verify-email/${newToken}`;
  await sendEmail(c.env, {
    to: member.email,
    subject: `Verify your account for ${user.store_name || 'the store'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Verification Request</h2>
        <p>Your store owner has resent your verification link. Click below to verify your account. <strong>This link is valid for 30 minutes.</strong></p>
        <a href="${verificationUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">Verify Email Address</a>
      </div>
    `
  });

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
members.post('/verify', async (c) => {
  const { email, access_key, owner_id } = await c.req.json();

  if (!email || !access_key || !owner_id) {
    return c.json({ error: 'Missing credentials' }, 400);
  }

  const member = await c.env.DB.prepare(
    `SELECT * FROM store_members WHERE store_owner_id = ? AND email = ? AND access_key = ?`
  ).bind(owner_id, email, access_key).first<StoreMember>();

  if (!member || member.is_archived) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  if (member.is_verified === 0) {
    return c.json({ 
      error: 'Please verify your email address.', 
      unverified: true 
    }, 401);
  }

  if (member.is_active === 0) {
    return c.json({ error: 'Your account is pending review by the store owner.' }, 401);
  }

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
  const { email, name, access_key, owner_id } = await c.req.json();
  if (!email || !owner_id || !access_key) return c.json({ error: 'Missing information' }, 400);

  const owner = await c.env.DB.prepare('SELECT id, plan, store_settings FROM users WHERE id = ?').bind(owner_id).first<{ id: string, plan: string, store_settings: string }>();
  if (!owner) return c.json({ error: 'Store not found' }, 404);

  const planLimits = getPlanLimits(owner.plan);
  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM store_members WHERE store_owner_id = ?`
  ).bind(owner_id).first<{ count: number }>();
  
  if ((countResult?.count || 0) >= planLimits.maxMembers) {
    return c.json({ error: 'Store has reached its member limit' }, 403);
  }

  const settings = JSON.parse(owner.store_settings || '{}');
  const initialActive = settings.is_private ? 0 : 1;
  const verificationToken = crypto.randomUUID();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      `INSERT INTO store_members (id, store_owner_id, email, name, access_key, is_verified, verification_token, verification_expires_at, is_active) 
       VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now', '+30 minutes'), ?)`
    ).bind(id, owner_id, email, name || '', access_key, verificationToken, initialActive).run();

    const verificationUrl = `${c.env.APP_URL}/api/members/verify-email/${verificationToken}`;
    await sendEmail(c.env, {
      to: email,
      subject: `Verify your account for ${owner.store_settings ? JSON.parse(owner.store_settings).store_name : 'the store'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to ${owner.store_settings ? JSON.parse(owner.store_settings).store_name : 'our store'}</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Thank you for joining. Please verify your email address to access our private collections. <strong>This link is valid for 30 minutes.</strong></p>
          <a href="${verificationUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">Verify Email Address</a>
          <p style="color: #64748b; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    });

    return c.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ error: 'Member already exists' }, 409);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// GET /api/members/verify-email/:token — Verification link endpoint
members.get('/verify-email/:token', async (c) => {
  const token = c.req.param('token');
  const member = await c.env.DB.prepare(
    `SELECT m.id, m.store_owner_id, m.verification_expires_at, u.store_name, u.store_logo_url, u.store_handle 
     FROM store_members m JOIN users u ON m.store_owner_id = u.id 
     WHERE verification_token = ?`
  ).bind(token).first<{ id: string; store_owner_id: string; verification_expires_at: string; store_name: string; store_logo_url: string; store_handle: string }>();

  if (!member) {
    return c.html(errorPage('Invalid Link', 'This verification link is invalid or has already been used.'), 400);
  }

  const expiresAt = new Date(member.verification_expires_at + ' Z').getTime();
  const now = new Date().getTime();
  if (now > expiresAt) {
    return c.html(errorPage('Link Expired', 'This verification link has expired (valid for 30 minutes). Please log in to request a new one.'), 400);
  }

  await c.env.DB.prepare(
    'UPDATE store_members SET is_verified = 1, verification_token = NULL, verification_expires_at = NULL WHERE id = ?'
  ).bind(member.id).run();

  const homeUrl = `/store/${member.store_handle || member.store_owner_id}`;
  return c.html(verificationSuccessPage(member.store_name, homeUrl, member.store_logo_url));
});

// POST /api/members/resend-verification — Public resend
members.post('/resend-verification', async (c) => {
  const { email, owner_id } = await c.req.json();
  if (!email || !owner_id) return c.json({ error: 'Missing information' }, 400);

  const member = await c.env.DB.prepare(
    'SELECT id FROM store_members WHERE store_owner_id = ? AND email = ? AND is_verified = 0'
  ).bind(owner_id, email).first();

  if (!member) {
    return c.json({ success: true, message: 'If an unverified account exists, a new link has been sent.' });
  }

  const newToken = crypto.randomUUID();
  await c.env.DB.prepare(
    `UPDATE store_members SET verification_token = ?, verification_expires_at = datetime('now', '+30 minutes') 
     WHERE id = ?`
  ).bind(newToken, member.id).run();

    const verificationUrl = `${c.env.APP_URL}/api/members/verify-email/${newToken}`;
    await sendEmail(c.env, {
      to: email,
      subject: 'New Verification Link',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">New Verification Link</h2>
          <p>You requested a new verification link. Click the button below to verify your account. <strong>This link is valid for 30 minutes.</strong></p>
          <a href="${verificationUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">Verify Email Address</a>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    return c.json({ success: true });
});

// POST /api/members/forgot — Resend access key
members.post('/forgot', async (c) => {
  const { email, owner_id } = await c.req.json();
  if (!email || !owner_id) return c.json({ error: 'Missing information' }, 400);

  const member = await c.env.DB.prepare(
    'SELECT access_key FROM store_members WHERE store_owner_id = ? AND email = ? AND is_active = 1'
  ).bind(owner_id, email).first<{ access_key: string }>();

  if (member) {
    await sendEmail(c.env, {
      to: email,
      subject: 'Your Access Key',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Your Access Key</h2>
          <p>You requested your access key for a FlipRead store. Here it is:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; border: 1px dashed #cbd5e1; font-weight: bold;">
            ${member.access_key}
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });
  }

  return c.json({ success: true });
});

export default members;
