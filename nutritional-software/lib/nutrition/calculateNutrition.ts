// Author: Logan & Marty
// Area: Backend / API / Logic

import type { Food, FoodNutrients } from "@/types/food";

export type LoggedFood = {
  food: Food;
  amount: number; // grams
};

export type NutritionTotals = {
  energyKcal: number;
  energyKj: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  sugar: number;
  sodium: number;
  fibre: number;
};

/**
 * Scale a per-100g nutrient value to the given gram amount.
 * Returns 0 if the value is null (treat missing data as 0 for totals).
 */
function scaleNutrient(value: number | null, grams: number): number {
  if (value === null) return 0;
  return (value * grams) / 100;
}

/**
 * Calculate total nutrient intake from a list of logged foods.
 * All nutrient values in the database are expressed per 100g.
 */
export function calculateNutrition(loggedFoods: LoggedFood[]): NutritionTotals {
  const totals: NutritionTotals = {
    energyKcal: 0,
    energyKj: 0,
    protein: 0,
    carbohydrate: 0,
    fat: 0,
    sugar: 0,
    sodium: 0,
    fibre: 0,
  };

  for (const { food, amount } of loggedFoods) {
    const n: FoodNutrients = food.nutrients;
    totals.energyKcal += scaleNutrient(n.energyKcal, amount);
    totals.energyKj += scaleNutrient(n.energyKj, amount);
    totals.protein += scaleNutrient(n.protein, amount);
    totals.carbohydrate += scaleNutrient(n.carbohydrate, amount);
    totals.fat += scaleNutrient(n.fat, amount);
    totals.sugar += scaleNutrient(n.sugar, amount);
    totals.sodium += scaleNutrient(n.sodium, amount);
    totals.fibre += scaleNutrient(n.fibre, amount);
  }

  // Round to 1 decimal place
  for (const key of Object.keys(totals) as (keyof NutritionTotals)[]) {
    totals[key] = Math.round(totals[key] * 10) / 10;
  }

  return totals;
}
