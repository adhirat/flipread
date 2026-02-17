-- Migration 007: Add store_handle to users for robust store URLs
ALTER TABLE users ADD COLUMN store_handle TEXT;

-- Populate existing handles from sanitized names + short ID suffix for uniqueness
UPDATE users SET store_handle = LOWER(REPLACE(name, ' ', '-')) || '-' || SUBSTR(id, 1, 4) WHERE store_handle IS NULL;

-- Ensure handles are unique and indexed
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_store_handle ON users(store_handle);
