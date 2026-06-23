// Author: Logan

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getProfileBasedNutrientTargets } from "@/lib/nutrition/thresholds";
import { getUserId, getActiveProfileId } from "@/lib/session";
import type { ProfileData } from "@/types/profile";

export const runtime = "nodejs";

type DbRow = Record<string, unknown>;

function rowToProfile(row: DbRow): ProfileData {
  return {
    id: row.id as number,
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
    beepTestLevel: (row.beep_test_level as string) || undefined,
    vo2Max: row.vo2_max ? (row.vo2_max as number) : undefined,
    restingHeartRate: row.resting_heart_rate ? (row.resting_heart_rate as number) : undefined,
    bloodPressure: (row.blood_pressure as string) || undefined,
  };
}

function buildTargets(profile: ProfileData) {
  const t = getProfileBasedNutrientTargets(profile);
  return {
    energy_kcal: { target: t.energyKcal.target, lowBelowPercentage: t.energyKcal.lowBelowPercentage, highAbovePercentage: t.energyKcal.highAbovePercentage, label: t.energyKcal.label, unit: t.energyKcal.unit },
    protein:      { target: t.protein.target, lowBelowPercentage: t.protein.lowBelowPercentage, highAbovePercentage: t.protein.highAbovePercentage, label: t.protein.label, unit: t.protein.unit },
    carbohydrate: { target: t.carbohydrate.target, lowBelowPercentage: t.carbohydrate.lowBelowPercentage, highAbovePercentage: t.carbohydrate.highAbovePercentage, label: t.carbohydrate.label, unit: t.carbohydrate.unit },
    fat:          { target: t.fat.target, lowBelowPercentage: t.fat.lowBelowPercentage, highAbovePercentage: t.fat.highAbovePercentage, label: t.fat.label, unit: t.fat.unit },
    sugar:        { target: t.sugar.target, lowBelowPercentage: t.sugar.lowBelowPercentage, highAbovePercentage: t.sugar.highAbovePercentage, label: t.sugar.label, unit: t.sugar.unit },
    sodium:       { target: t.sodium.target, lowBelowPercentage: t.sodium.lowBelowPercentage, highAbovePercentage: t.sodium.highAbovePercentage, label: t.sodium.label, unit: t.sodium.unit },
    fibre:        { target: t.fibre.target, lowBelowPercentage: t.fibre.lowBelowPercentage, highAbovePercentage: t.fibre.highAbovePercentage, label: t.fibre.label, unit: t.fibre.unit },
    calcium:      { target: t.calcium.target, lowBelowPercentage: t.calcium.lowBelowPercentage, highAbovePercentage: t.calcium.highAbovePercentage, label: t.calcium.label, unit: t.calcium.unit },
    iron:         { target: t.iron.target, lowBelowPercentage: t.iron.lowBelowPercentage, highAbovePercentage: t.iron.highAbovePercentage, label: t.iron.label, unit: t.iron.unit },
    vitamin_c:    { target: t.vitaminC.target, lowBelowPercentage: t.vitaminC.lowBelowPercentage, highAbovePercentage: t.vitaminC.highAbovePercentage, label: t.vitaminC.label, unit: t.vitaminC.unit },
  };
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const listAll = searchParams.get("all") === "true";

  try {
    const db = getDb();

    if (listAll) {
      const rows = db.prepare("SELECT * FROM profiles WHERE user_id = ? ORDER BY updated_at DESC").all(userId) as DbRow[];
      const profiles = rows.map(rowToProfile);
      return Response.json({ profiles });
    }

    const profileId = getActiveProfileId(request);
    let row: DbRow | undefined;

    if (profileId) {
      row = db.prepare("SELECT * FROM profiles WHERE id = ? AND user_id = ?").get(profileId, userId) as DbRow | undefined;
    }

    if (!row) {
      row = db.prepare("SELECT * FROM profiles WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1").get(userId) as DbRow | undefined;
    }

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
    const editId = body.id ? Number(body.id) : null;

    let profileId: number;

    if (editId) {
      db.prepare(`
        UPDATE profiles SET
          patient_name = ?, age = ?, gender = ?, ethnicity = ?, weight = ?, height = ?,
          activity_level = ?, measurement_system = ?, nutrition_goal = ?, dietary_preference = ?,
          dietary_restrictions = ?, allergies = ?, medical_conditions = ?, medications = ?,
          additional_notes = ?, beep_test_level = ?, vo2_max = ?, resting_heart_rate = ?,
          blood_pressure = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `).run(
        body.patientName, Number(body.age), body.gender,
        (body.ethnicity as string) || null, Number(body.weight), Number(body.height),
        body.activityLevel, body.measurementSystem,
        (body.nutritionGoal as string) || null, (body.dietaryPreference as string) || null,
        (body.dietaryRestrictions as string) || null, (body.allergies as string) || null,
        (body.medicalConditions as string) || null, (body.medications as string) || null,
        (body.additionalNotes as string) || null, (body.beepTestLevel as string) || null,
        body.vo2Max ? Number(body.vo2Max) : null, body.restingHeartRate ? Number(body.restingHeartRate) : null,
        (body.bloodPressure as string) || null,
        editId, userId,
      );
      profileId = editId;
    } else {
      const result = db.prepare(`
        INSERT INTO profiles (
          user_id, patient_name, age, gender, ethnicity, weight, height,
          activity_level, measurement_system, nutrition_goal, dietary_preference,
          dietary_restrictions, allergies, medical_conditions, medications,
          additional_notes, beep_test_level, vo2_max, resting_heart_rate,
          blood_pressure, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId, body.patientName, Number(body.age), body.gender,
        (body.ethnicity as string) || null, Number(body.weight), Number(body.height),
        body.activityLevel, body.measurementSystem,
        (body.nutritionGoal as string) || null, (body.dietaryPreference as string) || null,
        (body.dietaryRestrictions as string) || null, (body.allergies as string) || null,
        (body.medicalConditions as string) || null, (body.medications as string) || null,
        (body.additionalNotes as string) || null, (body.beepTestLevel as string) || null,
        body.vo2Max ? Number(body.vo2Max) : null, body.restingHeartRate ? Number(body.restingHeartRate) : null,
        (body.bloodPressure as string) || null,
      );
      profileId = Number(result.lastInsertRowid);
    }

    const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(profileId) as DbRow;
    const profile = rowToProfile(row);
    const targets = buildTargets(profile);

    const res = Response.json({ profile, targets });
    res.headers.set("Set-Cookie", `active_profile_id=${profileId}; Path=/; HttpOnly; SameSite=Lax`);
    return res;
  } catch {
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM food_logs WHERE profile_id = ? AND user_id = ?").run(id, userId);
  db.prepare("DELETE FROM custom_foods WHERE profile_id = ? AND user_id = ?").run(id, userId);
  db.prepare("DELETE FROM analyses WHERE profile_id = ? AND user_id = ?").run(id, userId);
  db.prepare("DELETE FROM profiles WHERE id = ? AND user_id = ?").run(id, userId);

  return Response.json({ ok: true });
}
