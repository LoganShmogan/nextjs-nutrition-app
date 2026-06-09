// Author: Logan
// Area: Backend / API

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM custom_foods ORDER BY name ASC")
    .all();
  return NextResponse.json({ foods: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    energy_kcal,
    energy_kj,
    protein,
    carbohydrate,
    fat,
    sugar,
    sodium,
    fibre,
  } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO custom_foods
        (name, energy_kcal, energy_kj, protein, carbohydrate, fat, sugar, sodium, fibre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      energy_kcal ?? null,
      energy_kj ?? null,
      protein ?? null,
      carbohydrate ?? null,
      fat ?? null,
      sugar ?? null,
      sodium ?? null,
      fibre ?? null
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
  db.prepare("DELETE FROM custom_foods WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
