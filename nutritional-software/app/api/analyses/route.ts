// Author: Logan

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId, getActiveProfileId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profileId = getActiveProfileId(request);
  const db = getDb();

  const rows = profileId
    ? db.prepare("SELECT * FROM analyses WHERE user_id = ? AND (profile_id = ? OR profile_id IS NULL) ORDER BY created_at DESC").all(userId, profileId)
    : db.prepare("SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return NextResponse.json({ analyses: rows });
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profileId = getActiveProfileId(request);
  const body = await request.json();
  const { analysisName, patientIdentifier, notes, date } = body;

  if (!analysisName || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO analyses (user_id, profile_id, analysis_name, patient_identifier, notes, date) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(userId, profileId ?? null, analysisName, patientIdentifier || null, notes || null, date);

  return NextResponse.json({ id: result.lastInsertRowid });
}
