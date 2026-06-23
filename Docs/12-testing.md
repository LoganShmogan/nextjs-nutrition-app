# Testing

## Test Framework

The project uses **Vitest** for unit testing. Tests are located in the `nutritional-software/tests/` directory.

## Running Tests

```bash
cd nutritional-software
npm run test
```

This runs `vitest run`, which executes all test files once and exits (no watch mode).

## Test Files

### `tests/calculateNutrition.test.ts`

Tests the core nutrition calculation engine in `lib/nutrition/calculateNutrition.ts`.

**What's tested:**
- `calculateNutrition()` — summing nutrient values across multiple logged foods with different portion sizes
- Scaling logic — verifying that 150g of a food with 31g protein per 100g correctly calculates to 46.5g
- Edge cases — empty food arrays, foods with zero amounts, null nutrient values
- `compareNutritionToTargets()` — verifying status determination (low/ok/high) against default targets
- `analyseNutrition()` — full analysis pipeline producing totals, comparisons, and summary counts
- Profile-based targets — verifying that personalised targets override defaults when a profile is provided

### `tests/validation.test.ts`

Tests input validation logic in `lib/validation/`.

### `tests/foods.test.ts`

Tests the food search functionality in `lib/nutrition/foods.ts`.

**What's tested:**
- `searchFoods()` — multi-term AND matching, case insensitivity, result limiting
- `findFoodById()` — exact ID lookup

### `tests/energyExpenditure.ts`

Tests the energy expenditure calculations in `lib/nutrition/energyExpenditure.ts`.

**What's tested:**
- BMR calculation for male, female, and non-binary profiles
- TDEE calculation with different activity levels
- BMI calculation and category assignment
- Unit conversions (Imperial to Metric)

## Test Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

The only configuration is the path alias `@/` → project root, matching the `tsconfig.json` paths. This lets test files use the same imports as source files (e.g., `@/lib/nutrition/calculateNutrition`).

## What's Not Tested

- **API routes** — no integration tests for the HTTP endpoints
- **React components** — no component rendering tests
- **Database operations** — no tests for SQL queries
- **End-to-end flows** — no Cypress/Playwright tests

The test suite focuses on the pure business logic functions that can be tested without a database or HTTP server. These are the functions most likely to have subtle bugs (scaling calculations, threshold comparisons, BMR formulas).

## Writing New Tests

To add a test, create a `.test.ts` file in the `tests/` directory:

```typescript
import { describe, it, expect } from "vitest";
import { someFunction } from "@/lib/someModule";

describe("someFunction", () => {
  it("should do the expected thing", () => {
    const result = someFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

Vitest discovers test files automatically — no registration needed.
