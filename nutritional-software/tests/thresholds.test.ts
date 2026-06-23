import { describe, expect, it } from "vitest";
import {
  DEFAULT_NUTRIENT_TARGETS,
  getProfileBasedNutrientTargets,
} from "@/lib/nutrition/thresholds";
import type { ProfileData } from "@/types/profile";

const femaleProfile: ProfileData = {
  patientName: "Jane Doe",
  age: 30,
  gender: "Female",
  weight: 65,
  height: 165,
  activityLevel: "Active",
  measurementSystem: "Metric",
};

const maleProfile: ProfileData = {
  patientName: "John Doe",
  age: 30,
  gender: "Male",
  weight: 80,
  height: 180,
  activityLevel: "Sedentary",
  measurementSystem: "Metric",
};

describe("DEFAULT_NUTRIENT_TARGETS", () => {
  it("has entries for all 11 tracked nutrients", () => {
    const keys = Object.keys(DEFAULT_NUTRIENT_TARGETS);
    expect(keys).toContain("energyKcal");
    expect(keys).toContain("energyKj");
    expect(keys).toContain("protein");
    expect(keys).toContain("carbohydrate");
    expect(keys).toContain("fat");
    expect(keys).toContain("sugar");
    expect(keys).toContain("sodium");
    expect(keys).toContain("fibre");
    expect(keys).toContain("calcium");
    expect(keys).toContain("iron");
    expect(keys).toContain("vitaminC");
    expect(keys.length).toBe(11);
  });

  it("has positive targets for all nutrients", () => {
    for (const target of Object.values(DEFAULT_NUTRIENT_TARGETS)) {
      expect(target.target).toBeGreaterThan(0);
    }
  });

  it("has non-empty labels and units for all nutrients", () => {
    for (const target of Object.values(DEFAULT_NUTRIENT_TARGETS)) {
      expect(target.label.length).toBeGreaterThan(0);
      expect(target.unit.length).toBeGreaterThan(0);
    }
  });
});

describe("getProfileBasedNutrientTargets", () => {
  it("returns default targets when no profile is provided", () => {
    const targets = getProfileBasedNutrientTargets();
    expect(targets).toEqual(DEFAULT_NUTRIENT_TARGETS);
  });

  it("returns default targets when profile is undefined", () => {
    const targets = getProfileBasedNutrientTargets(undefined);
    expect(targets).toEqual(DEFAULT_NUTRIENT_TARGETS);
  });

  it("overrides energy target with profile-based TDEE", () => {
    const targets = getProfileBasedNutrientTargets(femaleProfile);

    expect(targets.energyKcal.target).not.toBe(DEFAULT_NUTRIENT_TARGETS.energyKcal.target);
    expect(targets.energyKcal.target).toBeGreaterThan(0);
    expect(targets.energyKcal.basis).toContain("Profile-based TDEE");
  });

  it("overrides energyKj target with converted TDEE value", () => {
    const targets = getProfileBasedNutrientTargets(femaleProfile);

    expect(targets.energyKj.basis).toContain("Profile-based TDEE converted");
    expect(targets.energyKj.target).toBeGreaterThan(0);
  });

  it("calculates protein target from body weight at 0.8 g/kg", () => {
    const targets = getProfileBasedNutrientTargets(femaleProfile);

    expect(targets.protein.target).toBe(52);
    expect(targets.protein.basis).toContain("0.8 g protein per kg");
  });

  it("uses 8 mg iron target for males", () => {
    const targets = getProfileBasedNutrientTargets(maleProfile);
    expect(targets.iron.target).toBe(8);
    expect(targets.iron.basis).toContain("male");
  });

  it("uses 18 mg iron target for females", () => {
    const targets = getProfileBasedNutrientTargets(femaleProfile);
    expect(targets.iron.target).toBe(18);
    expect(targets.iron.basis).toContain("female");
  });

  it("uses 18 mg iron target for non-binary genders", () => {
    const targets = getProfileBasedNutrientTargets({
      ...femaleProfile,
      gender: "Other",
    });
    expect(targets.iron.target).toBe(18);
  });

  it("keeps default values for nutrients not overridden by profile", () => {
    const targets = getProfileBasedNutrientTargets(femaleProfile);

    expect(targets.sugar).toEqual(DEFAULT_NUTRIENT_TARGETS.sugar);
    expect(targets.sodium).toEqual(DEFAULT_NUTRIENT_TARGETS.sodium);
    expect(targets.fibre).toEqual(DEFAULT_NUTRIENT_TARGETS.fibre);
    expect(targets.calcium).toEqual(DEFAULT_NUTRIENT_TARGETS.calcium);
    expect(targets.carbohydrate).toEqual(DEFAULT_NUTRIENT_TARGETS.carbohydrate);
    expect(targets.fat).toEqual(DEFAULT_NUTRIENT_TARGETS.fat);
  });

  it("converts imperial weight when calculating protein target", () => {
    const imperialProfile: ProfileData = {
      ...femaleProfile,
      weight: 143.3,
      height: 5.41,
      measurementSystem: "Imperial",
    };

    const targets = getProfileBasedNutrientTargets(imperialProfile);
    expect(targets.protein.target).toBeGreaterThan(40);
    expect(targets.protein.target).toBeLessThan(60);
  });
});
