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

  const ext = file.name.split('.').pop() || 'png';
  const logoKey = `logos/${currentUser.id}.${ext}`;
  const storage = new StorageService(c.env.BUCKET);
  await storage.upload(logoKey, await file.arrayBuffer(), file.type);

  const logoUrl = `/read/api/logo/${currentUser.id}`;

  await c.env.DB.prepare(
    "UPDATE users SET store_logo_url = ?, store_logo_key = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(logoUrl, logoKey, currentUser.id).run();

  return c.json({ success: true, logo_url: logoUrl });
});

export default user;
