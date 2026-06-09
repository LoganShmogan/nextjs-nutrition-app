// Author: Logan
// Area: Backend / API / Testing

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const SEED_FOOD_ID = "SEED";

type SeedEntry = {
  food_name: string;
  meal: string;
  amount: number;
  energy_kcal: number;
  energy_kj: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  sugar: number;
  sodium: number;
  fibre: number;
  calcium: number;
  iron: number;
  vitamin_c: number;
};

const MEAL_TEMPLATES: SeedEntry[] = [
  // Breakfasts
  { food_name: "Oats with milk", meal: "Breakfast", amount: 300, energy_kcal: 320, energy_kj: 1339, protein: 12, carbohydrate: 52, fat: 7, sugar: 10, sodium: 120, fibre: 5, calcium: 180, iron: 3, vitamin_c: 0 },
  { food_name: "Scrambled eggs on toast", meal: "Breakfast", amount: 250, energy_kcal: 390, energy_kj: 1632, protein: 22, carbohydrate: 28, fat: 18, sugar: 2, sodium: 480, fibre: 2, calcium: 100, iron: 3, vitamin_c: 0 },
  { food_name: "Banana and yoghurt", meal: "Breakfast", amount: 280, energy_kcal: 220, energy_kj: 920, protein: 9, carbohydrate: 38, fat: 3, sugar: 28, sodium: 60, fibre: 3, calcium: 200, iron: 1, vitamin_c: 12 },
  { food_name: "Wholegrain toast with peanut butter", meal: "Breakfast", amount: 100, energy_kcal: 290, energy_kj: 1213, protein: 11, carbohydrate: 30, fat: 14, sugar: 5, sodium: 200, fibre: 4, calcium: 50, iron: 2, vitamin_c: 0 },
  { food_name: "Muesli with almond milk", meal: "Breakfast", amount: 280, energy_kcal: 350, energy_kj: 1464, protein: 9, carbohydrate: 55, fat: 10, sugar: 18, sodium: 90, fibre: 6, calcium: 150, iron: 3, vitamin_c: 0 },

  // Lunches
  { food_name: "Chicken and salad sandwich", meal: "Lunch", amount: 300, energy_kcal: 420, energy_kj: 1757, protein: 30, carbohydrate: 40, fat: 12, sugar: 5, sodium: 680, fibre: 4, calcium: 80, iron: 3, vitamin_c: 15 },
  { food_name: "Vegetable soup with bread", meal: "Lunch", amount: 400, energy_kcal: 280, energy_kj: 1172, protein: 8, carbohydrate: 48, fat: 5, sugar: 8, sodium: 800, fibre: 6, calcium: 70, iron: 2, vitamin_c: 20 },
  { food_name: "Tuna salad", meal: "Lunch", amount: 250, energy_kcal: 260, energy_kj: 1088, protein: 28, carbohydrate: 8, fat: 12, sugar: 3, sodium: 520, fibre: 3, calcium: 60, iron: 2, vitamin_c: 18 },
  { food_name: "Pasta with tomato sauce", meal: "Lunch", amount: 350, energy_kcal: 450, energy_kj: 1884, protein: 14, carbohydrate: 80, fat: 7, sugar: 10, sodium: 400, fibre: 5, calcium: 60, iron: 2, vitamin_c: 12 },
  { food_name: "Rice and beans", meal: "Lunch", amount: 300, energy_kcal: 380, energy_kj: 1590, protein: 14, carbohydrate: 70, fat: 4, sugar: 2, sodium: 300, fibre: 8, calcium: 80, iron: 4, vitamin_c: 0 },

  // Dinners
  { food_name: "Grilled salmon with vegetables", meal: "Dinner", amount: 400, energy_kcal: 520, energy_kj: 2176, protein: 42, carbohydrate: 22, fat: 28, sugar: 6, sodium: 420, fibre: 5, calcium: 60, iron: 2, vitamin_c: 30 },
  { food_name: "Chicken stir fry with rice", meal: "Dinner", amount: 450, energy_kcal: 580, energy_kj: 2428, protein: 38, carbohydrate: 65, fat: 14, sugar: 8, sodium: 700, fibre: 4, calcium: 80, iron: 3, vitamin_c: 25 },
  { food_name: "Beef and vegetable casserole", meal: "Dinner", amount: 400, energy_kcal: 490, energy_kj: 2051, protein: 34, carbohydrate: 30, fat: 22, sugar: 6, sodium: 650, fibre: 5, calcium: 70, iron: 5, vitamin_c: 20 },
  { food_name: "Vegetarian pasta bake", meal: "Dinner", amount: 400, energy_kcal: 460, energy_kj: 1925, protein: 18, carbohydrate: 70, fat: 12, sugar: 10, sodium: 500, fibre: 6, calcium: 200, iron: 3, vitamin_c: 15 },
  { food_name: "Lamb chops with kumara", meal: "Dinner", amount: 380, energy_kcal: 550, energy_kj: 2302, protein: 36, carbohydrate: 40, fat: 26, sugar: 12, sodium: 380, fibre: 4, calcium: 60, iron: 4, vitamin_c: 18 },

  // Snacks
  { food_name: "Apple", meal: "Snack", amount: 150, energy_kcal: 78, energy_kj: 326, protein: 0, carbohydrate: 20, fat: 0, sugar: 15, sodium: 0, fibre: 3, calcium: 10, iron: 0, vitamin_c: 8 },
  { food_name: "Greek yoghurt", meal: "Snack", amount: 170, energy_kcal: 140, energy_kj: 586, protein: 15, carbohydrate: 8, fat: 5, sugar: 7, sodium: 60, fibre: 0, calcium: 180, iron: 0, vitamin_c: 0 },
  { food_name: "Handful of almonds", meal: "Snack", amount: 30, energy_kcal: 174, energy_kj: 728, protein: 6, carbohydrate: 5, fat: 15, sugar: 1, sodium: 0, fibre: 2, calcium: 75, iron: 1, vitamin_c: 0 },
  { food_name: "Banana", meal: "Snack", amount: 120, energy_kcal: 107, energy_kj: 448, protein: 1, carbohydrate: 27, fat: 0, sugar: 14, sodium: 0, fibre: 3, calcium: 6, iron: 0, vitamin_c: 10 },
  { food_name: "Rice crackers with hummus", meal: "Snack", amount: 80, energy_kcal: 180, energy_kj: 753, protein: 5, carbohydrate: 28, fat: 6, sugar: 2, sodium: 250, fibre: 3, calcium: 40, iron: 1, vitamin_c: 0 },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Seed 14 days of data ending yesterday
export async function POST() {
  const db = getDb();

  // Clear existing seed data first
  db.prepare("DELETE FROM food_logs WHERE food_id = ?").run(SEED_FOOD_ID);

  const today = new Date();
  const insert = db.prepare(
    `INSERT INTO food_logs
      (food_id, food_name, amount, unit, meal, date, time,
       energy_kcal, energy_kj, protein, carbohydrate, fat, sugar,
       sodium, fibre, calcium, iron, vitamin_c)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const breakfasts = MEAL_TEMPLATES.filter((t) => t.meal === "Breakfast");
  const lunches = MEAL_TEMPLATES.filter((t) => t.meal === "Lunch");
  const dinners = MEAL_TEMPLATES.filter((t) => t.meal === "Dinner");
  const snacks = MEAL_TEMPLATES.filter((t) => t.meal === "Snack");

  const insertMany = db.transaction(() => {
    for (let daysBack = 13; daysBack >= 0; daysBack--) {
      const date = new Date(today);
      date.setDate(today.getDate() - daysBack);
      const dateStr = date.toISOString().split("T")[0];

      // Some days skip a meal to vary data
      const skipLunch = daysBack % 5 === 0;
      const skipSnack = daysBack % 3 === 0;

      const meals: Array<{ entry: SeedEntry; time: string }> = [
        { entry: pickRandom(breakfasts), time: "07:30" },
        ...(skipLunch ? [] : [{ entry: pickRandom(lunches), time: "12:30" }]),
        { entry: pickRandom(dinners), time: "18:30" },
        ...(skipSnack ? [] : [{ entry: pickRandom(snacks), time: "15:00" }]),
      ];

      // Occasionally add a second snack
      if (daysBack % 4 === 1) {
        meals.push({ entry: pickRandom(shuffled(snacks)), time: "21:00" });
      }

      for (const { entry, time } of meals) {
        insert.run(
          SEED_FOOD_ID,
          entry.food_name,
          entry.amount,
          "grams (g)",
          entry.meal,
          dateStr,
          time,
          entry.energy_kcal,
          entry.energy_kj,
          entry.protein,
          entry.carbohydrate,
          entry.fat,
          entry.sugar,
          entry.sodium,
          entry.fibre,
          entry.calcium,
          entry.iron,
          entry.vitamin_c
        );
      }
    }
  });

  insertMany();

  const count = (db.prepare("SELECT COUNT(*) as n FROM food_logs WHERE food_id = ?").get(SEED_FOOD_ID) as { n: number }).n;
  return NextResponse.json({ ok: true, inserted: count });
}

// Remove all seed data
export async function DELETE() {
  const db = getDb();
  const result = db.prepare("DELETE FROM food_logs WHERE food_id = ?").run(SEED_FOOD_ID);
  return NextResponse.json({ ok: true, deleted: result.changes });
}
