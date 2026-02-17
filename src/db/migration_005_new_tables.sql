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
