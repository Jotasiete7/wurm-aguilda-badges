import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file will be created in the root of the project
const dbPath = path.join(process.cwd(), 'guilda.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema if not exists
const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  badge_id TEXT NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(badge_id) REFERENCES badges(id)
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  date_earned DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(badge_id) REFERENCES badges(id)
);

CREATE TABLE IF NOT EXISTS code_redemptions (
  id TEXT PRIMARY KEY,
  code_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(code_id) REFERENCES codes(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`;

db.exec(schema);

export default db;
