PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  subscription TEXT NOT NULL,
  manage_hash TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  method INTEGER NOT NULL,
  minute_offset INTEGER NOT NULL,
  lead INTEGER NOT NULL,
  enabled TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Africa/Algiers',
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS delivered (
  id TEXT PRIMARY KEY,
  sent_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS timing_cache (
  id TEXT PRIMARY KEY,
  timings TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS subscribers_updated ON subscribers(updated_at);
CREATE INDEX IF NOT EXISTS delivered_created ON delivered(sent_at);
CREATE INDEX IF NOT EXISTS timing_created ON timing_cache(created_at);
