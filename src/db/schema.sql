-- ShoPublish D1 Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT, -- null for OAuth users
  avatar_url TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free', 'basic', 'pro', 'business')),
  store_handle TEXT UNIQUE DEFAULT NULL,
  store_name TEXT DEFAULT NULL,
  store_logo_url TEXT DEFAULT '',
  store_logo_key TEXT DEFAULT '',
  store_hero_url TEXT DEFAULT '',
  store_hero_key TEXT DEFAULT '',
  store_settings TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pdf', 'epub', 'docx', 'odt', 'ods', 'odp', 'pptx', 'xlsx', 'csv', 'tsv', 'txt', 'md', 'rtf', 'html', 'image', 'audio', 'video')),
  file_key TEXT NOT NULL, -- R2 object key
  cover_url TEXT DEFAULT '',
  cover_key TEXT DEFAULT '',
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER NOT NULL DEFAULT 500,
  is_public INTEGER NOT NULL DEFAULT 1,
  password TEXT DEFAULT NULL,
  custom_domain TEXT DEFAULT NULL,
  settings TEXT DEFAULT '{}', -- JSON: background, theme, etc.
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free', 'basic', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_end TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- View logs table
CREATE TABLE IF NOT EXISTS view_logs (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  viewer_ip_hash TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  country TEXT DEFAULT '',
  viewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Store members table (for private store access)
CREATE TABLE IF NOT EXISTS store_members (
  id TEXT PRIMARY KEY,
  store_owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  access_key TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT UNIQUE DEFAULT NULL,
  verification_expires_at TEXT DEFAULT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Shared books table
CREATE TABLE IF NOT EXISTS shared_books (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id TEXT,
  can_view INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Store inquiries table (Contact Us form submissions)
CREATE TABLE IF NOT EXISTS store_inquiries (
  id TEXT PRIMARY KEY,
  store_owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'done', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_view_logs_book_id ON view_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_view_logs_viewed_at ON view_logs(viewed_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_members_owner_email ON store_members(store_owner_id, email);
CREATE INDEX IF NOT EXISTS idx_store_members_access_key ON store_members(access_key);
CREATE INDEX IF NOT EXISTS idx_shared_books_book ON shared_books(book_id);
CREATE INDEX IF NOT EXISTS idx_shared_books_recipient ON shared_books(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_shared_books_user ON shared_books(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_store_inquiries_owner ON store_inquiries(store_owner_id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
ALTER TABLE categories ADD COLUMN parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE categories ADD COLUMN image_url TEXT DEFAULT '';

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT, -- JSON array of URLs
  product_type TEXT NOT NULL CHECK(product_type IN ('digital', 'physical')),
  actual_price REAL NOT NULL DEFAULT 0,
  selling_price REAL NOT NULL DEFAULT 0,
  discount_percentage REAL DEFAULT 0,
  dimensions TEXT, -- JSON {length, width, height, unit}
  weight REAL DEFAULT 0,
  weight_unit TEXT DEFAULT 'kg',
  expiry_date TEXT,
  categories TEXT, -- JSON array of category IDs
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'draft', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  name TEXT NOT NULL, -- e.g., "Size L, Red"
  additional_price REAL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promocode TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value REAL NOT NULL,
  expiry_date TEXT,
  min_quantity INTEGER DEFAULT 0,
  min_price REAL DEFAULT 0,
  target_users TEXT DEFAULT 'all' CHECK(target_users IN ('all', 'new', 'existing')),
  categories TEXT, -- JSON array of category IDs valid for this promo
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(store_id, promocode)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES store_members(id) ON DELETE SET NULL, -- the buyer
  total_amount REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  promotion_id TEXT REFERENCES promotions(id) ON DELETE SET NULL,
  address_details TEXT, -- JSON 
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  delivery_details TEXT, -- JSON tracking info
  payment_details TEXT, -- JSON transaction ID etc.
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
  payment_date TEXT,
  delivery_instructions TEXT,
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL
);
