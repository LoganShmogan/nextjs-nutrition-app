// Author: Logan

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM custom_foods WHERE user_id = ? ORDER BY name ASC")
    .all(userId);
  return NextResponse.json({ foods: rows });
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { name, energy_kcal, energy_kj, protein, carbohydrate, fat, sugar, sodium, fibre } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO custom_foods
        (user_id, name, energy_kcal, energy_kj, protein, carbohydrate, fat, sugar, sodium, fibre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      userId, name,
      energy_kcal ?? null, energy_kj ?? null, protein ?? null,
      carbohydrate ?? null, fat ?? null, sugar ?? null,
      sodium ?? null, fibre ?? null,
    );

  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM custom_foods WHERE id = ? AND user_id = ?").run(id, userId);
  return NextResponse.json({ ok: true });
}
