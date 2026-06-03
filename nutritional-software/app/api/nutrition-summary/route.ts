// Author: Marty & Logan
// Area: Backend / API / Logic / Testing

import { NextRequest, NextResponse } from "next/server";
import { analyseNutrition } from "@/lib/nutrition/calculateNutrition";
import { findFoodById, searchFoods } from "@/lib/nutrition/foods";
import type { LoggedFood } from "@/types/nutrition";
import type { ProfileData } from "@/types/profile";

export const runtime = "nodejs";

type NutritionRequestBody = {
  profile?: ProfileData;
  foods?: {
    foodId: string;
    amount: number;
    mealType?: LoggedFood["mealType"];
    eatenAt?: string;
  }[];
};

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

  if (!body.foods || !Array.isArray(body.foods)) {
    return NextResponse.json(
      {
        error: "Invalid request. Expected foods array.",
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