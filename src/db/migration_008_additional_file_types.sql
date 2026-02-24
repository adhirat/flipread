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
