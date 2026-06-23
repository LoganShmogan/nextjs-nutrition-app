// Author: Logan

import { describe, expect, it } from "vitest";
import type { ProfileData } from "@/types/profile";

function isValidAge(age: number): boolean {
  return Number.isFinite(age) && age > 0 && age <= 120;
}

function isValidName(name: string): boolean {
  return name.trim().length > 0;
}

function isValidWeight(weight: number): boolean {
  return Number.isFinite(weight) && weight > 0 && weight < 500;
}

function isValidHeight(height: number): boolean {
  return Number.isFinite(height) && height > 0 && height < 300;
}

function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0;
}

function validateProfile(profile: Partial<ProfileData>): string[] {
  const errors: string[] = [];
  if (!profile.patientName || !isValidName(profile.patientName)) {
    errors.push("Patient name is required");
  }
  if (profile.age === undefined || !isValidAge(profile.age)) {
    errors.push("Age must be between 1 and 120");
  }
  if (profile.weight === undefined || !isValidWeight(profile.weight)) {
    errors.push("Weight must be a positive number under 500");
  }
  if (profile.height === undefined || !isValidHeight(profile.height)) {
    errors.push("Height must be a positive number under 300");
  }
  return errors;
}

describe("input validation", () => {
  it("rejects negative age", () => {
    expect(isValidAge(-5)).toBe(false);
  });

  it("rejects zero age", () => {
    expect(isValidAge(0)).toBe(false);
  });

  it("rejects age over 120", () => {
    expect(isValidAge(121)).toBe(false);
  });

  it("accepts valid age", () => {
    expect(isValidAge(25)).toBe(true);
  });

  it("accepts boundary age of 1", () => {
    expect(isValidAge(1)).toBe(true);
  });

  it("accepts boundary age of 120", () => {
    expect(isValidAge(120)).toBe(true);
  });

  it("rejects NaN age", () => {
    expect(isValidAge(NaN)).toBe(false);
  });

  it("rejects Infinity age", () => {
    expect(isValidAge(Infinity)).toBe(false);
  });

  it("rejects empty patient name", () => {
    expect(isValidName("")).toBe(false);
  });

  it("rejects whitespace-only patient name", () => {
    expect(isValidName("   ")).toBe(false);
  });

  it("accepts valid patient name", () => {
    expect(isValidName("John Doe")).toBe(true);
  });

  it("accepts valid weight", () => {
    expect(isValidWeight(70)).toBe(true);
  });

  it("rejects zero weight", () => {
    expect(isValidWeight(0)).toBe(false);
  });

  it("rejects negative weight", () => {
    expect(isValidWeight(-10)).toBe(false);
  });

  it("rejects weight over 500", () => {
    expect(isValidWeight(500)).toBe(false);
  });

  it("accepts boundary weight of 499", () => {
    expect(isValidWeight(499)).toBe(true);
  });

  it("rejects zero portion size", () => {
    expect(isValidAmount(0)).toBe(false);
  });

  it("rejects negative portion size", () => {
    expect(isValidAmount(-10)).toBe(false);
  });

  it("accepts positive portion size", () => {
    expect(isValidAmount(150)).toBe(true);
  });

  it("rejects zero height", () => {
    expect(isValidHeight(0)).toBe(false);
  });

  it("rejects negative height", () => {
    expect(isValidHeight(-170)).toBe(false);
  });

  it("accepts valid height", () => {
    expect(isValidHeight(170)).toBe(true);
  });

  it("rejects height over 300", () => {
    expect(isValidHeight(300)).toBe(false);
  });
});

describe("profile validation", () => {
  it("returns no errors for a valid profile", () => {
    const errors = validateProfile({
      patientName: "Test User",
      age: 30,
      weight: 70,
      height: 170,
    });
    expect(errors).toEqual([]);
  });

  it("returns error for missing patient name", () => {
    const errors = validateProfile({
      age: 30,
      weight: 70,
      height: 170,
    });
    expect(errors).toContain("Patient name is required");
  });

  it("returns error for invalid age", () => {
    const errors = validateProfile({
      patientName: "Test",
      age: -5,
      weight: 70,
      height: 170,
    });
    expect(errors).toContain("Age must be between 1 and 120");
  });

  it("returns error for invalid weight", () => {
    const errors = validateProfile({
      patientName: "Test",
      age: 30,
      weight: 0,
      height: 170,
    });
    expect(errors).toContain("Weight must be a positive number under 500");
  });

  it("returns error for invalid height", () => {
    const errors = validateProfile({
      patientName: "Test",
      age: 30,
      weight: 70,
      height: -10,
    });
    expect(errors).toContain("Height must be a positive number under 300");
  });

  it("returns multiple errors for multiple invalid fields", () => {
    const errors = validateProfile({});
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});
