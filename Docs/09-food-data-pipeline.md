# Food Data Pipeline

## Overview

The app's food search is powered by the **NZ FOODfiles** — a government-maintained food composition database containing approximately 2,700 New Zealand foods. Each food has up to 86 nutrients measured per 100 grams.

The pipeline has three stages:

```
Raw Data Files          Parse Script           Application
(DATA.AP, NAME.FT) ──→ (parse-foodfiles.mjs) ──→ (foods.json) ──→ API Route ──→ Frontend
   Tilde-delimited         Run once manually        JSON array       In-memory     Search UI
   text files              via npm run parse-foods   2767 records     cached        + log form
```

## Stage 1: Raw Data Files

### `data/raw/NAME.FT`

A tilde-delimited text file mapping food IDs to human-readable names:

```
F00001~Biscuit, chocolate, chocolate coated~Choc biscuit
F00002~Biscuit, cream filled~Cream biscuit
...
```

Format: `FoodID~FullName~ShortName`

### `data/raw/DATA.AP`

A tilde-delimited text file with the actual nutrient composition data. The first few rows are headers, then each subsequent row contains one food's full nutrient profile:

```
FoodID~Chapter~Food Name~Energy, total metabolisable (kcal)~Protein, total~...
F00001~A~Biscuit, chocolate~485~6.2~...
```

This file has up to 89 columns per row, covering all measured nutrients.

## Stage 2: The Parse Script

**File:** `scripts/parse-foodfiles.mjs`

Run manually with `npm run parse-foods` (or `node scripts/parse-foodfiles.mjs`).

### What It Does

1. **Reads both files** from `data/raw/`, trying `.txt` extension as fallback
2. **Parses tilde delimiters** — splits each line on `~` (not commas, since food names contain commas)
3. **Builds the name map** from NAME.FT: `foodId → { name, shortName }`
4. **Finds the header row** in DATA.AP by looking for a row containing "Food Name"
5. **Matches nutrient columns** using a candidate list system

### Column Matching

Different versions of the FOODfiles use different column headers for the same nutrient. The script handles this with a candidate list — it tries multiple possible names for each nutrient and uses the first match:

```javascript
const NUTRIENT_CANDIDATES = {
  energyKcal: [
    "Energy, total metabolisable (kcal, including dietary fibre)",
    "Energy, total metabolisable (kcal, excluding dietary fibre)",
    "Energy (kcal)",
  ],
  protein: [
    "Protein, total; calculated from total nitrogen",
    "Protein",
    "Protein, total",
  ],
  // ... same for carbohydrate, fat, sugar, sodium, fibre
};
```

### Nutrients Extracted

The script extracts 8 nutrients per food (from a possible 86+):

| Nutrient | Unit | Key |
|----------|------|-----|
| Energy | kcal | `energyKcal` |
| Energy | kJ | `energyKj` |
| Protein | g | `protein` |
| Carbohydrate | g | `carbohydrate` |
| Fat | g | `fat` |
| Sugar | g | `sugar` |
| Sodium | mg | `sodium` |
| Dietary Fibre | g | `fibre` |

If kJ is missing from the raw data but kcal exists, the script derives it: `kJ = kcal × 4.184`.

### Output Format

Each food record in the output JSON looks like:

```json
{
  "id": "F00001",
  "name": "Biscuit, chocolate, chocolate coated",
  "shortName": "Choc biscuit",
  "chapter": "A",
  "nutrients": {
    "energyKcal": 485,
    "energyKj": 2029,
    "protein": 6.2,
    "carbohydrate": 65.1,
    "fat": 22.3,
    "sugar": 38.5,
    "sodium": 270,
    "fibre": 2.8
  }
}
```

The output is written to `public/foods.json` as a flat JSON array with no pretty-printing (minimal whitespace) to keep the file size manageable.

### Value Handling

- Empty strings → `null`
- Non-numeric strings → `null`
- Valid numbers → parsed as floats
- Copyright/metadata rows (starting with ©) → skipped

## Stage 3: Application Usage

### Server-Side Caching

**File:** `lib/nutrition/foods.ts`

The food data is loaded from `public/foods.json` on first request and cached in a module-level variable for the lifetime of the server process:

```typescript
let cachedFoods: Food[] | null = null;

export function getAllFoods(): Food[] {
  if (cachedFoods) return cachedFoods;
  const raw = readFileSync("public/foods.json", "utf-8");
  cachedFoods = JSON.parse(raw);
  return cachedFoods;
}
```

This means:
- First search request: reads file from disk (~50ms)
- All subsequent searches: pure in-memory array filter (~0.1ms)
- The cache is only cleared when the server process restarts

### Search API

**File:** `app/api/foods/search/route.ts`

The search splits the query into terms and filters the cached array:

```
Input: "grilled chicken breast"
Terms: ["grilled", "chicken", "breast"]
Match: food where ALL three terms appear in name/shortName (case-insensitive)
```

Results are capped at the specified limit (default 30) and returned as JSON.

### Client-Side Usage

**File:** `app/food-log/page.tsx`

1. User types in search box
2. After 350ms of no typing (debounce), fetch fires to `/api/foods/search?q=...`
3. Results render as clickable food buttons
4. Clicking a food shows the nutrient panel — values come from the search response, no second API call
5. Adjusting portion size recalculates nutrients client-side using the scaling formula
6. Logging a food sends pre-calculated values to `/api/food-log`

### Custom Foods

Foods not in the NZ FOODfiles database can be entered manually. Custom foods are stored in the `custom_foods` SQLite table with the same nutrient fields. The food-log page merges custom foods into search results so they appear alongside database foods.

## Why This Architecture?

**Why parse once, not on every request?**
Parsing tilde-delimited files with column matching on every API call would be wasteful. The data changes only when the government updates the FOODfiles (rarely). Running the parse script once produces a clean JSON file that the app can load instantly.

**Why JSON on disk instead of a database table?**
The food data is read-only reference data. A JSON file cached in memory gives faster lookups than database queries and keeps the database reserved for user-generated data that actually changes.

**Why only 8 nutrients out of 86?**
The 8 selected nutrients cover the most commonly tracked macronutrients (energy, protein, carbs, fat) and key micronutrients (sugar, sodium, fibre). Adding more would increase complexity without proportional benefit for the app's use case. Calcium, iron, and vitamin C are tracked in the database schema but come from manual entry in the current data pipeline.

**Why tilde-delimited instead of CSV?**
The NZ FOODfiles use tilde (`~`) as a delimiter because food names frequently contain commas (e.g., "Chicken, breast, grilled"). Using commas as delimiters would require quoting rules and make parsing more complex.
