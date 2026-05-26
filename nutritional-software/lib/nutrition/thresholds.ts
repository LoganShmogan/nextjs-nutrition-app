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
  energyKj: {
    label: "Energy",
    unit: "kJ",
    target: 8786,
    lowBelowPercentage: 80,
    highAbovePercentage: 120,
  },
  protein: {
    label: "Protein",
    unit: "g",
    target: 70,
    lowBelowPercentage: 80,
    highAbovePercentage: 130,
  },

};