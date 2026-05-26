#!/usr/bin/env node
// Author: Logan & Marty
// Area: Backend / Data Processing
//
// USAGE:
//   node scripts/parse-foodfiles.mjs
//
// Place NZ FOODfiles data files at:
//   data/raw/DATA.AP
//   data/raw/NAME.FT
//
// Output: public/foods.json

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Candidate column names to try for each nutrient (first match wins)
const NUTRIENT_CANDIDATES = {
  energyKcal: [
    "Energy, total metabolisable (kcal, including dietary fibre)",
    "Energy, total metabolisable (kcal, excluding dietary fibre)",
    "Energy (kcal)",
  ],
  energyKj: [
    "Energy, total metabolisable (kJ, including dietary fibre)",
    "Energy, total metabolisable (kJ, excluding dietary fibre)",
    "Energy (kJ)",
  ],
  protein: [
    "Protein, total; calculated from total nitrogen",
    "Protein",
    "Protein, total",
  ],
  carbohydrate: [
    "Available carbohydrate, FSANZ",
    "Available carbohydrate by difference",
    "Available carbohydrates by weight",
    "Carbohydrate",
  ],
  fat: [
    "Fat, total",
    "Total fat",
    "Fat",
    "Lipid, total",
  ],
  sugar: [
    "Total sugars",
    "Sugars, total",
    "Sugars",
  ],
  sodium: [
    "Sodium",
  ],
  fibre: [
    "Fibre, total dietary",
    "Dietary fibre",
    "Fibre, dietary",
    "Total dietary fibre",
  ],
};

function tryReadFile(paths) {
  for (const p of paths) {
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  return null;
}

function parseTilde(content) {
  return content
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map((l) => l.split("~"));
}

function toNum(val) {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val.trim());
  return isNaN(n) ? null : n;
}

// Read files
const dataApRaw = tryReadFile([
  join(ROOT, "data/raw/DATA.AP"),
  join(ROOT, "data/raw/DATA.AP.txt"),
]);

if (!dataApRaw) {
  console.error("ERROR: data/raw/DATA.AP not found.");
  process.exit(1);
}

const nameFtRaw = tryReadFile([
  join(ROOT, "data/raw/NAME.FT"),
  join(ROOT, "data/raw/NAME.FT.txt"),
]);

if (!nameFtRaw) {
  console.error("ERROR: data/raw/NAME.FT not found.");
  process.exit(1);
}

console.log("Found DATA.AP and NAME.FT - parsing...");

// Parse NAME.FT
const nameRows = parseTilde(nameFtRaw);
const nameMap = new Map();
for (const row of nameRows) {
  if (!row[0] || row[0].startsWith("\u00a9") || row[0].startsWith("©")) continue;
  const [foodId, foodName, shortName] = row;
  if (foodId && foodName) {
    nameMap.set(foodId.trim(), {
      name: foodName.trim(),
      shortName: (shortName || foodName).trim(),
    });
  }
}
console.log(`  ${nameMap.size} food names loaded`);

// Parse DATA.AP - find header row
const dataLines = parseTilde(dataApRaw);

let headerIdx = -1;
for (let i = 0; i < Math.min(dataLines.length, 5); i++) {
  // Header row has "Food Name" as one of the first few columns
  if (dataLines[i].includes("Food Name")) {
    headerIdx = i;
    break;
  }
}
if (headerIdx === -1) {
  console.error("ERROR: Could not find header row in DATA.AP.");
  process.exit(1);
}

const headers = dataLines[headerIdx].map((h) => h.trim());
console.log(`  Header at line ${headerIdx}, ${headers.length} cols`);

// Build col index
const colIndex = {};
for (let i = 0; i < headers.length; i++) {
  colIndex[headers[i]] = i;
}

// Print all available column names so we can verify
console.log("\nAvailable nutrient columns in this file:");
headers.forEach((h, i) => { if (i > 2) console.log(`  [${i}] ${h}`); });
console.log("");

// Resolve nutrient column indices using candidate lists
const nutrientIdx = {};
for (const [key, candidates] of Object.entries(NUTRIENT_CANDIDATES)) {
  const match = candidates.find((c) => colIndex[c] !== undefined);
  if (match) {
    nutrientIdx[key] = colIndex[match];
    console.log(`  ${key}: "${match}" (col ${colIndex[match]})`);
  } else {
    nutrientIdx[key] = null;
    console.log(`  ${key}: NOT FOUND`);
  }
}

// If kJ still missing, derive from kcal
if (nutrientIdx.energyKj === null && nutrientIdx.energyKcal !== null) {
  console.log("  energyKj: deriving from kcal x 4.184");
}

console.log("");

const idCol = colIndex["FoodID"] ?? 0;
const chapterCol = colIndex["Chapter"] ?? 1;
const nameCol = colIndex["Food Name"] ?? 2;

// Build food records
const foods = [];
for (let i = headerIdx + 2; i < dataLines.length; i++) {
  const row = dataLines[i];
  const foodId = row[idCol]?.trim();
  if (!foodId || foodId.startsWith("©") || foodId.startsWith("\u00a9")) continue;

  const nameData = nameMap.get(foodId);
  const rawName = row[nameCol]?.trim() ?? "";
  const name = nameData?.name || rawName;
  const shortName = nameData?.shortName || rawName;
  if (!name) continue;

  const chapter = row[chapterCol]?.trim() ?? "";

  const kcal = nutrientIdx.energyKcal !== null ? toNum(row[nutrientIdx.energyKcal]) : null;
  const kjRaw = nutrientIdx.energyKj !== null ? toNum(row[nutrientIdx.energyKj]) : null;
  const kj = kjRaw ?? (kcal !== null ? Math.round(kcal * 4.184 * 10) / 10 : null);

  foods.push({
    id: foodId,
    name,
    shortName,
    chapter,
    nutrients: {
      energyKcal: kcal,
      energyKj: kj,
      protein: nutrientIdx.protein !== null ? toNum(row[nutrientIdx.protein]) : null,
      carbohydrate: nutrientIdx.carbohydrate !== null ? toNum(row[nutrientIdx.carbohydrate]) : null,
      fat: nutrientIdx.fat !== null ? toNum(row[nutrientIdx.fat]) : null,
      sugar: nutrientIdx.sugar !== null ? toNum(row[nutrientIdx.sugar]) : null,
      sodium: nutrientIdx.sodium !== null ? toNum(row[nutrientIdx.sodium]) : null,
      fibre: nutrientIdx.fibre !== null ? toNum(row[nutrientIdx.fibre]) : null,
    },
  });
}

console.log(`${foods.length} food records parsed`);

const outPath = join(ROOT, "public/foods.json");
writeFileSync(outPath, JSON.stringify(foods, null, 0), "utf8");

const sizeMb = (Buffer.byteLength(JSON.stringify(foods)) / 1024 / 1024).toFixed(2);
console.log(`Written to public/foods.json (${foods.length} foods, ${sizeMb} MB)`);
