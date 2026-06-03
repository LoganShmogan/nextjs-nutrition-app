// Author: Marty
// Area: Backend / API / Logic / Testing

import { describe, expect, it } from "vitest";
import {
  analyseNutrition,
  calculateNutrition,
  compareNutritionToTargets,
} from "@/lib/nutrition/calculateNutrition";
import type { Food } from "@/types/food";

const bread: Food = {
  id: "TEST001",
  name: "Test bread",
  shortName: "Bread",
  description: "Test food",
  category: "BREAD",
  nutrients: {
    energyKcal: 230,
    energyKj: 976,
    protein: 9,
    carbohydrate: 45,
    fat: 2.4,
    sugar: 3.6,
    sodium: 460,
    fibre: 3.5,
    calcium: 85,
    iron: 3.5,
    vitaminC: 0,
  },
};

describe("calculateNutrition", () => {
  it("scales nutrients from per 100g values to logged gram amounts", () => {
    const totals = calculateNutrition([
      {
        food: bread,
        amount: 50,
      },
    ]);

    expect(totals.energyKcal).toBe(115);
    expect(totals.energyKj).toBe(488);
    expect(totals.protein).toBe(4.5);
    expect(totals.carbohydrate).toBe(22.5);
    expect(totals.fat).toBe(1.2);
    expect(totals.sodium).toBe(230);
  });

  it("adds multiple logged foods together", () => {
    const totals = calculateNutrition([
      {
        food: bread,
        amount: 100,
      },
      {
        food: bread,
        amount: 50,
      },
    ]);

    expect(totals.energyKcal).toBe(345);
    expect(totals.protein).toBe(13.5);
  });

  it("treats missing nutrient values as zero", () => {
    const foodWithMissingData: Food = {
      ...bread,
      nutrients: {
        ...bread.nutrients,
        protein: null,
      },
    };

    const totals = calculateNutrition([
      {
        food: foodWithMissingData,
        amount: 100,
      },
    ]);

    expect(totals.protein).toBe(0);
  });

  it("compares totals against nutrition targets", () => {
    const totals = calculateNutrition([
      {
        food: bread,
        amount: 100,
      },
    ]);

    const comparisons = compareNutritionToTargets(totals);
    const protein = comparisons.find((item) => item.nutrient === "protein");

    expect(protein).toBeDefined();
    expect(protein?.label).toBe("Protein");
    expect(protein?.unit).toBe("g");
  });

  it("returns a full nutrition analysis result", () => {
    const result = analyseNutrition([
      {
        food: bread,
        amount: 100,
      },
    ]);

    expect(result.totals.energyKcal).toBe(230);
    expect(result.comparisons.length).toBeGreaterThan(0);
    expect(result.summary.totalFoods).toBe(1);
    expect(result.summary.totalAmount).toBe(100);
  });
});

import type { ProfileData } from "@/types/profile";

const testProfile: ProfileData = {
  patientName: "Alex Taylor",
  age: 25,
  gender: "Female",
  weight: 70,
  height: 170,
  activityLevel: "Active",
  measurementSystem: "Metric",
};

describe("profile based RDI analysis", () => {
  it("uses profile based TDEE as the energy target", () => {
    const totals = calculateNutrition([
      {
        food: bread,
        amount: 100,
      },
    ]);

    const comparisons = compareNutritionToTargets(totals, testProfile);
    const energy = comparisons.find((item) => item.nutrient === "energyKcal");

    expect(energy).toBeDefined();
    expect(energy?.target).toBe(2289);
    expect(energy?.basis).toContain("Profile-based TDEE");
  });
