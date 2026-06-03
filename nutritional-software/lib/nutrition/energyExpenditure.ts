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

  if (gender === "Male") {
    return {
      bmr: 10 * weightKg + 6.25 * heightCm - 5 * age + 5,
      formula: "Mifflin-St Jeor male equation",
      notes,
    };
  }

  if (gender === "Female") {
    return {
      bmr: 10 * weightKg + 6.25 * heightCm - 5 * age - 161,
      formula: "Mifflin-St Jeor female equation",
      notes,
    };
  }

  notes.push(
    "Gender-specific BMR equation was not selected, so the male and female Mifflin-St Jeor results were averaged.",
  );

  const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  return {
    bmr: (maleBmr + femaleBmr) / 2,
    formula: "Average of Mifflin-St Jeor male and female equations",
    notes,
  };
}

export function calculateEnergyExpenditure(
  profile: ProfileData,
): EnergyExpenditureResult {
  const weightKg = convertWeightToKg(profile.weight, profile.measurementSystem);
  const heightCm = convertHeightToCm(profile.height, profile.measurementSystem);
  const heightM = heightCm / 100;
  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];

  const bmrResult = calculateBmr(
    profile.gender,
    profile.age,
    weightKg,
    heightCm,
  );

  const bmi = weightKg / (heightM * heightM);
  const tdeeKcal = bmrResult.bmr * activityMultiplier;

  return {
    bmrKcal: roundWhole(bmrResult.bmr),
    tdeeKcal: roundWhole(tdeeKcal),
    activityMultiplier,
    activityLevel: profile.activityLevel,
    formula: bmrResult.formula,
    bmi: roundOne(bmi),
    bmiCategory: getBmiCategory(bmi),
    notes: bmrResult.notes,
  };
}