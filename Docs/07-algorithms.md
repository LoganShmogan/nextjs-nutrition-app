# Algorithms and Calculations

This document covers every algorithm and calculation used in the app, with the actual formulas and logic explained.

## 1. Nutrient Scaling (Portion Size Adjustment)

**File:** `lib/nutrition/calculateNutrition.ts`

All foods in the NZ FOODfiles database have nutrient values expressed **per 100 grams**. When a user logs a food with a specific portion size, the nutrients must be scaled proportionally.

**Formula:**
```
scaled_value = (nutrient_per_100g × portion_grams) / 100
```

**Implementation:**
```typescript
function scaleNutrient(value: number | null | undefined, grams: number): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return (value * grams) / 100;
}
```

**Example:** Chicken breast has 31g protein per 100g. If the user eats 150g:
```
protein = (31 × 150) / 100 = 46.5g
```

Null or missing nutrient values are treated as 0 rather than propagating nulls through calculations.

## 2. Daily Nutrition Totals

**File:** `lib/nutrition/calculateNutrition.ts` → `calculateNutrition()`

To get a user's daily intake, the app sums the scaled nutrient values across all logged foods:

```
total_protein = Σ scaleNutrient(food[i].protein, food[i].amount) for all logged foods
```

This is done for all 11 tracked nutrients: energy (kcal), energy (kJ), protein, carbohydrate, fat, sugar, sodium, fibre, calcium, iron, vitamin C.

All totals are rounded to one decimal place using:
```typescript
function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}
```

## 3. BMR Calculation (Basal Metabolic Rate)

**File:** `lib/nutrition/energyExpenditure.ts`

BMR is the number of calories your body burns at rest. The app uses the **Mifflin-St Jeor equation**, which is considered the most accurate for most adults.

**Formulas:**

For **males:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
```

For **females:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

For **other/prefer not to say:**
```
BMR = average of male and female results
```

The app adds a note explaining the averaging approach when gender-specific equations cannot be applied.

**Unit Conversions (when Imperial is selected):**
```
weight_kg = weight_lbs × 0.45359237
height_cm = height_feet × 30.48
```

## 4. TDEE Calculation (Total Daily Energy Expenditure)

**File:** `lib/nutrition/energyExpenditure.ts`

TDEE estimates total daily calories including physical activity. It is calculated by multiplying BMR by an activity factor:

```
TDEE = BMR × activity_multiplier
```

**Activity Multipliers:**

| Activity Level | Multiplier | Description |
|---------------|------------|-------------|
| Sedentary | 1.2 | Little or no exercise |
| Lightly active | 1.375 | Light exercise 1-3 days/week |
| Active | 1.55 | Moderate exercise 3-5 days/week |
| Very active | 1.725 | Hard exercise 6-7 days/week |

**Example:** A 30-year-old male, 75kg, 180cm, "Active":
```
BMR = (10 × 75) + (6.25 × 180) - (5 × 30) + 5 = 750 + 1125 - 150 + 5 = 1730 kcal
TDEE = 1730 × 1.55 = 2682 kcal
```

## 5. BMI Calculation (Body Mass Index)

**File:** `lib/nutrition/energyExpenditure.ts`

```
BMI = weight_kg / (height_m)²
```

Where `height_m = height_cm / 100`.

**BMI Categories:**

| BMI Range | Category |
|-----------|----------|
| < 18.5 | Underweight |
| 18.5 – 24.9 | Healthy weight |
| 25.0 – 29.9 | Overweight |
| ≥ 30.0 | Obese range |

BMI is rounded to one decimal place.

## 6. RDI Comparison (Nutrient Status Determination)

**File:** `lib/nutrition/thresholds.ts` and `calculateNutrition.ts`

Each nutrient has a target value (either a default or profile-based), plus low and high thresholds expressed as percentages. The app calculates what percentage of the target the user has consumed:

```
percentage = (actual_intake / target) × 100
```

Then determines a status:

```typescript
function getNutrientStatus(percentage, lowBelowPercentage, highAbovePercentage): NutrientStatus {
  if (lowBelowPercentage > 0 && percentage < lowBelowPercentage) return "low";
  if (percentage > highAbovePercentage) return "high";
  return "ok";
}
```

**Default Thresholds:**

| Nutrient | Target | Low Below | High Above |
|----------|--------|-----------|------------|
| Energy | 2100 kcal | 80% | 120% |
| Protein | 70g | 80% | 130% |
| Carbohydrate | 260g | 80% | 130% |
| Fat | 70g | 70% | 130% |
| Sugar | 50g | 0% (no low) | 120% |
| Sodium | 2000mg | 0% (no low) | 115% |
| Fibre | 25g | 80% | 180% |
| Calcium | 1000mg | 80% | 160% |
| Iron | 18mg | 80% | 160% |
| Vitamin C | 45mg | 80% | 180% |

Sugar and sodium have `lowBelowPercentage = 0`, meaning there is no "low" status for these nutrients — consuming less sugar or sodium is not flagged as a problem.

## 7. Profile-Based Target Personalisation

**File:** `lib/nutrition/thresholds.ts` → `getProfileBasedNutrientTargets()`

When a patient profile exists, some targets are personalised instead of using defaults:

| Nutrient | Personalisation Rule |
|----------|---------------------|
| Energy (kcal) | Set to TDEE calculated from profile |
| Energy (kJ) | TDEE × 4.184 |
| Protein | 0.8g per kg body weight |
| Iron | 8mg for males, 18mg for females/other |

All other nutrients (carbs, fat, sugar, sodium, fibre, calcium, vitamin C) use the default targets regardless of profile.

**Example:** A 75kg male patient:
```
Protein target = 75 × 0.8 = 60.0g
Iron target = 8mg (male)
Energy target = TDEE from BMR calculation
```

## 8. Food Search Algorithm

**File:** `lib/nutrition/foods.ts` and `app/api/foods/search/route.ts`

The search algorithm is a multi-term AND filter:

1. The query string is split into space-separated terms
2. Both the query terms and food names are lowercased for case-insensitive matching
3. A food matches only if **every** term appears somewhere in the food's `name`, `shortName`, `id`, `description`, or `category`
4. Results are capped at the specified limit (default 30)

```
query = "grilled chicken"
terms = ["grilled", "chicken"]

