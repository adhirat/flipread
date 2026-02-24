import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env, Variables } from '../lib/types';
import { StorageService } from '../services/storage';

const products = new Hono<{ Bindings: Env; Variables: Variables }>();

// List all user products
products.get('/', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  try {
    const p = await c.env.DB.prepare('SELECT p.*, json_group_array(json_object("id", v.id, "name", v.name, "sku", v.sku, "additional_price", v.additional_price, "stock_quantity", v.stock_quantity)) as variants FROM products p LEFT JOIN product_variants v ON v.product_id = p.id WHERE p.store_id = ? GROUP BY p.id ORDER BY p.created_at DESC').bind(user.id).all();
    return c.json(p.results || []);
  } catch (e: any) {
    if (e.message && e.message.includes('no such table')) return c.json([]);
    return c.json({ error: 'Failed to load products', details: e.message }, 500);
  }
});

// Create/Update Product
products.post('/', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json<any>();
  let { id, title, description, product_type, status, actual_price, selling_price, discount_percentage, categories, dimensions, weight, weight_unit, expiry_date, images } = body;
  
  if (!id) id = crypto.randomUUID();
  if (!title) return c.json({ error: 'Title required' }, 400);

  const imagesJson = images ? JSON.stringify(images) : '[]';
  const categoriesJson = categories ? JSON.stringify(categories) : '[]';
  const dimensionsJson = dimensions ? JSON.stringify(dimensions) : '{}';

  try {
    await c.env.DB.prepare(
      `INSERT INTO products (id, store_id, title, description, images, product_type, actual_price, selling_price, discount_percentage, dimensions, weight, weight_unit, expiry_date, categories, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, images=excluded.images, product_type=excluded.product_type,
       actual_price=excluded.actual_price, selling_price=excluded.selling_price, discount_percentage=excluded.discount_percentage,
       dimensions=excluded.dimensions, weight=excluded.weight, weight_unit=excluded.weight_unit, expiry_date=excluded.expiry_date,
       categories=excluded.categories, status=excluded.status, updated_at=datetime('now')`
    ).bind(id, user.id, title, description, imagesJson, product_type, actual_price, selling_price, discount_percentage, dimensionsJson, weight, weight_unit, expiry_date, categoriesJson, status).run();

    return c.json({ success: true, id });
  } catch (e: any) {
    return c.json({ error: 'Save failed', details: e.message }, 500);
  }
});

export default products;
