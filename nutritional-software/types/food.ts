// Author: Logan & Marty
// Area: Backend / API / Logic / Frontend

export type NutrientValue = number | null;

export type FoodNutrients = {
  energyKcal: NutrientValue;
  energyKj: NutrientValue;
  protein: NutrientValue;
  carbohydrate: NutrientValue;
  fat: NutrientValue;
  sugar: NutrientValue;
  sodium: NutrientValue;
  fibre: NutrientValue;
  calcium: NutrientValue;
  iron: NutrientValue;
  vitaminC: NutrientValue;
};

export type Food = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  nutrients: FoodNutrients;
};

export type FoodSearchResult = Pick<
  Food,
  "id" | "name" | "shortName" | "description" | "category" | "nutrients"
>;