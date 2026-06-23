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

    CREATE TABLE IF NOT EXISTS profiles (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name         TEXT NOT NULL,
      age                  INTEGER NOT NULL,
      gender               TEXT NOT NULL,
      ethnicity            TEXT,
      weight               REAL NOT NULL,
      height               REAL NOT NULL,
      activity_level       TEXT NOT NULL,
      measurement_system   TEXT NOT NULL,
      nutrition_goal       TEXT,
      dietary_preference   TEXT,
      dietary_restrictions TEXT,
      allergies            TEXT,
      medical_conditions   TEXT,
      medications          TEXT,
      additional_notes     TEXT,
      updated_at           TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_name       TEXT NOT NULL,
      patient_identifier  TEXT,
      notes               TEXT,
      date                TEXT NOT NULL,
      created_at          TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const migrations = [
    "ALTER TABLE food_logs     ADD COLUMN user_id INTEGER REFERENCES users(id)",
    "ALTER TABLE custom_foods  ADD COLUMN user_id INTEGER REFERENCES users(id)",
    "ALTER TABLE profiles      ADD COLUMN user_id INTEGER REFERENCES users(id)",
    "ALTER TABLE analyses      ADD COLUMN user_id INTEGER REFERENCES users(id)",
    "ALTER TABLE food_logs     ADD COLUMN profile_id INTEGER REFERENCES profiles(id)",
    "ALTER TABLE custom_foods  ADD COLUMN profile_id INTEGER REFERENCES profiles(id)",
    "ALTER TABLE analyses      ADD COLUMN profile_id INTEGER REFERENCES profiles(id)",
    "ALTER TABLE profiles      ADD COLUMN beep_test_level TEXT",
    "ALTER TABLE profiles      ADD COLUMN vo2_max REAL",
    "ALTER TABLE profiles      ADD COLUMN resting_heart_rate INTEGER",
    "ALTER TABLE profiles      ADD COLUMN blood_pressure TEXT",
  ];
  for (const sql of migrations) {
    try { _db.exec(sql); } catch {}
  }

  return _db;
}
