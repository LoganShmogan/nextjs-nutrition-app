// Author: Logan

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getProfileBasedNutrientTargets } from "@/lib/nutrition/thresholds";
import { getUserId } from "@/lib/session";
import type { ProfileData } from "@/types/profile";

export const runtime = "nodejs";

type DbRow = Record<string, unknown>;

function rowToProfile(row: DbRow): ProfileData {
  return {
    patientName: row.patient_name as string,
    age: row.age as number,
    gender: row.gender as ProfileData["gender"],
    ethnicity: (row.ethnicity as string) || undefined,
    weight: row.weight as number,
    height: row.height as number,
    activityLevel: row.activity_level as ProfileData["activityLevel"],
    measurementSystem: row.measurement_system as ProfileData["measurementSystem"],
    nutritionGoal: (row.nutrition_goal as string) || undefined,
    dietaryPreference: (row.dietary_preference as string) || undefined,
    dietaryRestrictions: (row.dietary_restrictions as string) || undefined,
    allergies: (row.allergies as string) || undefined,
    medicalConditions: (row.medical_conditions as string) || undefined,
    medications: (row.medications as string) || undefined,
    additionalNotes: (row.additional_notes as string) || undefined,
  };
}

function buildTargets(profile: ProfileData) {
  const t = getProfileBasedNutrientTargets(profile);
  return {
    energy_kcal: { target: t.energyKcal.target,     lowBelowPercentage: t.energyKcal.lowBelowPercentage,     highAbovePercentage: t.energyKcal.highAbovePercentage,     label: t.energyKcal.label,     unit: t.energyKcal.unit     },
    protein:      { target: t.protein.target,         lowBelowPercentage: t.protein.lowBelowPercentage,         highAbovePercentage: t.protein.highAbovePercentage,         label: t.protein.label,         unit: t.protein.unit         },
    carbohydrate: { target: t.carbohydrate.target,   lowBelowPercentage: t.carbohydrate.lowBelowPercentage,   highAbovePercentage: t.carbohydrate.highAbovePercentage,   label: t.carbohydrate.label,   unit: t.carbohydrate.unit   },
    fat:          { target: t.fat.target,             lowBelowPercentage: t.fat.lowBelowPercentage,             highAbovePercentage: t.fat.highAbovePercentage,             label: t.fat.label,             unit: t.fat.unit             },
    sugar:        { target: t.sugar.target,           lowBelowPercentage: t.sugar.lowBelowPercentage,           highAbovePercentage: t.sugar.highAbovePercentage,           label: t.sugar.label,           unit: t.sugar.unit           },
    sodium:       { target: t.sodium.target,          lowBelowPercentage: t.sodium.lowBelowPercentage,          highAbovePercentage: t.sodium.highAbovePercentage,          label: t.sodium.label,          unit: t.sodium.unit          },
    fibre:        { target: t.fibre.target,           lowBelowPercentage: t.fibre.lowBelowPercentage,           highAbovePercentage: t.fibre.highAbovePercentage,           label: t.fibre.label,           unit: t.fibre.unit           },
    calcium:      { target: t.calcium.target,         lowBelowPercentage: t.calcium.lowBelowPercentage,         highAbovePercentage: t.calcium.highAbovePercentage,         label: t.calcium.label,         unit: t.calcium.unit         },
    iron:         { target: t.iron.target,            lowBelowPercentage: t.iron.lowBelowPercentage,            highAbovePercentage: t.iron.highAbovePercentage,            label: t.iron.label,            unit: t.iron.unit            },
    vitamin_c:    { target: t.vitaminC.target,        lowBelowPercentage: t.vitaminC.lowBelowPercentage,        highAbovePercentage: t.vitaminC.highAbovePercentage,        label: t.vitaminC.label,        unit: t.vitaminC.unit        },
  };
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const db = getDb();
    const row = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId) as DbRow | undefined;

    if (!row) {
      return Response.json({ profile: null, targets: null });
    }

    const profile = rowToProfile(row);
    const targets = buildTargets(profile);

    return Response.json({ profile, targets });
  } catch {
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const db = getDb();

    db.transaction(() => {
      db.prepare("DELETE FROM profiles WHERE user_id = ?").run(userId);
      db.prepare(`
        INSERT INTO profiles (
          user_id, patient_name, age, gender, ethnicity, weight, height,
          activity_level, measurement_system, nutrition_goal, dietary_preference,
          dietary_restrictions, allergies, medical_conditions, medications,
          additional_notes, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        body.patientName,
        Number(body.age),
        body.gender,
        (body.ethnicity as string) || null,
        Number(body.weight),
        Number(body.height),
        body.activityLevel,
        body.measurementSystem,
        (body.nutritionGoal as string) || null,
        (body.dietaryPreference as string) || null,
        (body.dietaryRestrictions as string) || null,
        (body.allergies as string) || null,
        (body.medicalConditions as string) || null,
        (body.medications as string) || null,
        (body.additionalNotes as string) || null,
      );
    })();

    const profile: ProfileData = {
      patientName: body.patientName as string,
      age: Number(body.age),
      gender: body.gender as ProfileData["gender"],
      ethnicity: (body.ethnicity as string) || undefined,
      weight: Number(body.weight),
      height: Number(body.height),
      activityLevel: body.activityLevel as ProfileData["activityLevel"],
      measurementSystem: body.measurementSystem as ProfileData["measurementSystem"],
      nutritionGoal: (body.nutritionGoal as string) || undefined,
      dietaryPreference: (body.dietaryPreference as string) || undefined,
      dietaryRestrictions: (body.dietaryRestrictions as string) || undefined,
      allergies: (body.allergies as string) || undefined,
      medicalConditions: (body.medicalConditions as string) || undefined,
      medications: (body.medications as string) || undefined,
      additionalNotes: (body.additionalNotes as string) || undefined,
    };

    const targets = buildTargets(profile);

    return Response.json({ profile, targets });
  } catch {
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
