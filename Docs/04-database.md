# Database Design

## Overview

The app uses **SQLite** via the `better-sqlite3` Node.js driver. The database file lives at `data/nutrition.db` and is created automatically on first server startup. SQLite was chosen for its zero-configuration setup — no database server, no connection strings, no Docker container for the DB.

WAL (Write-Ahead Logging) mode is enabled for better concurrent read performance:
```typescript
_db.pragma("journal_mode = WAL");
```

## Database Connection

**File:** `lib/db.ts`

The database uses a **singleton pattern**. A module-level variable `_db` holds the connection, and `getDb()` returns it (creating it on first call):

```typescript
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  // ... create tables and run migrations
  return _db;
}
```

Every API route calls `getDb()` to get the same connection instance. Since `better-sqlite3` is synchronous, there are no connection pools or async/await for queries — you just call `.prepare(sql).all()` or `.prepare(sql).run()`.

## Schema

### `users` Table

Stores authentication accounts.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user ID |
| `username` | TEXT | NOT NULL, UNIQUE | Login identifier |
| `password` | TEXT | NOT NULL | Password (plaintext in dev) |
| `created_at` | TEXT | DEFAULT datetime('now') | Account creation timestamp |

### `profiles` Table

Stores patient profiles. Each user can have multiple profiles (one per patient).

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique profile ID |
| `user_id` | INTEGER | REFERENCES users(id) | Owner (added via migration) |
| `patient_name` | TEXT | NOT NULL | Patient's name |
| `age` | INTEGER | NOT NULL | Age in years |
| `gender` | TEXT | NOT NULL | Female, Male, Other, or Prefer not to say |
| `ethnicity` | TEXT | | Ethnic background |
| `weight` | REAL | NOT NULL | Body weight (kg or lbs) |
| `height` | REAL | NOT NULL | Height (cm or feet) |
| `activity_level` | TEXT | NOT NULL | Sedentary / Lightly active / Active / Very active |
| `measurement_system` | TEXT | NOT NULL | Metric or Imperial |
| `nutrition_goal` | TEXT | | Dietary goal description |
| `dietary_preference` | TEXT | | e.g. Vegetarian, Vegan |
| `dietary_restrictions` | TEXT | | Any dietary restrictions |
| `allergies` | TEXT | | Known allergies |
| `medical_conditions` | TEXT | | Relevant medical conditions |
| `medications` | TEXT | | Current medications |
| `additional_notes` | TEXT | | Free-text notes |
| `beep_test_level` | TEXT | | Fitness test result (added via migration) |
| `vo2_max` | REAL | | VO2 max measurement (added via migration) |
| `resting_heart_rate` | INTEGER | | Resting HR in bpm (added via migration) |
| `blood_pressure` | TEXT | | Blood pressure reading (added via migration) |
| `updated_at` | TEXT | DEFAULT datetime('now') | Last update timestamp |

### `food_logs` Table

Stores individual food consumption entries.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique log ID |
| `user_id` | INTEGER | REFERENCES users(id) | Owner (added via migration) |
| `profile_id` | INTEGER | REFERENCES profiles(id) | Associated patient (added via migration) |
| `food_id` | TEXT | | Reference to foods.json ID, or "SEED" for test data |
| `food_name` | TEXT | NOT NULL | Human-readable food name |
| `amount` | REAL | NOT NULL | Portion size in grams |
| `unit` | TEXT | NOT NULL | Unit of measurement (g, mL, serving) |
| `meal` | TEXT | NOT NULL | Meal type: breakfast, lunch, dinner, snack |
| `date` | TEXT | NOT NULL | Date eaten (YYYY-MM-DD) |
| `time` | TEXT | NOT NULL | Time eaten (HH:MM) |
| `energy_kcal` | REAL | | Pre-calculated kilocalories |
| `energy_kj` | REAL | | Pre-calculated kilojoules |
| `protein` | REAL | | Grams of protein |
| `carbohydrate` | REAL | | Grams of carbohydrate |
| `fat` | REAL | | Grams of fat |
| `sugar` | REAL | | Grams of sugar |
| `sodium` | REAL | | Milligrams of sodium |
| `fibre` | REAL | | Grams of dietary fibre |
| `calcium` | REAL | | Milligrams of calcium |
| `iron` | REAL | | Milligrams of iron |
| `vitamin_c` | REAL | | Milligrams of vitamin C |
| `created_at` | TEXT | DEFAULT datetime('now') | Log creation timestamp |

