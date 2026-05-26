// Author: Logan & Marty
// Area: Frontend / UI + Backend / API

"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import type { Food } from "@/types/food";

type LoggedFood = {
  food: Food;
  amount: number;
  unit: string;
  date: string;
  time: string;
  meal: string;
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

// Scale a nutrient value from per-100g to the given amount
function scale(val: number | null, amount: number): string {
  if (val === null) return "—";
  return ((val * amount) / 100).toFixed(1);
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
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

        if (data.foods.length === 0) {
          setSearchState({ status: "not-found", query: search.trim() });
        } else {
          setSearchState({ status: "results", foods: data.foods });
        }
      } catch {
        setSearchState({ status: "error", message: "Could not connect to food database." });
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  function handleSelectFood(food: Food) {
    setSelectedFood(food);
    setAmount("100");
  }

  function handleAddToLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFood) return;
    setLog((prev) => [
      ...prev,
      { food: selectedFood, amount: parseFloat(amount) || 100, unit, date, time, meal },
    ]);
    setSelectedFood(null);
    setSearch("");
    setSearchState({ status: "idle" });
    setAmount("100");
  }

  const scaledAmount = parseFloat(amount) || 100;

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

            {/* Search results */}
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
                  <p className={styles.selectedFoodId}>
                    NZ FOODfiles ID: {selectedFood.id}
                  </p>

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

                  <button type="submit" className={styles.primaryButton}>
                    Add to Food Log
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

        {/* ── Logged items summary ─────────────────────────────────────── */}
        {log.length > 0 && (
          <section className={styles.card}>
            <h2>Today&apos;s Log</h2>
            <div className={styles.logList}>
              {log.map((entry, i) => (
                <div key={i} className={styles.logItem}>
                  <div>
                    <strong>{entry.food.shortName}</strong>
                    <span>{entry.amount}{entry.unit.split(" ")[0]} · {entry.meal} · {entry.time}</span>
                  </div>
                  <span className={styles.logKcal}>
                    {scale(entry.food.nutrients.energyKcal, entry.amount)} kcal
                  </span>
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
              the database.
            </p>
          </div>

          <form className={styles.customFoodForm}>
            <div className={styles.formGroup}>
              <label>Food / Recipe Name</label>
              <input type="text" placeholder="e.g. Homemade Protein Shake" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Calories (kcal)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className={styles.formGroup}>
                <label>Protein (g)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className={styles.formGroup}>
                <label>Carbs (g)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className={styles.formGroup}>
                <label>Fat (g)</label>
                <input type="number" placeholder="0" />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Fibre (g)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className={styles.formGroup}>
                <label>Sodium (mg)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className={styles.formGroup}>
                <label>Sugar (g)</label>
                <input type="number" placeholder="0" />
              </div>
            </div>

            <button type="submit" className={styles.secondaryButton}>
              Save Custom Food
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
