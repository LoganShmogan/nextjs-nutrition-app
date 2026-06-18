// Author: Marty & Logan
// Area: Backend / API / Logic / Testing

import { NextRequest, NextResponse } from "next/server";
import { analyseNutrition, compareNutritionToTargets } from "@/lib/nutrition/calculateNutrition";
import { findFoodById, searchFoods } from "@/lib/nutrition/foods";
import { getDb } from "@/lib/db";
import type { LoggedFood, NutritionTotals } from "@/types/nutrition";
import type { ProfileData } from "@/types/profile";

export const runtime = "nodejs";

type NutritionRequestBody = {
  profile?: ProfileData;
  date?: string;
  foods?: {
    foodId: string;
    amount: number;
    mealType?: LoggedFood["mealType"];
    eatenAt?: string;
  }[];
};

type FoodLogRow = {
  amount: number;
  energy_kcal: number | null;
  energy_kj: number | null;
  protein: number | null;
  carbohydrate: number | null;
  fat: number | null;
  sugar: number | null;
  sodium: number | null;
  fibre: number | null;
  calcium: number | null;
  iron: number | null;
  vitamin_c: number | null;
};

function roundOne(n: number) {
  return Math.round(n * 10) / 10;
}

function sumEntries(entries: FoodLogRow[]): NutritionTotals {
  const s = (key: keyof FoodLogRow) =>
    roundOne(entries.reduce((acc, e) => acc + ((e[key] as number) ?? 0), 0));
  return {
    energyKcal:   s("energy_kcal"),
    energyKj:     s("energy_kj"),
    protein:      s("protein"),
    carbohydrate: s("carbohydrate"),
    fat:          s("fat"),
    sugar:        s("sugar"),
    sodium:       s("sodium"),
    fibre:        s("fibre"),
    calcium:      s("calcium"),
    iron:         s("iron"),
    vitaminC:     s("vitamin_c"),
  };
}

function isValidAmount(amount: unknown): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") ?? "";
  const limit = Number(searchParams.get("limit") ?? 20);

  const foods = await searchFoods(query, Number.isFinite(limit) ? limit : 20);

  return NextResponse.json({
    query,
    count: foods.length,
    foods,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as NutritionRequestBody;

  // Date mode: sum pre-computed nutrient values from food_logs for that date
  if (body.date) {
    const userId = request.cookies.get("session_user_id")?.value;
    const db = getDb();
    const entries = db
      .prepare("SELECT * FROM food_logs WHERE date = ? AND (user_id = ? OR user_id IS NULL)")
      .all(body.date, userId ? parseInt(userId, 10) : 0) as FoodLogRow[];

    const totals = sumEntries(entries);
    const comparisons = compareNutritionToTargets(totals, body.profile);
    const analysis = {
      totals,
      comparisons,
      summary: {
        totalFoods: entries.length,
        totalAmount: roundOne(entries.reduce((s, e) => s + (e.amount ?? 0), 0)),
        lowCount:  comparisons.filter((c) => c.status === "low").length,
        okCount:   comparisons.filter((c) => c.status === "ok").length,
        highCount: comparisons.filter((c) => c.status === "high").length,
      },
    };
    return NextResponse.json({ profile: body.profile ?? null, foods: [], analysis });
  }

  if (!body.foods || !Array.isArray(body.foods)) {
    return NextResponse.json(
      {
        error: "Invalid request. Expected foods array or date.",
      },
      { status: 400 },
    );
  }

  const loggedFoods: LoggedFood[] = [];

  for (const item of body.foods) {
    if (!item.foodId || !isValidAmount(item.amount)) {
      return NextResponse.json(
        {
          error:
            "Invalid food item. Each item needs a foodId and positive amount.",
        },
        { status: 400 },
      );
    }

    const food = await findFoodById(item.foodId);

    if (!food) {
      return NextResponse.json(
        {
          error: `Food item not found: ${item.foodId}`,
        },
        { status: 404 },
      );
    }

    loggedFoods.push({
      food,
      amount: item.amount,
      mealType: item.mealType,
      eatenAt: item.eatenAt,
    });
  }

  const analysis = analyseNutrition(loggedFoods, body.profile);

  return NextResponse.json({
    profile: body.profile ?? null,
    foods: loggedFoods,
    analysis,
  });
}