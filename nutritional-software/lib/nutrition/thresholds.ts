// Author: Marty 
// Area: Backend / API / Logic / Testing

import { calculateEnergyExpenditure } from "@/lib/nutrition/energyExpenditure";
import type { NutritionTotals } from "@/types/nutrition";
import type { ProfileData } from "@/types/profile";

export type NutrientTarget = {
  label: string;
  unit: string;
  target: number;
  lowBelowPercentage: number;
  highAbovePercentage: number;
  basis: string;
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
    basis: "Default adult daily energy target",
  },
  energyKj: {
    label: "Energy",
    unit: "kJ",
    target: 8786,
    lowBelowPercentage: 80,
    highAbovePercentage: 120,
    basis: "Default adult daily energy target converted to kJ",
  },
  protein: {
    label: "Protein",
    unit: "g",
    target: 70,
    lowBelowPercentage: 80,
    highAbovePercentage: 130,
    basis: "Default adult daily protein target",
  },
  carbohydrate: {
    label: "Carbohydrate",
    unit: "g",
    target: 260,
    lowBelowPercentage: 80,
    highAbovePercentage: 130,
    basis: "Default adult daily carbohydrate target",
  },
  fat: {
    label: "Fat",
    unit: "g",
    target: 70,
    lowBelowPercentage: 70,
    highAbovePercentage: 130,
    basis: "Default adult daily fat target",
  },
  sugar: {
    label: "Sugar",
    unit: "g",
    target: 50,
    lowBelowPercentage: 0,
    highAbovePercentage: 120,
    basis: "Recommended upper target for free/added sugar",
  },
  sodium: {
    label: "Sodium",
    unit: "mg",
    target: 2000,
    lowBelowPercentage: 0,
    highAbovePercentage: 115,
    basis: "Recommended upper sodium target",
  },
  fibre: {
    label: "Fibre",
    unit: "g",
    target: 25,
    lowBelowPercentage: 80,
    highAbovePercentage: 180,
    basis: "Default adult daily fibre target",
  },
  calcium: {
    label: "Calcium",
    unit: "mg",
    target: 1000,
    lowBelowPercentage: 80,
    highAbovePercentage: 160,
    basis: "Default adult calcium target",
  },
  iron: {
    label: "Iron",
    unit: "mg",
    target: 18,
    lowBelowPercentage: 80,
    highAbovePercentage: 160,
    basis: "Default adult iron target",
  },
  vitaminC: {
    label: "Vitamin C",
    unit: "mg",
    target: 45,
    lowBelowPercentage: 80,
    highAbovePercentage: 180,
    basis: "Default adult vitamin C target",
  },
};

function roundWhole(value: number): number {
  return Math.round(value);
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function getWeightKg(profile: ProfileData): number {
  if (profile.measurementSystem === "Imperial") {
    return profile.weight * 0.45359237;
  }

  return profile.weight;
}

export function getProfileBasedNutrientTargets(
  profile?: ProfileData,
): Record<keyof NutritionTotals, NutrientTarget> {
  if (!profile) {
    return DEFAULT_NUTRIENT_TARGETS;
  }

  const energyExpenditure = calculateEnergyExpenditure(profile);
  const weightKg = getWeightKg(profile);

  const proteinTarget = roundOne(weightKg * 0.8);
  const ironTarget = profile.gender === "Male" ? 8 : 18;

  return {
    ...DEFAULT_NUTRIENT_TARGETS,
    energyKcal: {
      ...DEFAULT_NUTRIENT_TARGETS.energyKcal,
      target: energyExpenditure.tdeeKcal,
      basis: `Profile-based TDEE using ${energyExpenditure.formula}`,
    },
    energyKj: {
      ...DEFAULT_NUTRIENT_TARGETS.energyKj,
      target: roundWhole(energyExpenditure.tdeeKcal * 4.184),
      basis: "Profile-based TDEE converted from kcal to kJ",
    },
    protein: {
      ...DEFAULT_NUTRIENT_TARGETS.protein,
      target: proteinTarget,
      basis: "Profile-based estimate using 0.8 g protein per kg body weight",
    },
    iron: {
      ...DEFAULT_NUTRIENT_TARGETS.iron,
      target: ironTarget,
      basis:
        profile.gender === "Male"
          ? "Profile-based adult male iron target"
          : "Profile-based adult female/general iron target",
    },
  };
}