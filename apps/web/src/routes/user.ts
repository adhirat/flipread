// User routes — store settings, profile updates
import { Hono } from 'hono';
import type { Env, User } from '../lib/types';
import { authMiddleware } from '../middleware/auth';
import { StorageService } from '../services/storage';
import { logActivity } from '../lib/activity';
import { sendEmail } from '../services/email';

type Variables = { user: User };

const user = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require auth
user.use('/*', authMiddleware());

/**
 * PATCH /api/user/store
 * Updates the user's store settings and name.
 * 
 * @param {string} store_name - The new name for the store (optional)
 * @param {Record<string, string>} store_settings - JSON object of store settings (optional)
 * @returns {Promise<Response>} JSON response indicating success
 */
user.patch('/store', async (c) => {
  const currentUser = c.get('user');
  const { store_name, store_settings, store_handle } = await c.req.json<{
    store_name?: string;
    store_settings?: Record<string, string>;
    store_handle?: string;
  }>();

  const sets: string[] = [];
  const values: any[] = [];

  if (store_name !== undefined) {
    sets.push('store_name = ?');
    values.push(store_name);
  }
  if (store_settings !== undefined) {
    sets.push('store_settings = ?');
    values.push(JSON.stringify(store_settings));
  }
  if (store_handle !== undefined) {
    // Validate handle: alphanumeric and dashes only, 3-30 chars
    const handleRegex = /^[a-z0-9](-?[a-z0-9])*$/;
    if (!handleRegex.test(store_handle) || store_handle.length < 3 || store_handle.length > 30) {
      return c.json({ error: 'Store handle must be 3-30 characters, lowercase, alphanumeric and may contain single internal hyphens.' }, 400);
    }

    // Check uniqueness
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE store_handle = ? AND id != ?')
      .bind(store_handle.toLowerCase(), currentUser.id)
      .first();
    if (existing) {
      return c.json({ error: 'Store handle is already taken' }, 409);
    }

    sets.push('store_handle = ?');
    values.push(store_handle.toLowerCase());
  }

  if (sets.length === 0) return c.json({ success: true });

  sets.push("updated_at = datetime('now')");
  values.push(currentUser.id);

  await c.env.DB.prepare(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await logActivity(c, currentUser.id, 'update_store_settings', 'user', currentUser.id, { store_name });

  return c.json({ success: true });
});

/**
 * PATCH /api/user/profile
 * Updates the user's profile name.
 * 
 * @param {string} name - The new name (min 2 chars)
 */
user.patch('/profile', async (c) => {
  const currentUser = c.get('user');
  const { name } = await c.req.json<{ name: string }>();

  if (!name || name.length < 2) {
    return c.json({ error: 'Name must be at least 2 characters' }, 400);
  }

  await c.env.DB.prepare(
    "UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(name, currentUser.id).run();

  await logActivity(c, currentUser.id, 'update_profile', 'user', currentUser.id, { name });

  return c.json({ success: true });
});

/**
 * POST /api/user/store/logo
 * Uploads a logo for the store.
 * 
 * @param {File} logo - The logo file (JPEG, PNG, WebP, SVG, max 1MB)
 */
user.post('/store/logo', async (c) => {
  const currentUser = c.get('user');
  const formData = await c.req.formData();
  const file = formData.get('logo') as File | null;

  if (!file) {
    return c.json({ error: 'No logo provided' }, 400);
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return c.json({ error: 'Logo must be JPEG, PNG, WebP, or SVG' }, 400);
  }

  // Max 1MB for logo
  if (file.size > 1024 * 1024) {
    return c.json({ error: 'Logo must be under 1MB' }, 400);
  }

  const storage = new StorageService(c.env.BUCKET);

  // Delete old logo if exists
  const oldLogoKey = currentUser.store_logo_key;
  if (oldLogoKey) {
    try {
      await storage.delete(oldLogoKey);
    } catch (e) {
      console.warn('Failed to delete old logo:', e);
    }
  }

  const ext = file.name.split('.').pop() || 'png';
  const logoKey = `logos/${currentUser.id}.${ext}`;
  await storage.upload(logoKey, await file.arrayBuffer(), file.type);

  const logoUrl = `/read/api/logo/${currentUser.id}`;

  await c.env.DB.prepare(
    "UPDATE users SET store_logo_url = ?, store_logo_key = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(logoUrl, logoKey, currentUser.id).run();

  await logActivity(c, currentUser.id, 'update_store_logo', 'user', currentUser.id);

  return c.json({ success: true, logo_url: logoUrl });
});

/**
 * POST /api/user/store/hero
 * Uploads a hero background image for the store.
 */
user.post('/store/hero', async (c) => {
  const currentUser = c.get('user');
  const formData = await c.req.formData();
  const file = formData.get('hero') as File | null;

  if (!file) {
    return c.json({ error: 'No image provided' }, 400);
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return c.json({ error: 'Hero image must be JPEG, PNG, or WebP' }, 400);
  }

  // Max 2MB for hero background
  if (file.size > 2 * 1024 * 1024) {
    return c.json({ error: 'Hero image must be under 2MB' }, 400);
  }

  const storage = new StorageService(c.env.BUCKET);

  // Delete old hero if exists
  const oldHeroKey = currentUser.store_hero_key;
  if (oldHeroKey) {
    try {
      await storage.delete(oldHeroKey);
    } catch (e) {
      console.warn('Failed to delete old hero image:', e);
    }
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const heroKey = `heros/${currentUser.id}.${ext}`;
  await storage.upload(heroKey, await file.arrayBuffer(), file.type);

  const heroUrl = `/read/api/hero/${currentUser.id}`;

  await c.env.DB.prepare(
    "UPDATE users SET store_hero_url = ?, store_hero_key = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(heroUrl, heroKey, currentUser.id).run();

  await logActivity(c, currentUser.id, 'update_store_hero', 'user', currentUser.id);

  return c.json({ success: true, hero_url: heroUrl });
});

/**
 * GET /api/user/keys
 * Lists all API keys for the user.
 */
user.get('/keys', async (c) => {
  const currentUser = c.get('user');
  const keys = await c.env.DB.prepare('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC').bind(currentUser.id).all();
  return c.json({ keys: keys.results });
});

/**
 * GET /api/user/activity
 * Lists recent activity logs for the user.
 */
user.get('/activity', async (c) => {
  const currentUser = c.get('user');
  const activity = await c.env.DB.prepare('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').bind(currentUser.id).all();
  return c.json({ activity: activity.results });
});

/**
 * GET /api/user/inquiries
 * Lists all store inquiries for the user. Supports status filter.
 */
user.get('/inquiries', async (c) => {
  const currentUser = c.get('user');
  const { status } = c.req.query();
  
  let query = 'SELECT * FROM store_inquiries WHERE store_owner_id = ?';
  const params: any[] = [currentUser.id];

  if (status && ['pending', 'done', 'archived'].includes(status)) {
    query += ' AND status = ?';
    params.push(status);
  } else if (status === 'all') {
    // Show all
  } else {
    // Default: Show pending and done, exclude archived?
    // Actually, let's default to all non-archived if no status provided
    query += " AND status != 'archived'";
  }

  query += ' ORDER BY created_at DESC';
  
  const inquiries = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ inquiries: inquiries.results });
});

/**
 * PATCH /api/user/inquiries/:id
 * Updates an inquiry (status).
 */
user.patch('/inquiries/:id', async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');
  const { status } = await c.req.json<{ status: string }>();

  if (!['pending', 'done', 'archived'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE store_inquiries SET status = ? WHERE id = ? AND store_owner_id = ?'
  ).bind(status, id, currentUser.id).run();

  await logActivity(c, currentUser.id, 'update_inquiry_status', 'inquiry', id, { status });

  return c.json({ success: true });
});

/**
 * POST /api/user/inquiries/:id/respond
 * Sends an email response to an inquiry.
 */
user.post('/inquiries/:id/respond', async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');
  const { subject, message, mark_done } = await c.req.json<{ subject: string; message: string; mark_done?: boolean }>();

  const inquiry = await c.env.DB.prepare(
    'SELECT * FROM store_inquiries WHERE id = ? AND store_owner_id = ?'
  ).bind(id, currentUser.id).first();

  if (!inquiry) return c.json({ error: 'Inquiry not found' }, 404);

  // Send email response
  const sendSuccess = await sendEmail(c.env, {
    to: inquiry.email as string,
    subject: subject || `Re: Inquiry about ${currentUser.store_name || 'ShoPublish Store'}`,
    from: `${currentUser.store_name || currentUser.name} <noreply@adhirat.com>`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Response from ${currentUser.store_name || currentUser.name}</h2>
        <p>Hi ${inquiry.name},</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0; white-space: pre-wrap;">
          ${message}
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Original Inquiry: " ${inquiry.message} "
        </p>
      </div>
    `
  });

  if (!sendSuccess) {
    return c.json({ error: 'Failed to send email' }, 500);
  }

  if (mark_done) {
    await c.env.DB.prepare(
      "UPDATE store_inquiries SET status = 'done' WHERE id = ? AND store_owner_id = ?"
    ).bind(id, currentUser.id).run();
  }

  await logActivity(c, currentUser.id, 'respond_to_inquiry', 'inquiry', id);

  return c.json({ success: true });
});

/**
 * POST /api/user/keys
 * Generates a new API key.
 */
user.post('/keys', async (c) => {
  const currentUser = c.get('user');
  const key = 'sk_' + crypto.randomUUID().replace(/-/g, '');
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare('INSERT INTO api_keys (id, user_id, key_value) VALUES (?, ?, ?)').bind(id, currentUser.id, key).run();
  
  await logActivity(c, currentUser.id, 'create_api_key', 'api_key', id);

  return c.json({ success: true, key: { id, key_value: key } });
});

// DELETE /api/user/keys/:id — delete API key
user.delete('/keys/:id', async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').bind(id, currentUser.id).run();
  await logActivity(c, currentUser.id, 'delete_api_key', 'api_key', id);
  return c.json({ success: true });
});

// DELETE /api/user — delete account
user.delete('/', async (c) => {
  const currentUser = c.get('user');
  const db = c.env.DB;
  const storage = new StorageService(c.env.BUCKET);

  // 1. Get all user's books to delete files and covers
  const books = await db.prepare('SELECT file_key, cover_key FROM books WHERE user_id = ?').bind(currentUser.id).all<{ file_key: string; cover_key: string }>();
  
  const fileKeys = books.results?.flatMap(b => [b.file_key, b.cover_key].filter(Boolean)) || [];

  // 2. Delete files from R2
  const deletionPromises = fileKeys.map(key => storage.delete(key));
  
  // Also delete store logo if exists
  if (currentUser.store_logo_key) {
      deletionPromises.push(storage.delete(currentUser.store_logo_key));
  }

  await Promise.allSettled(deletionPromises);

  // 3. Cancel Stripe subscription if exists
  const sub = await db.prepare('SELECT stripe_subscription_id FROM subscriptions WHERE user_id = ?').bind(currentUser.id).first<{ stripe_subscription_id: string }>();
  if (sub?.stripe_subscription_id && c.env.STRIPE_SECRET_KEY) {
    try {
      console.log('Cancelling subscription:', sub.stripe_subscription_id);
      await fetch(`https://api.stripe.com/v1/subscriptions/${sub.stripe_subscription_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}` }
      });
    } catch(e) { console.error('Failed to cancel subscription:', e); }
  }

  // 4. Delete user record (Cascades to books, subscriptions, logs)
  await db.prepare('DELETE FROM users WHERE id = ?').bind(currentUser.id).run();

  // 5. Logout (Clear cookie)
  c.header('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

  return c.json({ success: true });
});

export default user;
