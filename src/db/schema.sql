-- FlipRead D1 Schema

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
  type TEXT NOT NULL CHECK(type IN ('pdf', 'epub', 'image', 'audio', 'video')),
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
