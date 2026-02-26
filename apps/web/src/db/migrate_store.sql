-- Migration to add store columns to users table
ALTER TABLE users ADD COLUMN store_name TEXT;
ALTER TABLE users ADD COLUMN store_logo_url TEXT;
ALTER TABLE users ADD COLUMN store_settings TEXT;
