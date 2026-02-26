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
