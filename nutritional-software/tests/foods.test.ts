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
});