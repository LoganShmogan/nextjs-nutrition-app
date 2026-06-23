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

  it("returns zero totals for an empty food list", () => {
    const totals = calculateNutrition([]);

    expect(totals.energyKcal).toBe(0);
    expect(totals.protein).toBe(0);
    expect(totals.fat).toBe(0);
    expect(totals.carbohydrate).toBe(0);
    expect(totals.sodium).toBe(0);
  });

  it("skips foods with zero amount", () => {
    const totals = calculateNutrition([
      { food: bread, amount: 0 },
    ]);

    expect(totals.energyKcal).toBe(0);
  });

  it("skips foods with negative amount", () => {
    const totals = calculateNutrition([
      { food: bread, amount: -50 },
    ]);

    expect(totals.energyKcal).toBe(0);
  });

  it("handles food with all null nutrients", () => {
    const nullFood: Food = {
      ...bread,
      nutrients: {
        energyKcal: null,
        energyKj: null,
        protein: null,
        carbohydrate: null,
        fat: null,
        sugar: null,
        sodium: null,
        fibre: null,
        calcium: null,
        iron: null,
        vitaminC: null,
      },
    };

    const totals = calculateNutrition([{ food: nullFood, amount: 200 }]);

    expect(totals.energyKcal).toBe(0);
    expect(totals.protein).toBe(0);
    expect(totals.fat).toBe(0);
  });

  it("rounds totals to one decimal place", () => {
    const totals = calculateNutrition([{ food: bread, amount: 33 }]);
    const decimalPlaces = (n: number) => {
      const s = String(n);
      if (!s.includes(".")) return 0;
      return s.split(".")[1].length;
    };

    expect(decimalPlaces(totals.energyKcal)).toBeLessThanOrEqual(1);
    expect(decimalPlaces(totals.protein)).toBeLessThanOrEqual(1);
    expect(decimalPlaces(totals.fat)).toBeLessThanOrEqual(1);
  });

  it("scales all 11 nutrient fields", () => {
    const totals = calculateNutrition([{ food: bread, amount: 100 }]);

    expect(totals.energyKcal).toBe(230);
    expect(totals.energyKj).toBe(976);
    expect(totals.protein).toBe(9);
    expect(totals.carbohydrate).toBe(45);
    expect(totals.fat).toBe(2.4);
    expect(totals.sugar).toBe(3.6);
    expect(totals.sodium).toBe(460);
    expect(totals.fibre).toBe(3.5);
    expect(totals.calcium).toBe(85);
    expect(totals.iron).toBe(3.5);
    expect(totals.vitaminC).toBe(0);
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

  it("uses body weight to calculate profile based protein target", () => {
    const totals = calculateNutrition([
      {
        food: bread,
        amount: 100,
      },
    ]);

    const comparisons = compareNutritionToTargets(totals, testProfile);
    const protein = comparisons.find((item) => item.nutrient === "protein");

    expect(protein).toBeDefined();
    expect(protein?.target).toBe(56);
    expect(protein?.basis).toContain("0.8 g protein per kg");
  });

  it("returns messages for low, ok, and high nutrient statuses", () => {
    const result = analyseNutrition(
      [
        {
          food: bread,
          amount: 100,
        },
      ],
      testProfile,
    );

    expect(result.comparisons.length).toBeGreaterThan(0);
    expect(result.comparisons[0].message.length).toBeGreaterThan(0);
    expect(result.summary.lowCount + result.summary.okCount + result.summary.highCount).toBe(
      result.comparisons.length,
    );
  });

  it("marks nutrient as high when intake greatly exceeds target", () => {
    const highSodiumFood: Food = {
      ...bread,
      nutrients: { ...bread.nutrients, sodium: 5000 },
    };

    const totals = calculateNutrition([{ food: highSodiumFood, amount: 100 }]);
    const comparisons = compareNutritionToTargets(totals, testProfile);
    const sodium = comparisons.find((c) => c.nutrient === "sodium");

    expect(sodium?.status).toBe("high");
    expect(sodium?.message).toContain("above");
  });

  it("marks nutrient as low when intake is well below target", () => {
    const totals = calculateNutrition([{ food: bread, amount: 10 }]);
    const comparisons = compareNutritionToTargets(totals, testProfile);
    const energy = comparisons.find((c) => c.nutrient === "energyKcal");

    expect(energy?.status).toBe("low");
    expect(energy?.message).toContain("below");
  });

  it("returns correct percentage values in comparisons", () => {
    const totals = calculateNutrition([{ food: bread, amount: 100 }]);
    const comparisons = compareNutritionToTargets(totals);
    const energy = comparisons.find((c) => c.nutrient === "energyKcal");

    expect(energy?.percentage).toBeGreaterThan(0);
    expect(energy?.total).toBe(230);
  });

  it("returns 11 comparisons for all tracked nutrients", () => {
    const totals = calculateNutrition([{ food: bread, amount: 100 }]);
    const comparisons = compareNutritionToTargets(totals);

    expect(comparisons.length).toBe(11);
  });

  it("analyseNutrition summary counts match comparison statuses", () => {
    const result = analyseNutrition([{ food: bread, amount: 500 }], testProfile);

    const lowCount = result.comparisons.filter((c) => c.status === "low").length;
    const okCount = result.comparisons.filter((c) => c.status === "ok").length;
    const highCount = result.comparisons.filter((c) => c.status === "high").length;

    expect(result.summary.lowCount).toBe(lowCount);
    expect(result.summary.okCount).toBe(okCount);
    expect(result.summary.highCount).toBe(highCount);
  });

  it("analyseNutrition sums total amount from multiple foods", () => {
    const result = analyseNutrition([
      { food: bread, amount: 100 },
      { food: bread, amount: 200 },
      { food: bread, amount: 50 },
    ]);

    expect(result.summary.totalFoods).toBe(3);
    expect(result.summary.totalAmount).toBe(350);
  });

  it("comparison message for ok status contains 'within'", () => {
    const highAmountFood: Food = {
      ...bread,
      nutrients: { ...bread.nutrients, protein: 70 },
    };

    const totals = calculateNutrition([{ food: highAmountFood, amount: 100 }]);
    const comparisons = compareNutritionToTargets(totals);
    const protein = comparisons.find((c) => c.nutrient === "protein");

    expect(protein?.status).toBe("ok");
    expect(protein?.message).toContain("within");
  });
});