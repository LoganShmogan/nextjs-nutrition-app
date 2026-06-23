import { describe, expect, it } from "vitest";
import { findFoodById, getAllFoods, searchFoods } from "@/lib/nutrition/foods";

describe("foods data loader", () => {
  it("loads local food data from DATA.AP and NAME.FT", async () => {
    const foods = await getAllFoods();

    expect(foods.length).toBeGreaterThan(0);
    expect(foods[0].id).toBeTruthy();
    expect(foods[0].name).toBeTruthy();
    expect(foods[0].nutrients).toBeDefined();
  });

  it("can find a known food item by id", async () => {
    const food = await findFoodById("A1007");

    expect(food).not.toBeNull();
    expect(food?.name).toContain("Bread");
    expect(food?.nutrients.energyKcal).toBeGreaterThan(0);
  });

  it("can search foods by name", async () => {
    const results = await searchFoods("bread", 10);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain("bread");
  });

  it("returns null for a non-existent food id", async () => {
    const food = await findFoodById("DOES_NOT_EXIST_999");
    expect(food).toBeNull();
  });

  it("returns limited results when empty query is given", async () => {
    const results = await searchFoods("", 5);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.length).toBeGreaterThan(0);
  });

  it("respects the limit parameter", async () => {
    const results = await searchFoods("", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("returns foods with complete nutrient structures", async () => {
    const foods = await getAllFoods();
    const firstFood = foods[0];

    expect(firstFood.nutrients).toBeDefined();
    expect("energyKcal" in firstFood.nutrients).toBe(true);
    expect("protein" in firstFood.nutrients).toBe(true);
  });

  it("search is case-insensitive", async () => {
    const upper = await searchFoods("BREAD", 10);
    const lower = await searchFoods("bread", 10);

    expect(upper.length).toBe(lower.length);
  });

  it("all foods have an id and name", async () => {
    const foods = await getAllFoods();

    for (const food of foods.slice(0, 20)) {
      expect(food.id).toBeTruthy();
      expect(food.name).toBeTruthy();
    }
  });
});