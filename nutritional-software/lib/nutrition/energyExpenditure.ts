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

function convertHeightToCm(
  height: number,
  measurementSystem: ProfileData["measurementSystem"],
): number {
  if (measurementSystem === "Imperial") {
    return height * 30.48;
  }

  return height;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Healthy weight";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese range";
}

function calculateBmr(
  gender: Gender,
  age: number,
  weightKg: number,
  heightCm: number,
): { bmr: number; formula: string; notes: string[] } {
  const notes: string[] = [];

