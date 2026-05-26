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

function getValueByHeader(
  row: string[],
  columnMap: Record<string, number>,
  header: string,
): string | undefined {
  const columnIndex = columnMap[header];

  if (columnIndex === undefined) {
    return undefined;
  }

  return row[columnIndex];
}

async function loadFoodNames(): Promise<Map<string, RawFoodNameRecord>> {
  const content = await readFile(NAME_FILE_PATH, "utf-8");
  const rows = parseTildeFile(content);

  const headers = rows[1];
  const columnMap = buildColumnIndexMap(headers);

  const nameRecords = new Map<string, RawFoodNameRecord>();

  for (const row of rows.slice(2)) {
    const id = getValueByHeader(row, columnMap, "FoodID");

    if (!id) {
      continue;
    }

    nameRecords.set(id, {
      id,
      name: getValueByHeader(row, columnMap, "Food Name") ?? "",
      shortName: getValueByHeader(row, columnMap, "Short Food Name") ?? "",
      description: getValueByHeader(row, columnMap, "Food Description") ?? "",
      category: getValueByHeader(row, columnMap, "Food Item Generic Name") ?? "",
    });
  }

  return nameRecords;
}