for each food:
  searchable = lowercase(food.name + food.shortName + ...)
  if ALL terms are found in searchable:
    add to results
```

**Performance:** The entire foods.json (2,767 records) is loaded into memory on first access and cached for the server process lifetime. Searches are pure array filters — no database queries, no indexing. For 2,767 records this runs in under 1ms.

**Client-Side Debouncing:** The food-log page waits 350ms after the user stops typing before sending a search request. This prevents hammering the API on every keystroke.

## 9. Nutrient Aggregation for Visualisation

**File:** `app/api/visualisation/route.ts`

The visualisation endpoint uses SQL aggregation to compute daily and per-meal totals:

```sql
-- Daily totals
SELECT date,
       SUM(energy_kcal) as energy_kcal,
       SUM(protein) as protein,
       SUM(carbohydrate) as carbohydrate,
       SUM(fat) as fat,
       SUM(sugar) as sugar,
       SUM(sodium) as sodium,
       SUM(fibre) as fibre,
       COUNT(*) as entry_count
FROM food_logs
WHERE user_id = ? AND date BETWEEN ? AND ?
GROUP BY date
ORDER BY date

-- Meal totals (same query but also grouped by meal)
GROUP BY date, meal
```

This gives the frontend two views of the same data:
- **Daily totals** for the weekly calorie bar chart and macronutrient line chart
- **Meal totals** for the per-meal calorie breakdown chart

## 10. Chart Calculations (Client-Side)

**File:** `app/visualisation/page.tsx`

### Weekly Calorie Bar Chart
Bar heights are proportional to the maximum value in the dataset:
```
barHeight = (dayCalories / maxCalories) × 100%
```

### RDI Comparison Chart
Bars show percentage of target, with a 100% reference line:
```
barWidth = min(actualPercentage, 200%)  // capped to prevent overflow
```
A custom Chart.js plugin draws the 100% target line.

### Macronutrient Doughnut Chart
Displays the caloric contribution of each macronutrient:
```
protein_calories = protein_grams × 4
carb_calories = carb_grams × 4
fat_calories = fat_grams × 9
```

## 11. CSV/PDF Export Calculations

**File:** `components/ExportSection.tsx`

### Daily Averages
For the selected date range, the export calculates averages:
```
average_protein = sum(daily_protein) / number_of_days
```

### RDI Status in Exports
Each nutrient is categorised relative to the target:
- **Below target:** average < target
- **On target:** average ≈ target (within threshold)
- **Above target:** average > target

## 12. NZ FOODfiles Parsing Algorithm

**File:** `scripts/parse-foodfiles.mjs`

The parse script converts raw government data files into a clean JSON format:

1. **Read** `NAME.FT` (tilde-delimited) → build a map of food ID → { name, shortName }
2. **Read** `DATA.AP` (tilde-delimited) → find the header row (contains "Food Name")
3. **Match nutrient columns** using a candidate list (each nutrient has multiple possible column names, first match wins)
4. **For each data row:**
   - Skip copyright rows (starting with ©)
   - Extract food ID, name, chapter
   - Look up the name from the NAME.FT map (falls back to DATA.AP name)
   - Extract 8 nutrient values from the matched columns
   - If kJ is missing but kcal exists: derive kJ = kcal × 4.184
   - Convert string values to numbers (empty/invalid → null)
5. **Write** the array to `public/foods.json`

The candidate column approach handles different versions of the FOODfiles data where column headers may vary.
