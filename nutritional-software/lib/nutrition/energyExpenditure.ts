// Author: Marty & Logan
// Area: Backend / API / Logic / Testing

import type { ActivityLevel, Gender, ProfileData } from "@/types/profile";

export type EnergyExpenditureResult = {
  bmrKcal: number;
  tdeeKcal: number;
  activityMultiplier: number;
  activityLevel: ActivityLevel;
  formula: string;
  bmi: number;
  bmiCategory: string;
  notes: string[];
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  Sedentary: 1.2,
  "Lightly active": 1.375,
  Active: 1.55,
  "Very active": 1.725,
};

function roundWhole(value: number): number {
  return Math.round(value);
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function convertWeightToKg(
  weight: number,
  measurementSystem: ProfileData["measurementSystem"],
): number {
  if (measurementSystem === "Imperial") {
    return weight * 0.45359237;
  }

  return weight;
}

