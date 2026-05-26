// Author: Marty
// Area: Backend / API / Logic / Testing

import type { NutritionTotals } from "@/types/nutrition";

export type NutrientTarget = {
  label: string;
  unit: string;
  target: number;
  lowBelowPercentage: number;
  highAbovePercentage: number;
};

export const DEFAULT_NUTRIENT_TARGETS: Record<
  keyof NutritionTotals,
  NutrientTarget
> = {
  energyKcal: {
    label: "Energy",
    unit: "kcal",
    target: 2100,
    lowBelowPercentage: 80,
    highAbovePercentage: 120,
  },

};