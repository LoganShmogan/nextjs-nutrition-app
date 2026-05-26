import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Food, FoodNutrients, FoodSearchResult } from "@/types/food";

type RawFoodNameRecord = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
};

let cachedFoods: Food[] | null = null;

