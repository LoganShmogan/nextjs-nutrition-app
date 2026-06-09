// Author: Logan & Marty

"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import type { Food } from "@/types/food";

type LoggedFood = {
  id?: number;
  food_id: string | null;
  food_name: string;
  amount: number;
  unit: string;
  date: string;
  time: string;
  meal: string;
  energy_kcal: number | null;
  protein: number | null;
  carbohydrate: number | null;
  fat: number | null;
};

type CustomFoodRow = {
  id: number;
  name: string;
  energy_kcal: number | null;
  energy_kj: number | null;
  protein: number | null;
  carbohydrate: number | null;
  fat: number | null;
  sugar: number | null;
  sodium: number | null;
  fibre: number | null;
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "results"; foods: Food[] }
  | { status: "not-found"; query: string }
  | { status: "db-missing" }
  | { status: "error"; message: string };

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const UNITS = ["grams (g)", "millilitres (mL)", "servings"];

function today() {
  return new Date().toISOString().split("T")[0];
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function scale(val: number | null, amount: number): string {
  if (val === null) return "—";
  return ((val * amount) / 100).toFixed(1);
}

function scaleNutrient(val: number | null, amount: number): number | null {
  if (val === null) return null;
  return (val * amount) / 100;
}

export default function FoodLogPage() {
  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [amount, setAmount] = useState("100");
  const [unit, setUnit] = useState(UNITS[0]);
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowTime());
  const [meal, setMeal] = useState(MEAL_TAGS[0]);
  const [log, setLog] = useState<LoggedFood[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFoodRow[]>([]);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customFibre, setCustomFibre] = useState("");
  const [customSodium, setCustomSodium] = useState("");
  const [customSugar, setCustomSugar] = useState("");
  const [customSaving, setCustomSaving] = useState(false);


  useEffect(() => {
    fetch(`/api/food-log?date=${today()}`)
      .then((r) => r.json())
      .then((data) => setLog(data.logs ?? []));

    fetch("/api/custom-foods")
      .then((r) => r.json())
      .then((data) => setCustomFoods(data.foods ?? []));
  }, []);


  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 2) {
      setSearchState({ status: "idle" });
      return;
    }

    setSearchState({ status: "loading" });

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/foods/search?q=${encodeURIComponent(search.trim())}&limit=30`
        );

        if (res.status === 503) {
          setSearchState({ status: "db-missing" });
          return;
        }

        if (!res.ok) {
          setSearchState({ status: "error", message: "Search failed. Please try again." });
          return;
        }

        const data = await res.json();

        // Merge custom foods matching the search
        const q = search.trim().toLowerCase();
        const matchedCustom: Food[] = customFoods
          .filter((cf) => cf.name.toLowerCase().includes(q))
          .map((cf) => ({
            id: `custom-${cf.id}`,
            name: cf.name,
            shortName: cf.name,
            description: "Custom food",
            category: "Custom",
            nutrients: {
              energyKcal: cf.energy_kcal,
              energyKj: cf.energy_kj,
              protein: cf.protein,
              carbohydrate: cf.carbohydrate,
              fat: cf.fat,
              sugar: cf.sugar,
              sodium: cf.sodium,
              fibre: cf.fibre,
            },
          }));

        const combined = [...matchedCustom, ...data.foods];

        if (combined.length === 0) {
          setSearchState({ status: "not-found", query: search.trim() });
        } else {
          setSearchState({ status: "results", foods: combined });
        }
      } catch {
        setSearchState({ status: "error", message: "Could not connect to food database." });
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, customFoods]);

  function handleSelectFood(food: Food) {
    setSelectedFood(food);
    setAmount("100");
  }

  async function handleAddToLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFood) return;

    const parsedAmount = parseFloat(amount) || 100;

    const entry = {
      food_id: selectedFood.id.startsWith("custom-") ? null : selectedFood.id,
      food_name: selectedFood.shortName,
      amount: parsedAmount,
      unit,
      meal,
      date,
      time,
      energy_kcal: scaleNutrient(selectedFood.nutrients.energyKcal, parsedAmount),
      energy_kj: scaleNutrient(selectedFood.nutrients.energyKj, parsedAmount),
      protein: scaleNutrient(selectedFood.nutrients.protein, parsedAmount),
      carbohydrate: scaleNutrient(selectedFood.nutrients.carbohydrate, parsedAmount),
      fat: scaleNutrient(selectedFood.nutrients.fat, parsedAmount),
      sugar: scaleNutrient(selectedFood.nutrients.sugar, parsedAmount),
      sodium: scaleNutrient(selectedFood.nutrients.sodium, parsedAmount),
      fibre: scaleNutrient(selectedFood.nutrients.fibre, parsedAmount),
      calcium: scaleNutrient(selectedFood.nutrients.calcium ?? null, parsedAmount),
      iron: scaleNutrient(selectedFood.nutrients.iron ?? null, parsedAmount),
      vitamin_c: scaleNutrient(selectedFood.nutrients.vitaminC ?? null, parsedAmount),
    };

    setSaving(true);
    try {
      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      const data = await res.json();
      setLog((prev) => [...prev, { ...entry, id: data.id }]);
    } finally {
      setSaving(false);
    }

    setSelectedFood(null);
    setSearch("");
    setSearchState({ status: "idle" });
    setAmount("100");
  }

  async function handleRemoveLog(id: number | undefined) {
    if (!id) return;
    await fetch(`/api/food-log?id=${id}`, { method: "DELETE" });
    setLog((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleSaveCustomFood(e: React.FormEvent) {
    e.preventDefault();
    if (!customName.trim()) return;

    const payload = {
      name: customName.trim(),
      energy_kcal: customKcal ? parseFloat(customKcal) : null,
      energy_kj: customKcal ? parseFloat(customKcal) * 4.184 : null,
      protein: customProtein ? parseFloat(customProtein) : null,
      carbohydrate: customCarbs ? parseFloat(customCarbs) : null,
      fat: customFat ? parseFloat(customFat) : null,
      fibre: customFibre ? parseFloat(customFibre) : null,
      sodium: customSodium ? parseFloat(customSodium) : null,
      sugar: customSugar ? parseFloat(customSugar) : null,
    };

    setCustomSaving(true);
    try {
      const res = await fetch("/api/custom-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setCustomFoods((prev) => [...prev, { id: data.id, ...payload } as CustomFoodRow]);
      setCustomName("");
      setCustomKcal("");
      setCustomProtein("");
      setCustomCarbs("");
      setCustomFat("");
      setCustomFibre("");
      setCustomSodium("");
      setCustomSugar("");
    } finally {
      setCustomSaving(false);
    }
  }

  const scaledAmount = parseFloat(amount) || 100;
  const todayLogs = log.filter((e) => e.date === today());

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Food Intake Logging</h1>
          <p>Search the NZ Food Composition Database to track meals and nutrients.</p>
        </div>

        <div className={styles.grid}>
          {/* ── LEFT: Food Search ─────────────────────────────────────── */}
          <section className={styles.card}>
            <h2>Food Database</h2>

            <input
              type="text"
              placeholder="Search NZ foods… (e.g. chicken breast, apple)"
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />

            <div className={styles.foodList}>
              {searchState.status === "idle" && (
                <p className={styles.emptyState}>
                  Type at least 2 characters to search the NZ Food Composition Database.
                </p>
              )}

              {searchState.status === "loading" && (
                <p className={styles.emptyState}>Searching…</p>
              )}

              {searchState.status === "db-missing" && (
                <div className={styles.notFoundState}>
                  <strong>Food database not set up yet.</strong>
                  <p>
                    Run <code>node scripts/parse-foodfiles.mjs</code> after placing
                    your NZ FOODfiles data files in <code>data/raw/</code>.
                  </p>
                </div>
              )}

              {searchState.status === "error" && (
                <p className={styles.emptyState}>{searchState.message}</p>
              )}

              {searchState.status === "not-found" && (
                <div className={styles.notFoundState}>
                  <strong>No results for &ldquo;{searchState.query}&rdquo;</strong>
                  <p>
                    Try different keywords, or use the{" "}
                    <strong>Add Custom Food</strong> form below to enter
                    nutrients manually.
                  </p>
                </div>
              )}

              {searchState.status === "results" &&
                searchState.foods.map((food) => (
                  <button
                    key={food.id}
                    className={`${styles.foodItem} ${selectedFood?.id === food.id ? styles.foodItemSelected : ""}`}
                    onClick={() => handleSelectFood(food)}
                    type="button"
                  >
                    <h3>{food.shortName}</h3>
                    <p>
                      {food.nutrients.energyKcal !== null
                        ? `${food.nutrients.energyKcal} kcal`
                        : "—"}{" "}
                      · {food.nutrients.protein !== null
                        ? `${food.nutrients.protein}g protein`
                        : "—"}{" "}
                      · per 100g
                      {food.category === "Custom" ? " · Custom" : ""}
                    </p>
                  </button>
                ))}
            </div>
          </section>

          {/* ── RIGHT: Log Form ───────────────────────────────────────── */}
          <section className={styles.card}>
            <h2>Log Food Intake</h2>

            {selectedFood ? (
              <>
                <div className={styles.selectedFood}>
                  <h3>{selectedFood.shortName}</h3>
                  {!selectedFood.id.startsWith("custom-") && (
                    <p className={styles.selectedFoodId}>
                      NZ FOODfiles ID: {selectedFood.id}
                    </p>
                  )}

                  <div className={styles.nutrients}>
                    <div>
                      <span>Energy</span>
                      <strong>{scale(selectedFood.nutrients.energyKcal, scaledAmount)} kcal</strong>
                    </div>
                    <div>
                      <span>Energy</span>
                      <strong>{scale(selectedFood.nutrients.energyKj, scaledAmount)} kJ</strong>
                    </div>
                    <div>
                      <span>Protein</span>
                      <strong>{scale(selectedFood.nutrients.protein, scaledAmount)} g</strong>
                    </div>
                    <div>
                      <span>Carbohydrates</span>
                      <strong>{scale(selectedFood.nutrients.carbohydrate, scaledAmount)} g</strong>
                    </div>
                    <div>
                      <span>Fat</span>
                      <strong>{scale(selectedFood.nutrients.fat, scaledAmount)} g</strong>
                    </div>
                    <div>
                      <span>Sugar</span>
                      <strong>{scale(selectedFood.nutrients.sugar, scaledAmount)} g</strong>
                    </div>
                    <div>
                      <span>Sodium</span>
                      <strong>{scale(selectedFood.nutrients.sodium, scaledAmount)} mg</strong>
                    </div>
                    <div>
                      <span>Fibre</span>
                      <strong>{scale(selectedFood.nutrients.fibre, scaledAmount)} g</strong>
                    </div>
                  </div>
                  <p className={styles.perAmountNote}>
                    Values shown for {scaledAmount}g serving
                  </p>
                </div>

                <form className={styles.form} onSubmit={handleAddToLog}>
                  <div className={styles.formGroup}>
                    <label>Portion Size</label>
                    <div className={styles.portionRow}>
                      <input
                        type="number"
                        placeholder="Amount"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                        {UNITS.map((u) => (
                          <option key={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Meal Tag</label>
                    <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                      {MEAL_TAGS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className={styles.primaryButton} disabled={saving}>
                    {saving ? "Saving…" : "Add to Food Log"}
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>Select a food from the search results to begin logging.</p>
              </div>
            )}
          </section>
        </div>

        {/* ── Today's Log ──────────────────────────────────────────────── */}
        {todayLogs.length > 0 && (
          <section className={styles.card}>
            <h2>Today&apos;s Log</h2>
            <div className={styles.logList}>
              {todayLogs.map((entry) => (
                <div key={entry.id} className={styles.logItem}>
                  <div>
                    <strong>{entry.food_name}</strong>
                    <span>
                      {entry.amount}{entry.unit.split(" ")[0]} · {entry.meal} · {entry.time}
                    </span>
                  </div>
                  <div className={styles.logRight}>
                    <span className={styles.logKcal}>
                      {entry.energy_kcal !== null ? `${entry.energy_kcal?.toFixed(0)} kcal` : "—"}
                    </span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveLog(entry.id)}
                      aria-label="Remove entry"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Custom Food ───────────────────────────────────────────────── */}
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>Add Custom Food / Recipe</h2>
            <p>
              Manually enter nutrient information if a food cannot be found in
              the database. Custom foods will appear in search results.
            </p>
          </div>

          <form className={styles.customFoodForm} onSubmit={handleSaveCustomFood}>
            <div className={styles.formGroup}>
              <label>Food / Recipe Name</label>
              <input
                type="text"
                placeholder="e.g. Homemade Protein Shake"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Calories (kcal)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customKcal}
                  onChange={(e) => setCustomKcal(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Protein (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Carbs (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fat (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Fibre (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customFibre}
                  onChange={(e) => setCustomFibre(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sodium (mg)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customSodium}
                  onChange={(e) => setCustomSodium(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sugar (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customSugar}
                  onChange={(e) => setCustomSugar(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.secondaryButton}
              disabled={customSaving}
            >
              {customSaving ? "Saving…" : "Save Custom Food"}
            </button>
          </form>

          {customFoods.length > 0 && (
            <div className={styles.customFoodList}>
              <h3>Saved Custom Foods</h3>
              {customFoods.map((cf) => (
                <div key={cf.id} className={styles.logItem}>
                  <div>
                    <strong>{cf.name}</strong>
                    <span>
                      {cf.energy_kcal != null ? `${cf.energy_kcal} kcal` : "—"} per 100g
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={async () => {
                      await fetch(`/api/custom-foods?id=${cf.id}`, { method: "DELETE" });
                      setCustomFoods((prev) => prev.filter((f) => f.id !== cf.id));
                    }}
                    aria-label="Remove custom food"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
