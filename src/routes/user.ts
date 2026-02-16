// User routes — store settings, profile updates
import { Hono } from 'hono';
import type { Env, User } from '../lib/types';
import { authMiddleware } from '../middleware/auth';
import { StorageService } from '../services/storage';

type Variables = { user: User };

const user = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require auth
user.use('/*', authMiddleware());

// PATCH /api/user/store — update store settings
user.patch('/store', async (c) => {
  const currentUser = c.get('user');
  const { store_name, store_settings } = await c.req.json<{
    store_name?: string;
    store_settings?: Record<string, string>;
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

  if (sets.length === 0) return c.json({ success: true });

  sets.push("updated_at = datetime('now')");
  values.push(currentUser.id);

  await c.env.DB.prepare(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

// POST /api/user/store/logo — upload store logo
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

  return c.json({ success: true, logo_url: logoUrl });
});

// DELETE /api/user — delete account
user.delete('/', async (c) => {
  const currentUser = c.get('user');
  const db = c.env.DB;
  const storage = new StorageService(c.env.BUCKET);

  // 1. Get all user's books to delete files
  const books = await db.prepare('SELECT file_key FROM books WHERE user_id = ?').bind(currentUser.id).all<{ file_key: string }>();
  
  const fileKeys = books.results?.map(b => b.file_key) || [];

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
