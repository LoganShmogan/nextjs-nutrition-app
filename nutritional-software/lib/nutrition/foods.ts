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

const DATA_FILE_PATH = path.join(process.cwd(), "data", "raw", "DATA.AP");
const NAME_FILE_PATH = path.join(process.cwd(), "data", "raw", "NAME.FT");

const NUTRIENT_COLUMN_NAMES = {
  energyKcal: "Energy, total metabolisable (kcal)",
  energyKj: "Energy, total metabolisable (kJ)",
  protein: "Protein, total; calculated from total nitrogen",
  carbohydrate: "Available carbohydrate by difference",
  fat: "Fat, total",
  sugar: "Sugars, total",
  sodium: "Sodium",
  fibre: "Fibre, total dietary",
  calcium: "Calcium",
  iron: "Iron",
  vitaminC: "Vitamin C",
} satisfies Record<keyof FoodNutrients, string>;

