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
  carbohydrate: {
    label: "Carbohydrate",
    unit: "g",
    target: 260,
    lowBelowPercentage: 80,
    highAbovePercentage: 130,
  },
  fat: {
    label: "Fat",
    unit: "g",
    target: 70,
    lowBelowPercentage: 70,
    highAbovePercentage: 130,
  },
  sugar: {
    label: "Sugar",
    unit: "g",
    target: 50,
    lowBelowPercentage: 0,
    highAbovePercentage: 120,
  },
  sodium: {
    label: "Sodium",
    unit: "mg",
    target: 2000,
    lowBelowPercentage: 0,
    highAbovePercentage: 115,
  },
  fibre: {
    label: "Fibre",
    unit: "g",
    target: 25,
    lowBelowPercentage: 80,
    highAbovePercentage: 180,
  },
  calcium: {
    label: "Calcium",
    unit: "mg",
    target: 1000,
    lowBelowPercentage: 80,
    highAbovePercentage: 160,
  },
  iron: {
    label: "Iron",
    unit: "mg",
    target: 18,
    lowBelowPercentage: 80,
    highAbovePercentage: 160,
  },
  vitaminC: {
    label: "Vitamin C",
    unit: "mg",
    target: 45,
    lowBelowPercentage: 80,
    highAbovePercentage: 180,
  },
};