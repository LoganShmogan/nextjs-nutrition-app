// Author: Logan
// Area: Backend / API

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/visualisation?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns per-day aggregates and per-day meal breakdowns for charts
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end date params required" },
      { status: 400 }
    );
  }

  const db = getDb();

  // Daily aggregates for the week
  const dailyTotals = db
    .prepare(
      `SELECT
        date,
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
       WHERE date BETWEEN ? AND ?
       GROUP BY date
       ORDER BY date ASC`
    )
    .all(start, end) as Record<string, number | string>[];

  // Per-meal aggregates for each day
  const mealTotals = db
    .prepare(
      `SELECT
        date,
        meal,
        COALESCE(SUM(energy_kcal), 0) AS energy_kcal,
        COALESCE(SUM(protein),     0) AS protein,
        COALESCE(SUM(carbohydrate),0) AS carbohydrate,
        COALESCE(SUM(fat),         0) AS fat
       FROM food_logs
       WHERE date BETWEEN ? AND ?
       GROUP BY date, meal
       ORDER BY date ASC, meal ASC`
    )
    .all(start, end) as Record<string, number | string>[];

  return NextResponse.json({ dailyTotals, mealTotals });
}
