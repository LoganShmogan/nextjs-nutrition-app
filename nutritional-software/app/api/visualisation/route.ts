// Author: Logan

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId, getActiveProfileId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profileId = getActiveProfileId(request);
  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end date params required" }, { status: 400 });
  }

  const db = getDb();

  const dailyQuery = profileId
    ? `SELECT date,
        COALESCE(SUM(energy_kcal), 0) AS energy_kcal,
        COALESCE(SUM(energy_kj),   0) AS energy_kj,
        COALESCE(SUM(protein),     0) AS protein,
        COALESCE(SUM(carbohydrate),0) AS carbohydrate,
        COALESCE(SUM(fat),         0) AS fat,
        COALESCE(SUM(sugar),       0) AS sugar,
        COALESCE(SUM(sodium),      0) AS sodium,
        COALESCE(SUM(fibre),       0) AS fibre,
        COALESCE(SUM(calcium),     0) AS calcium,
        COALESCE(SUM(iron),        0) AS iron,
        COALESCE(SUM(vitamin_c),   0) AS vitamin_c,
        COUNT(*) AS entry_count
       FROM food_logs
       WHERE date BETWEEN ? AND ? AND user_id = ? AND profile_id = ?
       GROUP BY date ORDER BY date ASC`
    : `SELECT date,
        COALESCE(SUM(energy_kcal), 0) AS energy_kcal,
        COALESCE(SUM(energy_kj),   0) AS energy_kj,
        COALESCE(SUM(protein),     0) AS protein,
        COALESCE(SUM(carbohydrate),0) AS carbohydrate,
        COALESCE(SUM(fat),         0) AS fat,
        COALESCE(SUM(sugar),       0) AS sugar,
        COALESCE(SUM(sodium),      0) AS sodium,
        COALESCE(SUM(fibre),       0) AS fibre,
        COALESCE(SUM(calcium),     0) AS calcium,
        COALESCE(SUM(iron),        0) AS iron,
        COALESCE(SUM(vitamin_c),   0) AS vitamin_c,
        COUNT(*) AS entry_count
       FROM food_logs
       WHERE date BETWEEN ? AND ? AND user_id = ?
       GROUP BY date ORDER BY date ASC`;

  const dailyTotals = profileId
    ? db.prepare(dailyQuery).all(start, end, userId, profileId) as Record<string, number | string>[]
    : db.prepare(dailyQuery).all(start, end, userId) as Record<string, number | string>[];

  const mealQuery = profileId
    ? `SELECT date, meal,
        COALESCE(SUM(energy_kcal), 0) AS energy_kcal,
        COALESCE(SUM(protein),     0) AS protein,
        COALESCE(SUM(carbohydrate),0) AS carbohydrate,
        COALESCE(SUM(fat),         0) AS fat
       FROM food_logs
       WHERE date BETWEEN ? AND ? AND user_id = ? AND profile_id = ?
       GROUP BY date, meal ORDER BY date ASC, meal ASC`
    : `SELECT date, meal,
        COALESCE(SUM(energy_kcal), 0) AS energy_kcal,
        COALESCE(SUM(protein),     0) AS protein,
        COALESCE(SUM(carbohydrate),0) AS carbohydrate,
        COALESCE(SUM(fat),         0) AS fat
       FROM food_logs
       WHERE date BETWEEN ? AND ? AND user_id = ?
       GROUP BY date, meal ORDER BY date ASC, meal ASC`;

  const mealTotals = profileId
    ? db.prepare(mealQuery).all(start, end, userId, profileId) as Record<string, number | string>[]
    : db.prepare(mealQuery).all(start, end, userId) as Record<string, number | string>[];

  return NextResponse.json({ dailyTotals, mealTotals });
}
