// Author: Logan

import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "nutrition.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS food_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id     TEXT,
      food_name   TEXT NOT NULL,
      amount      REAL NOT NULL,
      unit        TEXT NOT NULL,
      meal        TEXT NOT NULL,
      date        TEXT NOT NULL,
      time        TEXT NOT NULL,
      energy_kcal REAL,
      energy_kj   REAL,
      protein     REAL,
      carbohydrate REAL,
      fat         REAL,
      sugar       REAL,
      sodium      REAL,
      fibre       REAL,
      calcium     REAL,
      iron        REAL,
      vitamin_c   REAL,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_foods (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      energy_kcal  REAL,
      energy_kj    REAL,
      protein      REAL,
      carbohydrate REAL,
      fat          REAL,
      sugar        REAL,
      sodium       REAL,
      fibre        REAL,
      calcium      REAL,
      iron         REAL,
      vitamin_c    REAL,
      created_at   TEXT DEFAULT (datetime('now'))
    );
  `);

  return _db;
}
