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

  if (!isPositiveNumber(body.weight)) {
    return "Weight must be a positive number.";
  }

  if (!isPositiveNumber(body.height)) {
    return "Height must be a positive number.";
  }

  if (!body.activityLevel || !VALID_ACTIVITY_LEVELS.includes(body.activityLevel)) {
    return "Activity level is required.";
  }

  if (
    !body.measurementSystem ||
    !VALID_MEASUREMENT_SYSTEMS.includes(body.measurementSystem)
  ) {
    return "Measurement system must be Metric or Imperial.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EnergyExpenditureRequestBody;
  const validationError = validateProfile(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const profile = body as ProfileData;
  const energyExpenditure = calculateEnergyExpenditure(profile);

  return NextResponse.json({
    profile,
    energyExpenditure,
  });
}