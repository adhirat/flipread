-- Migration: Add custom domain, settings, and new tables for sharing/privacy

-- Add custom_domain and settings to books
ALTER TABLE books ADD COLUMN custom_domain TEXT DEFAULT NULL;
ALTER TABLE books ADD COLUMN settings TEXT DEFAULT '{}';
ALTER TABLE books ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1;
ALTER TABLE books ADD COLUMN password TEXT DEFAULT NULL;

-- Store members table (for private store access)
CREATE TABLE IF NOT EXISTS store_members (
  id TEXT PRIMARY KEY,
  store_owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  access_key TEXT UNIQUE NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
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

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_members_owner_email ON store_members(store_owner_id, email);
CREATE INDEX IF NOT EXISTS idx_store_members_access_key ON store_members(access_key);
CREATE INDEX IF NOT EXISTS idx_shared_books_book ON shared_books(book_id);
CREATE INDEX IF NOT EXISTS idx_shared_books_recipient ON shared_books(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_shared_books_user ON shared_books(shared_with_user_id);
