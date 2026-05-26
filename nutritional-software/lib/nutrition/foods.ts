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

function parseTildeFile(content: string): string[][] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("~"));
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function buildColumnIndexMap(headers: string[]) {
  return headers.reduce<Record<string, number>>((map, header, index) => {
    map[header] = index;
    return map;
  }, {});
}

