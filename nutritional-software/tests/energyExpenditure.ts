// Author: Marty
// Area: Backend / API / Logic / Testing

import { describe, expect, it } from "vitest";
import { calculateEnergyExpenditure } from "@/lib/nutrition/energyExpenditure";
import type { ProfileData } from "@/types/profile";

const baseProfile: ProfileData = {
  patientName: "Test Patient",
  age: 25,
  gender: "Female",
  weight: 70,
  height: 170,
  activityLevel: "Active",
  measurementSystem: "Metric",
};

describe("calculateEnergyExpenditure", () => {
  it("calculates BMR and TDEE for a metric female profile", () => {
    const result = calculateEnergyExpenditure(baseProfile);

    expect(result.bmrKcal).toBe(1451);
    expect(result.tdeeKcal).toBe(2249);
    expect(result.activityMultiplier).toBe(1.55);
    expect(result.bmi).toBe(24.2);
    expect(result.bmiCategory).toBe("Healthy weight");
  });

  it("calculates BMR and TDEE for a metric male profile", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      gender: "Male",
    });

    expect(result.bmrKcal).toBe(1617);
    expect(result.tdeeKcal).toBe(2506);
    expect(result.formula).toBe("Mifflin-St Jeor male equation");
  });

  it("converts imperial height and weight before calculating", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      weight: 154.3,
      height: 5.58,
      measurementSystem: "Imperial",
    });

    expect(result.bmrKcal).toBeGreaterThan(1440);
    expect(result.bmrKcal).toBeLessThan(1465);
    expect(result.bmiCategory).toBe("Healthy weight");
  });

  it("averages male and female BMR equations when gender is not specific", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      gender: "Prefer not to say",
    });

    expect(result.bmrKcal).toBe(1534);
    expect(result.notes.length).toBeGreaterThan(0);
  });
});