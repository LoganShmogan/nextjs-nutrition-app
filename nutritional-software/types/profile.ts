// Author: Logan & Marty
// Area: Profile / Nutrition Logic / Testing 

// Author: Marty & Logan
// Area: Profile / Nutrition Logic / Testing

export type Gender = "Female" | "Male" | "Other" | "Prefer not to say";

export type ActivityLevel =
  | "Sedentary"
  | "Lightly active"
  | "Active"
  | "Very active";

export type MeasurementSystem = "Metric" | "Imperial";

export type ProfileData = {
  patientName: string;
  age: number;
  gender: Gender;
  ethnicity?: string;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
};