**Why are nutrient values stored per log entry instead of looked up at read time?**

The nutrient values are pre-calculated at log time (scaled to the actual portion size) and stored directly in the row. This means:
- Summation queries are simple `SUM()` aggregations — no joins to a food table
- Custom foods work identically to database foods
- If the food database is updated, historical logs retain their original values
- The `/api/visualisation` endpoint can aggregate by date/meal with pure SQL

### `custom_foods` Table

Stores user-created food items not found in the NZ FOODfiles database.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique food ID |
| `user_id` | INTEGER | REFERENCES users(id) | Owner (added via migration) |
| `profile_id` | INTEGER | REFERENCES profiles(id) | Associated patient (added via migration) |
| `name` | TEXT | NOT NULL | Food name |
| `energy_kcal` through `vitamin_c` | REAL | | Per-100g nutrient values |
| `created_at` | TEXT | DEFAULT datetime('now') | Creation timestamp |

### `analyses` Table

Stores saved nutrition analysis records with notes.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique analysis ID |
| `user_id` | INTEGER | REFERENCES users(id) | Owner (added via migration) |
| `profile_id` | INTEGER | REFERENCES profiles(id) | Associated patient (added via migration) |
| `analysis_name` | TEXT | NOT NULL | Name/title of the analysis |
| `patient_identifier` | TEXT | | Patient ID or reference |
| `notes` | TEXT | | Free-text analysis notes |
| `date` | TEXT | NOT NULL | Date of the analysis |
| `created_at` | TEXT | DEFAULT datetime('now') | Creation timestamp |

## Entity Relationships

```
users (1) ──── (many) profiles
  │                     │
  │                     │
  ├── (many) food_logs ─┘ (food_logs.profile_id → profiles.id)
  │
  ├── (many) custom_foods ─── (optional profile_id)
  │
  └── (many) analyses ─────── (optional profile_id)
```

- Each `user` can have multiple `profiles` (one per patient)
- Each `food_log`, `custom_food`, and `analysis` belongs to a `user`
- These records can optionally be scoped to a specific `profile` via `profile_id`
- When a profile is deleted, associated food_logs, custom_foods, and analyses are deleted in application code (not via SQL CASCADE, since the foreign keys were added via ALTER TABLE migrations)

## Migration Strategy

SQLite doesn't support `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so the app uses a try/catch approach:

```typescript
const migrations = [
  "ALTER TABLE food_logs ADD COLUMN user_id INTEGER REFERENCES users(id)",
  "ALTER TABLE food_logs ADD COLUMN profile_id INTEGER REFERENCES profiles(id)",
  // ... more columns
];
for (const sql of migrations) {
  try { _db.exec(sql); } catch {}
}
```

Each migration runs on every startup. If the column already exists, SQLite throws a "duplicate column" error which is silently caught. This is simple and reliable — no migration tracking table needed.

## How Data Is Accessed

All database access happens through `better-sqlite3`'s synchronous API in API route handlers:

```typescript
// Read: prepared statement with .all() returns array of rows
const logs = db.prepare(
  "SELECT * FROM food_logs WHERE user_id = ? AND date = ?"
).all(userId, date);

// Write: prepared statement with .run() returns { lastInsertRowid, changes }
const result = db.prepare(
  "INSERT INTO food_logs (user_id, food_name, ...) VALUES (?, ?, ...)"
).run(userId, foodName, ...);

// Aggregation: SUM queries for daily/weekly totals
const totals = db.prepare(`
  SELECT date,
         SUM(energy_kcal) as energy_kcal,
         SUM(protein) as protein,
         ...
  FROM food_logs
  WHERE user_id = ? AND date BETWEEN ? AND ?
  GROUP BY date
`).all(userId, startDate, endDate);
```

There is no query builder or abstraction layer — every API route writes its own SQL directly.
