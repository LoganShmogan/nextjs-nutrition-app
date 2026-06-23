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

    expect(result.bmrKcal).toBe(1477);
    expect(result.tdeeKcal).toBe(2289);
    expect(result.activityMultiplier).toBe(1.55);
    expect(result.bmi).toBe(24.2);
    expect(result.bmiCategory).toBe("Healthy weight");
  });

  it("calculates BMR and TDEE for a metric male profile", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      gender: "Male",
    });

    expect(result.bmrKcal).toBe(1643);
    expect(result.tdeeKcal).toBe(2546);
    expect(result.formula).toBe("Mifflin-St Jeor male equation");
  });

  it("converts imperial height and weight before calculating", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      weight: 154.3,
      height: 5.58,
      measurementSystem: "Imperial",
    });

    expect(result.bmrKcal).toBeGreaterThan(1470);
    expect(result.bmrKcal).toBeLessThan(1490);
    expect(result.bmiCategory).toBe("Healthy weight");
  });

  it("averages male and female BMR equations when gender is not specific", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      gender: "Prefer not to say",
    });

    expect(result.bmrKcal).toBe(1560);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it("averages BMR for Other gender", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      gender: "Other",
    });

    expect(result.formula).toBe(
      "Average of Mifflin-St Jeor male and female equations",
    );
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it("classifies underweight BMI", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      weight: 45,
      height: 175,
    });

    expect(result.bmi).toBeLessThan(18.5);
    expect(result.bmiCategory).toBe("Underweight");
  });

  it("classifies overweight BMI", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      weight: 85,
      height: 170,
    });

    expect(result.bmi).toBeGreaterThanOrEqual(25);
    expect(result.bmi).toBeLessThan(30);
    expect(result.bmiCategory).toBe("Overweight");
  });

  it("classifies obese BMI", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      weight: 110,
      height: 170,
    });

    expect(result.bmi).toBeGreaterThanOrEqual(30);
    expect(result.bmiCategory).toBe("Obese range");
  });

  it("uses sedentary multiplier of 1.2", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      activityLevel: "Sedentary",
    });

    expect(result.activityMultiplier).toBe(1.2);
    expect(result.activityLevel).toBe("Sedentary");
    expect(result.tdeeKcal).toBe(Math.round(result.bmrKcal * 1.2));
  });

  it("uses lightly active multiplier of 1.375", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      activityLevel: "Lightly active",
    });

    expect(result.activityMultiplier).toBe(1.375);
  });

  it("uses very active multiplier of 1.725", () => {
    const result = calculateEnergyExpenditure({
      ...baseProfile,
      activityLevel: "Very active",
    });

    expect(result.activityMultiplier).toBe(1.725);
  });

  it("returns empty notes for male and female genders", () => {
    const female = calculateEnergyExpenditure(baseProfile);
    expect(female.notes).toEqual([]);

    const male = calculateEnergyExpenditure({ ...baseProfile, gender: "Male" });
    expect(male.notes).toEqual([]);
  });

  it("produces higher BMR for males than females with same stats", () => {
    const female = calculateEnergyExpenditure(baseProfile);
    const male = calculateEnergyExpenditure({ ...baseProfile, gender: "Male" });

    expect(male.bmrKcal).toBeGreaterThan(female.bmrKcal);
  });
});