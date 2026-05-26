// Author: Marty & Logan
// Area: Backend / API / Logic / Testing

import type { Food } from "@/types/food";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type LoggedFood = {
  food: Food;
  amount: number;
  mealType?: MealType;
  eatenAt?: string;
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
  calcium: number;
  iron: number;
  vitaminC: number;
};

export type NutrientStatus = "low" | "ok" | "high";

export type NutrientComparison = {
  nutrient: keyof NutritionTotals;
  label: string;
  unit: string;
  total: number;
  target: number;
  percentage: number;
  status: NutrientStatus;
};

export type NutritionAnalysisResult = {
  totals: NutritionTotals;
  comparisons: NutrientComparison[];
  summary: {
    totalFoods: number;
    totalAmount: number;
    lowCount: number;
    okCount: number;
    highCount: number;
  };
};