// Author: Marty & Logan
// Area: Backend / API / Logic / Testing

import { NextRequest, NextResponse } from "next/server";
import { calculateEnergyExpenditure } from "@/lib/nutrition/energyExpenditure";
import type {
  ActivityLevel,
  Gender,
  MeasurementSystem,
  ProfileData,
} from "@/types/profile";

export const runtime = "nodejs";

const VALID_GENDERS: Gender[] = [
  "Female",
  "Male",
  "Other",
  "Prefer not to say",
];

const VALID_ACTIVITY_LEVELS: ActivityLevel[] = [
  "Sedentary",
  "Lightly active",
  "Active",
  "Very active",
];

const VALID_MEASUREMENT_SYSTEMS: MeasurementSystem[] = ["Metric", "Imperial"];

type EnergyExpenditureRequestBody = Partial<ProfileData>;

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function validateProfile(body: EnergyExpenditureRequestBody): string | null {
  if (!body.patientName || typeof body.patientName !== "string") {
    return "Patient name is required.";
  }

  if (!isPositiveNumber(body.age) || body.age > 120) {
    return "Age must be a positive number up to 120.";
  }

  if (!body.gender || !VALID_GENDERS.includes(body.gender)) {
    return "Gender is required.";
  }

