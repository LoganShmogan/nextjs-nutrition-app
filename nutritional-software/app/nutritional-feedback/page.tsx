// app/nutritional-feedback/page.tsx

"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
};

type Thresholds = {
  calories: { low: number; high: number };
  protein:  { low: number };
  carbs:    { low: number; high: number };
  fat:      { high: number };
  sugar:    { high: number };
  sodium:   { high: number };
};

type FeedbackItem = {
  title: string;
  value: string;
  status: "low" | "good" | "high";
  message: string;
};

const DEFAULT_THRESHOLDS: Thresholds = {
  calories: { low: 1680, high: 2520 },
  protein:  { low: 56 },
  carbs:    { low: 208, high: 338 },
  fat:      { high: 84 },
  sugar:    { high: 60 },
  sodium:   { high: 2300 },
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function buildFeedback(totals: Totals, thresholds: Thresholds): FeedbackItem[] {
  const { calories, protein, carbs, fat, sugar, sodium } = totals;
  const t = thresholds;

  return [
    {
      title: "Calories",
      value: `${Math.round(calories)} kcal`,
      status:
        calories < t.calories.low ? "low"
        : calories > t.calories.high ? "high"
        : "good",
      message:
        calories < t.calories.low ? "Calorie intake is below recommended range."
        : calories > t.calories.high ? "Calorie intake is above recommended range."
        : "Calorie intake is within recommended range.",
    },
    {
      title: "Protein",
      value: `${protein.toFixed(1)} g`,
      status: protein < t.protein.low ? "low" : "good",
      message: protein < t.protein.low ? "Protein intake is low." : "Protein intake looks good.",
    },
    {
      title: "Carbohydrates",
      value: `${carbs.toFixed(1)} g`,
      status:
        carbs < t.carbs.low ? "low"
        : carbs > t.carbs.high ? "high"
        : "good",
      message:
        carbs < t.carbs.low ? "Carbohydrate intake is below recommended range."
        : carbs > t.carbs.high ? "Carbohydrate intake is above recommended range."
        : "Carbohydrate intake is within recommended range.",
    },
    {
      title: "Fat",
      value: `${fat.toFixed(1)} g`,
      status: fat > t.fat.high ? "high" : "good",
      message: fat > t.fat.high ? "Fat intake is slightly high." : "Fat intake looks good.",
    },
    {
      title: "Sugar",
      value: `${sugar.toFixed(1)} g`,
      status: sugar > t.sugar.high ? "high" : "good",
      message:
        sugar > t.sugar.high
          ? "Sugar intake exceeds recommended intake."
          : "Sugar intake is within recommended range.",
    },
    {
      title: "Sodium",
      value: `${Math.round(sodium)} mg`,
      status: sodium > t.sodium.high ? "high" : "good",
      message:
        sodium > t.sodium.high
          ? "Sodium intake is too high."
          : "Sodium intake is within recommended range.",
    },
  ];
}

export default function NutritionalFeedbackPage() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayStr();

    Promise.all([
      fetch(`/api/food-log?date=${today}`).then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ])
      .then(([logData, profileData]) => {
        const logs: Record<string, number>[] = logData.logs ?? [];

        const sum = (key: string) =>
          Math.round((logs.reduce((acc, e) => acc + (Number(e[key]) || 0), 0)) * 10) / 10;

        setTotals({
          calories: sum("energy_kcal"),
          protein:  sum("protein"),
          carbs:    sum("carbohydrate"),
          fat:      sum("fat"),
          sugar:    sum("sugar"),
          sodium:   sum("sodium"),
        });

        if (profileData.targets) {
          const tgt = profileData.targets;
          setThresholds({
            calories: {
              low:  tgt.energy_kcal.target * (tgt.energy_kcal.lowBelowPercentage / 100),
              high: tgt.energy_kcal.target * (tgt.energy_kcal.highAbovePercentage / 100),
            },
            protein: {
              low: tgt.protein.target * (tgt.protein.lowBelowPercentage / 100),
            },
            carbs: {
              low:  tgt.carbohydrate.target * (tgt.carbohydrate.lowBelowPercentage / 100),
              high: tgt.carbohydrate.target * (tgt.carbohydrate.highAbovePercentage / 100),
            },
            fat:    { high: tgt.fat.target    * (tgt.fat.highAbovePercentage    / 100) },
            sugar:  { high: tgt.sugar.target  * (tgt.sugar.highAbovePercentage  / 100) },
            sodium: { high: tgt.sodium.target * (tgt.sodium.highAbovePercentage / 100) },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const feedback = totals ? buildFeedback(totals, thresholds) : [];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Daily Nutritional Feedback</h1>
          <p>Today&apos;s intake — {todayStr()}</p>
        </div>

        {loading && <p>Loading today&apos;s data…</p>}

        {!loading && !totals && (
          <p>No food logged today. Head to the Food Log to add entries.</p>
        )}

        {!loading && totals && (
          <>
            <section className={styles.summaryCard}>
              <h2>Today&apos;s Intake Summary</h2>

              <div className={styles.summaryGrid}>
                <div>
                  <span>Total Calories</span>
                  <strong>{Math.round(totals.calories)} kcal</strong>
                </div>
                <div>
                  <span>Protein</span>
                  <strong>{totals.protein.toFixed(1)} g</strong>
                </div>
                <div>
                  <span>Carbohydrates</span>
                  <strong>{totals.carbs.toFixed(1)} g</strong>
                </div>
                <div>
                  <span>Fat</span>
                  <strong>{totals.fat.toFixed(1)} g</strong>
                </div>
              </div>
            </section>

            <section className={styles.feedbackSection}>
              {feedback.map((item) => (
                <div
                  key={item.title}
                  className={`${styles.feedbackCard} ${
                    item.status === "good"
                      ? styles.good
                      : item.status === "low"
                        ? styles.low
                        : styles.high
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.value}</p>
                    </div>

                    <div className={styles.statusBadge}>
                      {item.status === "good" && "Good"}
                      {item.status === "low" && "Low"}
                      {item.status === "high" && "High"}
                    </div>
                  </div>

                  <div className={styles.message}>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
