import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env, Variables } from '../lib/types';

const promotions = new Hono<{ Bindings: Env; Variables: Variables }>();

// List all user promotions
promotions.get('/', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  try {
    const p = await c.env.DB.prepare('SELECT * FROM promotions WHERE store_id = ? ORDER BY created_at DESC').bind(user.id).all();
    return c.json(p.results || []);
  } catch (e: any) {
    if (e.message && e.message.includes('no such table')) return c.json([]);
    return c.json({ error: 'Failed to load promotions', details: e.message }, 500);
  }
});

// Create/Update Promotion
promotions.post('/', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json<any>();
  let { id, promocode, description, discount_type, discount_value, expiry_date, min_quantity, min_price, target_users, categories, status } = body;
  
  if (!id) id = crypto.randomUUID();
  if (!promocode || !discount_type || !discount_value) return c.json({ error: 'Required fields missing' }, 400);

  const categoriesJson = categories ? JSON.stringify(categories) : '[]';

  try {
    await c.env.DB.prepare(
      `INSERT INTO promotions (id, store_id, promocode, description, discount_type, discount_value, expiry_date, min_quantity, min_price, target_users, categories, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET promocode=excluded.promocode, description=excluded.description, discount_type=excluded.discount_type,
       discount_value=excluded.discount_value, expiry_date=excluded.expiry_date, min_quantity=excluded.min_quantity, min_price=excluded.min_price,
       target_users=excluded.target_users, categories=excluded.categories, status=excluded.status, updated_at=datetime('now')`
    ).bind(id, user.id, promocode, description, discount_type, discount_value, expiry_date, min_quantity, min_price, target_users, categoriesJson, status).run();

    return c.json({ success: true, id });
  } catch (e: any) {
    return c.json({ error: 'Save failed', details: e.message }, 500);
  }
});

export default promotions;
