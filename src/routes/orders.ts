import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env, Variables } from '../lib/types';

const orders = new Hono<{ Bindings: Env; Variables: Variables }>();

// List all user orders
orders.get('/', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  try {
    const p = await c.env.DB.prepare('SELECT o.*, m.name as member_name, m.email as member_email FROM orders o LEFT JOIN store_members m ON o.member_id = m.id WHERE o.store_id = ? ORDER BY o.created_at DESC').bind(user.id).all();
    return c.json(p.results || []);
  } catch (e: any) {
    if (e.message && e.message.includes('no such table')) return c.json([]);
    return c.json({ error: 'Failed to load orders', details: e.message }, 500);
  }
});

// Create/Update Order
orders.post('/', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json<any>();
  let { id, status, payment_status, delivery_instructions, comments, delivery_details } = body;
  
  if (!id) return c.json({ error: 'Order ID missing' }, 400);

  const deliveryJson = delivery_details ? JSON.stringify(delivery_details) : '{}';

  try {
    const res = await c.env.DB.prepare(
      `UPDATE orders SET status=?, payment_status=?, delivery_instructions=?, comments=?, delivery_details=?, updated_at=datetime('now') WHERE id=? AND store_id=?`
    ).bind(status, payment_status, delivery_instructions, comments, deliveryJson, id, user.id).run();

    if (res.meta.changes === 0) {
        return c.json({ error: 'Order not found or access denied' }, 404);
    }

    return c.json({ success: true, id });
  } catch (e: any) {
    return c.json({ error: 'Save failed', details: e.message }, 500);
  }
});

export default orders;
