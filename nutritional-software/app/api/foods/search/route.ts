// Author: Logan & Marty
// Area: Backend / API / Logic

import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import type { Food, FoodSearchResult } from "@/types/food";

// ─── In-memory cache so we only read the file once per server lifecycle ───────
let foodCache: Food[] | null = null;

function getFoods(): Food[] {
  if (foodCache) return foodCache;

  const filePath = join(process.cwd(), "public", "foods.json");

  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const raw = readFileSync(filePath, "utf8");
    foodCache = JSON.parse(raw) as Food[];
    return foodCache;
  } catch {
    return [];
  }
}

// ─── GET /api/foods/search?q=chicken&limit=20 ──────────────────────────────────
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters." },
      { status: 400 }
    );
  }

  const foods = getFoods();

  if (foods.length === 0) {
    return NextResponse.json(
      { error: "Food database not found. Run the parse script first." },
      { status: 503 }
    );
  }

  // Case-insensitive search across name and shortName
  const lower = query.toLowerCase();
  const terms = lower.split(/\s+/).filter(Boolean);

  const results = foods
    .filter((food) => {
      const searchTarget = `${food.name} ${food.shortName}`.toLowerCase();
      // All terms must appear somewhere in the name
      return terms.every((term) => searchTarget.includes(term));
    })
    .slice(0, limit);

  return NextResponse.json({
    foods: results,
    total: results.length,
    query,
  });
}
