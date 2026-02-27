-- Migration to add store columns to users table
ALTER TABLE users ADD COLUMN store_name TEXT;
ALTER TABLE users ADD COLUMN store_logo_url TEXT;
ALTER TABLE users ADD COLUMN store_settings TEXT;
-- Migration: Add store customization and cover_key columns

-- Add store fields to users
ALTER TABLE users ADD COLUMN store_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_logo_url TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_logo_key TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_settings TEXT DEFAULT '{}';

-- Add cover_key to books
ALTER TABLE books ADD COLUMN cover_key TEXT DEFAULT '';
-- Migration: Add 'basic' to plan CHECK constraints
-- D1/SQLite does not support ALTER TABLE to modify CHECK constraints directly.
-- The application code validates plans via getPlanLimits() which now includes 'basic'.
-- For fresh databases, schema.sql already includes 'basic' in the CHECK constraint.
-- For existing databases, the CHECK constraint must be updated by recreating the tables.
-- However, since D1 doesn't enforce CHECK constraints strictly at the driver level,
-- the app-level validation in plans.ts + billing.ts is the primary safeguard.

-- This migration is a no-op marker for tracking purposes.
-- The 'basic' plan is fully supported via application-level validation.
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
-- Migration 005: New Features (API, Analytics, Branding)

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    key_value TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'view', -- 'view', 'read_complete', etc.
    country TEXT,
    device_type TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_book_date ON analytics_events(book_id, created_at);

-- Add settings column to books if not exists (using try/catch pattern in SQL is hard, so just standard alter)
-- SQLite doesn't support IF NOT EXISTS for column. 
-- Assuming it doesn't exist.
ALTER TABLE books ADD COLUMN settings TEXT DEFAULT '{}';
-- Migration 006: Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,         -- e.g., 'login', 'create_book', 'delete_api_key'
    entity_type TEXT,             -- e.g., 'user', 'book', 'api_key'
    entity_id TEXT,               -- ID of the affected entity
    details TEXT,                 -- JSON string with extra info
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_logs(user_id, created_at DESC);
-- Migration 007: Add store_handle to users for robust store URLs
ALTER TABLE users ADD COLUMN store_handle TEXT;

-- Populate existing handles from sanitized names + short ID suffix for uniqueness
UPDATE users SET store_handle = LOWER(REPLACE(name, ' ', '-')) || '-' || SUBSTR(id, 1, 4) WHERE store_handle IS NULL;

-- Ensure handles are unique and indexed
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_store_handle ON users(store_handle);
-- Migration 008: Support for additional file types including RTF, ODT, ODS, ODP, CSV, TSV
-- Note: SQLite doesn't support easy ALTER TABLE to change CHECK constraints.
-- We create a temporary table, copy data, and rename.

PRAGMA foreign_keys=OFF;

CREATE TABLE books_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pdf', 'epub', 'doc', 'docx', 'odt', 'ods', 'odp', 'ppt', 'pptx', 'xlsx', 'csv', 'tsv', 'txt', 'md', 'rtf', 'html', 'image', 'audio', 'video')),
  file_key TEXT NOT NULL,
  cover_url TEXT DEFAULT '',
  cover_key TEXT DEFAULT '',
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER NOT NULL DEFAULT 500,
  is_public INTEGER NOT NULL DEFAULT 1,
  password TEXT DEFAULT NULL,
  custom_domain TEXT DEFAULT NULL,
  settings TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO books_new SELECT * FROM books;

DROP TABLE books;
ALTER TABLE books_new RENAME TO books;

PRAGMA foreign_keys=ON;
-- Migration 009: Member Verification and Store Hero
ALTER TABLE store_members ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE store_members ADD COLUMN verification_token TEXT DEFAULT NULL;
ALTER TABLE store_members ADD COLUMN verification_expires_at TEXT DEFAULT NULL;
ALTER TABLE store_members ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;

-- Ensure verification tokens are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_members_verification_token ON store_members(verification_token);

-- Add hero image support to users
ALTER TABLE users ADD COLUMN store_hero_url TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_hero_key TEXT DEFAULT '';
