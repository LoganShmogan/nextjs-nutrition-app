// Author: Marty & Logan
// Area: Backend / API / Logic / Testing

import { getProfileBasedNutrientTargets } from "@/lib/nutrition/thresholds";
import type {
  LoggedFood,
  NutrientComparison,
  NutrientStatus,
  NutritionAnalysisResult,
  NutritionTotals,
} from "@/types/nutrition";
import type { ProfileData } from "@/types/profile";

const EMPTY_TOTALS: NutritionTotals = {
  energyKcal: 0,
  energyKj: 0,
  protein: 0,
  carbohydrate: 0,
  fat: 0,
  sugar: 0,
  sodium: 0,
  fibre: 0,
  calcium: 0,
  iron: 0,
  vitaminC: 0,
};

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function scaleNutrient(value: number | null | undefined, grams: number): number {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }

  return (value * grams) / 100;
}

function getNutrientStatus(
  percentage: number,
  lowBelowPercentage: number,
  highAbovePercentage: number,
): NutrientStatus {
  if (lowBelowPercentage > 0 && percentage < lowBelowPercentage) {
    return "low";
  }

  if (percentage > highAbovePercentage) {
    return "high";
  }

  return "ok";
}

function getComparisonMessage(
  label: string,
  status: NutrientStatus,
  percentage: number,
): string {
  if (status === "low") {
    return `${label} intake is below the target at ${roundOne(percentage)}%.`;
  }

  if (status === "high") {
    return `${label} intake is above the target at ${roundOne(percentage)}%.`;
  }

  return `${label} intake is within the target range at ${roundOne(
    percentage,
  )}%.`;
}

export function calculateNutrition(loggedFoods: LoggedFood[]): NutritionTotals {
  const totals: NutritionTotals = { ...EMPTY_TOTALS };

  for (const loggedFood of loggedFoods) {
    if (!loggedFood.food || loggedFood.amount <= 0) {
      continue;
    }

    const nutrients = loggedFood.food.nutrients;

    totals.energyKcal += scaleNutrient(nutrients.energyKcal, loggedFood.amount);
    totals.energyKj += scaleNutrient(nutrients.energyKj, loggedFood.amount);
    totals.protein += scaleNutrient(nutrients.protein, loggedFood.amount);
    totals.carbohydrate += scaleNutrient(
      nutrients.carbohydrate,
      loggedFood.amount,
    );
    totals.fat += scaleNutrient(nutrients.fat, loggedFood.amount);
    totals.sugar += scaleNutrient(nutrients.sugar, loggedFood.amount);
    totals.sodium += scaleNutrient(nutrients.sodium, loggedFood.amount);
    totals.fibre += scaleNutrient(nutrients.fibre, loggedFood.amount);
    totals.calcium += scaleNutrient(nutrients.calcium, loggedFood.amount);
    totals.iron += scaleNutrient(nutrients.iron, loggedFood.amount);
    totals.vitaminC += scaleNutrient(nutrients.vitaminC, loggedFood.amount);
  }

  return {
    energyKcal: roundOne(totals.energyKcal),
    energyKj: roundOne(totals.energyKj),
    protein: roundOne(totals.protein),
    carbohydrate: roundOne(totals.carbohydrate),
    fat: roundOne(totals.fat),
    sugar: roundOne(totals.sugar),
    sodium: roundOne(totals.sodium),
    fibre: roundOne(totals.fibre),
    calcium: roundOne(totals.calcium),
    iron: roundOne(totals.iron),
    vitaminC: roundOne(totals.vitaminC),
  };
}

export function compareNutritionToTargets(
  totals: NutritionTotals,
  profile?: ProfileData,
): NutrientComparison[] {
  const targets = getProfileBasedNutrientTargets(profile);

  return Object.entries(targets).map(([nutrient, target]) => {
    const nutrientKey = nutrient as keyof NutritionTotals;
    const total = totals[nutrientKey];
    const percentage = target.target > 0 ? (total / target.target) * 100 : 0;

    return {
      nutrient: nutrientKey,
      label: target.label,
      unit: target.unit,
      total,
      target: target.target,
      percentage: roundOne(percentage),
      status,
      basis: target.basis,
      message: getComparisonMessage(target.label, status, percentage),
    };
  });
}

export function analyseNutrition(
  loggedFoods: LoggedFood[],
): NutritionAnalysisResult {
  const totals = calculateNutrition(loggedFoods);
  const comparisons = compareNutritionToTargets(totals, profile);

  return {
    totals,
    comparisons,
    summary: {
      totalFoods: loggedFoods.length,
      totalAmount: roundOne(
        loggedFoods.reduce((sum, food) => sum + food.amount, 0),
      ),
      lowCount: comparisons.filter((item) => item.status === "low").length,
      okCount: comparisons.filter((item) => item.status === "ok").length,
      highCount: comparisons.filter((item) => item.status === "high").length,
    },
  };
}