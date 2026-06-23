# API Reference

All API routes live under `app/api/` and follow Next.js App Router conventions. Each `route.ts` file exports named functions for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).

## Authentication

### POST `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{ "username": "string", "password": "string" }
```

**Responses:**
- `200` — Account created. Sets `session_user_id` httpOnly cookie.
  ```json
  { "ok": true }
  ```
- `400` — Missing username or password
- `409` — Username already taken
- `500` — Internal server error

### POST `/api/auth/login`

Log in to an existing account.

**Request Body:**
```json
{ "username": "string", "password": "string" }
```

**Responses:**
- `200` — Login successful. Sets `session_user_id` httpOnly cookie.
  ```json
  { "ok": true }
  ```
- `400` — Missing username or password
- `401` — Invalid credentials
- `500` — Internal server error

### POST `/api/auth/logout`

End the current session.

**Responses:**
- `200` — Session cleared. Removes `session_user_id` cookie.
  ```json
  { "ok": true }
  ```

---

## Profiles

### GET `/api/profile`

Fetch profiles for the current user.

**Query Parameters:**
- `all=true` — Return all profiles for the user (for the patient list page)

**Cookies Used:** `session_user_id`, `active_profile_id`

**Behaviour:**
- If `all=true`: returns array of all user's profiles
- If `active_profile_id` cookie is set: returns that specific profile with computed nutrient targets
- Otherwise: returns the most recent profile with computed nutrient targets

**Responses:**
- `200` — Profile data with nutrient targets
- `401` — Not authenticated

### POST `/api/profile`

Create or update a patient profile.

**Request Body:** Full `ProfileData` object (patientName, age, gender, weight, height, activityLevel, measurementSystem, etc.)

- If `body.id` is present: updates the existing profile
- If `body.id` is absent: creates a new profile

Sets `active_profile_id` cookie to the created/updated profile's ID.

**Responses:**
- `200` — Saved profile with nutrient targets
- `400` — Validation error
- `401` — Not authenticated

### DELETE `/api/profile`

Delete a profile and all associated data (food logs, custom foods, analyses).

**Query Parameters:**
- `id` (required) — Profile ID to delete

**Responses:**
- `200` — `{ "ok": true }`
- `400` — Missing ID
- `401` — Not authenticated

### POST `/api/profile/activate`

Switch the active profile.

**Request Body:**
```json
{ "profileId": 5 }
```

Sets the `active_profile_id` cookie. Validates the profile belongs to the authenticated user.

**Responses:**
- `200` — `{ "ok": true, "profileId": 5 }`
- `400` — Missing profileId
- `401` — Not authenticated
- `404` — Profile not found or doesn't belong to user

---

## Food Logging

### GET `/api/food-log`

Fetch food log entries.

**Query Parameters:**
- `date=YYYY-MM-DD` — Get logs for a specific date
- `start=YYYY-MM-DD&end=YYYY-MM-DD` — Get logs for a date range
- (no params) — Get last 100 logs

Filters by `user_id` and optionally `profile_id` (if `active_profile_id` cookie is set).

**Responses:**
- `200` — `{ "logs": [...] }`
- `401` — Not authenticated

### POST `/api/food-log`

Log a food entry.

**Request Body:**
```json
{
  "food_id": "F00123",
  "food_name": "Chicken breast, grilled",
  "amount": 150,
  "unit": "g",
  "meal": "dinner",
  "date": "2026-06-23",
  "time": "18:30",
  "energy_kcal": 247.5,
  "energy_kj": 1035.6,
  "protein": 46.5,
  "carbohydrate": 0,
  "fat": 5.25,
  "sugar": 0,
  "sodium": 112.5,
  "fibre": 0,
  "calcium": null,
  "iron": null,
  "vitamin_c": null
}
```

Nutrient values should be pre-scaled to the actual portion size (not per 100g).

**Responses:**
- `200` — `{ "id": 42 }` (the new row ID)
- `400` — Missing required fields (food_name, amount, meal, date, time)
- `401` — Not authenticated

### DELETE `/api/food-log`

Delete a food log entry.

**Query Parameters:**
- `id` (required) — Food log ID

**Responses:**
- `200` — `{ "ok": true }`
- `400` — Missing ID
- `401` — Not authenticated

---

## Food Search

### GET `/api/foods/search`

Search the NZ FOODfiles database.

**Query Parameters:**
- `q` (required, min 2 chars) — Search query
- `limit` (default 30, max 100) — Maximum results

**Authentication:** Not required.

**Search Algorithm:** Splits the query into space-separated terms. A food matches only if ALL terms appear somewhere in its `name` or `shortName` (case-insensitive). See [Algorithms](./07-algorithms.md#food-search-algorithm) for details.

**Responses:**
- `200` — `{ "foods": [...], "total": 12, "query": "chicken" }`
- `400` — Query too short (< 2 chars)
- `503` — foods.json not found (need to run `npm run parse-foods`)

---

## Nutrition Analysis

### GET `/api/nutrition-summary`

Search foods and return nutrition info (simple lookup).

**Query Parameters:**
- `query` — Search term
- `limit` (default 20)

### POST `/api/nutrition-summary`

Calculate nutrition analysis for logged foods.

**Two modes:**

**Mode 1 — Date mode** (when `body.date` is provided):
```json
{ "date": "2026-06-23" }
```
Sums all food_logs for that date from the database. Compares totals against profile-based targets.

**Mode 2 — Food array mode** (when `body.foods` is provided):
```json
{
  "foods": [
    { "foodId": "F00123", "amount": 150, "mealType": "dinner", "eatenAt": "2026-06-23T18:30:00" }
  ]
}
```
Looks up each food in foods.json, calculates scaled nutrition, and returns analysis.

**Responses:**
- `200` — `{ "profile": {...}, "foods": [...], "analysis": { "totals": {...}, "comparisons": [...], "summary": {...} } }`
- `400` — Invalid request
- `404` — Food not found in database

---

## Energy Expenditure

### POST `/api/energy-expenditure`

Calculate BMR, TDEE, and BMI for a patient profile.

**Request Body:**
```json
{
  "patientName": "Test Patient",
  "age": 30,
  "gender": "Male",
  "weight": 75,
  "height": 180,
  "activityLevel": "Active",
  "measurementSystem": "Metric"
}
```

**Validation:** All fields required. Age 1-120, gender must be valid enum, weight/height must be positive.

**Responses:**
- `200` — `{ "profile": {...}, "energyExpenditure": { "bmrKcal": 1724, "tdeeKcal": 2672, "bmi": 23.1, "bmiCategory": "Healthy weight", ... } }`
- `400` — Validation error with specific message

---

## Visualisation

### GET `/api/visualisation`

Get aggregated nutrition data for charts.

**Query Parameters:**
- `start=YYYY-MM-DD` (required)
- `end=YYYY-MM-DD` (required)

**Responses:**
- `200`:
  ```json
  {
    "dailyTotals": [
      { "date": "2026-06-23", "energy_kcal": 2100, "protein": 85, ..., "entry_count": 4 }
    ],
    "mealTotals": [
      { "date": "2026-06-23", "meal": "breakfast", "energy_kcal": 450, ... }
    ]
  }
  ```
- `400` — Missing start or end date
- `401` — Not authenticated

---

## Custom Foods

### GET `/api/custom-foods`

List all custom foods for the current user.

**Responses:**
- `200` — `{ "foods": [...] }`
- `401` — Not authenticated

### POST `/api/custom-foods`

Create a custom food entry.

**Request Body:**
```json
{
  "name": "Homemade Granola",
  "energy_kcal": 450,
  "energy_kj": 1882,
  "protein": 10,
  "carbohydrate": 65,
  "fat": 18,
  "sugar": 20,
  "sodium": 50,
  "fibre": 6
}
```

Only `name` is required. Nutrient values default to null.

**Responses:**
- `200` — `{ "id": 7 }`
- `400` — Missing name
- `401` — Not authenticated

### DELETE `/api/custom-foods`

Delete a custom food.

**Query Parameters:**
- `id` (required)

---

## Analyses

### GET `/api/analyses`

List saved analyses for the current user.

**Responses:**
- `200` — `{ "analyses": [...] }`
- `401` — Not authenticated

### POST `/api/analyses`

Save an analysis record.

**Request Body:**
```json
{
  "analysisName": "Weekly Review",
  "patientIdentifier": "Patient A",
  "notes": "Protein intake consistently below target...",
  "date": "2026-06-23"
}
```

**Responses:**
- `200` — `{ "id": 3 }`
- `400` — Missing analysisName or date
- `401` — Not authenticated

---

## Seed Data

### POST `/api/seed`

Generate 2 weeks of realistic test meal data.

Inserts food_logs entries with `food_id = "SEED"` so they can be identified and removed. Uses predefined meal templates with realistic nutritional values. Randomly skips some lunches and snacks for variety.

**Responses:**
- `200` — `{ "ok": true, "inserted": 42 }`
- `401` — Not authenticated

### DELETE `/api/seed`

Remove all seed data (entries where `food_id = "SEED"`).

**Responses:**
- `200` — `{ "ok": true, "deleted": 42 }`
- `401` — Not authenticated
