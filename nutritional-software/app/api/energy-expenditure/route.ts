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
