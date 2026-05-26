// Author: Logan & Marty
// Area: Backend / API / Logic / Frontend

export type FoodNutrients = {
  energyKcal: number | null;
  energyKj: number | null;
  protein: number | null;
  carbohydrate: number | null;
  fat: number | null;
  sugar: number | null;
  sodium: number | null;
  fibre: number | null;
};

export type Food = {
  id: string;
  name: string;
  shortName: string;
  chapter: string;
  nutrients: FoodNutrients;
};

export type FoodSearchResult = {
  foods: Food[];
  total: number;
  query: string;
};

export type FoodSearchError = {
  error: string;
};
