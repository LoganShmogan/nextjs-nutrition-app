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

