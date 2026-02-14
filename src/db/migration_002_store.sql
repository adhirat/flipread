-- Migration: Add store customization and cover_key columns

-- Add store fields to users
ALTER TABLE users ADD COLUMN store_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_logo_url TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_logo_key TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN store_settings TEXT DEFAULT '{}';

-- Add cover_key to books
ALTER TABLE books ADD COLUMN cover_key TEXT DEFAULT '';
