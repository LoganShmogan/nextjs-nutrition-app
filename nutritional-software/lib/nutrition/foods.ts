import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Food, FoodSearchResult } from "@/types/food";

type ParsedFoodJson = {
  id: string;
  name: string;
  shortName?: string;
  chapter?: string;
  nutrients: Food["nutrients"];
};

let cachedFoods: Food[] | null = null;

const FOODS_JSON_PATH = path.join(process.cwd(), "public", "foods.json");

async function loadFoodsFromJson(): Promise<Food[]> {
  const fileContent = await readFile(FOODS_JSON_PATH, "utf-8");
  const parsedFoods = JSON.parse(fileContent) as ParsedFoodJson[];

  return parsedFoods.map((food) => ({
    id: food.id,
    name: food.name,
    shortName: food.shortName ?? food.name,
    description: food.name,
    category: food.chapter ?? "Food",
    nutrients: {
      energyKcal: food.nutrients.energyKcal ?? null,
      energyKj: food.nutrients.energyKj ?? null,
      protein: food.nutrients.protein ?? null,
      carbohydrate: food.nutrients.carbohydrate ?? null,
      fat: food.nutrients.fat ?? null,
      sugar: food.nutrients.sugar ?? null,
      sodium: food.nutrients.sodium ?? null,
      fibre: food.nutrients.fibre ?? null,
      calcium: food.nutrients.calcium ?? null,
      iron: food.nutrients.iron ?? null,
      vitaminC: food.nutrients.vitaminC ?? null,
    },
  }));
}

export async function getAllFoods(): Promise<Food[]> {
  if (!cachedFoods) {
    cachedFoods = await loadFoodsFromJson();
  }

  return cachedFoods;
}

export async function findFoodById(foodId: string): Promise<Food | null> {
  const foods = await getAllFoods();

  return foods.find((food) => food.id === foodId) ?? null;
}

export async function searchFoods(
  query: string,
  limit = 20,
): Promise<FoodSearchResult[]> {
  const foods = await getAllFoods();
  const cleanedQuery = query.trim().toLowerCase();

  if (!cleanedQuery) {
    return foods.slice(0, limit);
  }

  return foods
    .filter((food) => {
      const searchableText = [
        food.id,
        food.name,
        food.shortName,
        food.description,
        food.category,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(cleanedQuery);
    })
    .slice(0, limit);
}