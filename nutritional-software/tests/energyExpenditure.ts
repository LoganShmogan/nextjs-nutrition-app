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
