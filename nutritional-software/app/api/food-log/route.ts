// Author: Logan

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const db = getDb();

  if (date) {
    const rows = db
      .prepare("SELECT * FROM food_logs WHERE date = ? ORDER BY time ASC")
      .all(date);
    return NextResponse.json({ logs: rows });
  }

  if (startDate && endDate) {
    const rows = db
      .prepare(
        "SELECT * FROM food_logs WHERE date BETWEEN ? AND ? ORDER BY date ASC, time ASC"
      )
      .all(startDate, endDate);
    return NextResponse.json({ logs: rows });
  }

  const rows = db
    .prepare("SELECT * FROM food_logs ORDER BY date DESC, time DESC LIMIT 100")
    .all();
  return NextResponse.json({ logs: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    food_id,
    food_name,
    amount,
    unit,
    meal,
    date,
    time,
    energy_kcal,
    energy_kj,
    protein,
    carbohydrate,
    fat,
    sugar,
    sodium,
    fibre,
    calcium,
    iron,
    vitamin_c,
  } = body;

  if (!food_name || !amount || !meal || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO food_logs
        (food_id, food_name, amount, unit, meal, date, time,
         energy_kcal, energy_kj, protein, carbohydrate, fat, sugar,
         sodium, fibre, calcium, iron, vitamin_c)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      food_id ?? null,
      food_name,
      amount,
      unit ?? "grams (g)",
      meal,
      date,
      time,
      energy_kcal ?? null,
      energy_kj ?? null,
      protein ?? null,
      carbohydrate ?? null,
      fat ?? null,
      sugar ?? null,
      sodium ?? null,
      fibre ?? null,
      calcium ?? null,
      iron ?? null,
      vitamin_c ?? null
    );

  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM food_logs WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
