// Author: Logan
// Area: Frontend / UI + Backend / API

"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import styles from "./page.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RDI = {
  energy_kcal: 2100,
  protein: 70,
  carbohydrate: 260,
  fat: 70,
  sugar: 50,
  sodium: 2000,
  fibre: 25,
  calcium: 1000,
  iron: 18,
  vitamin_c: 45,
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

type DailyTotal = {
  date: string;
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
  entry_count: number;
};

type MealTotal = {
  date: string;
  meal: string;
  energy_kcal: number;
  protein: number;
  carbohydrate: number;
  fat: number;
};

function getWeekStart(offset: number): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1 + offset * 7); // start on Monday
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(d.getDate() + n);
  return result;
}

function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

const CHART_COLORS = {
  green: "#16a34a",
  blue: "#2563eb",
  orange: "#ea580c",
  purple: "#7c3aed",
  pink: "#db2777",
  teal: "#0d9488",
  yellow: "#ca8a04",
};

export default function VisualisationPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [mealTotals, setMealTotals] = useState<MealTotal[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const weekStart = getWeekStart(weekOffset);
  const weekEnd = addDays(weekStart, 6);
  const weekDates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(weekStart, i)));

  const weekLabel = `${weekStart.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}`;

  function fetchWeek(start: Date, end: Date) {
    setLoading(true);
    fetch(`/api/visualisation?start=${formatDate(start)}&end=${formatDate(end)}`)
      .then((r) => r.json())
      .then((data) => {
        setDailyTotals(data.dailyTotals ?? []);
        setMealTotals(data.mealTotals ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchWeek(weekStart, weekEnd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("");
    const res = await fetch("/api/seed", { method: "POST" });
    const data = await res.json();
    setSeedMsg(`Loaded ${data.inserted} test entries across 14 days.`);
    setSeeding(false);
    fetchWeek(weekStart, weekEnd);
  }

  async function handleClearSeed() {
    setSeeding(true);
    setSeedMsg("");
    const res = await fetch("/api/seed", { method: "DELETE" });
    const data = await res.json();
    setSeedMsg(`Removed ${data.deleted} test entries.`);
    setSeeding(false);
    setSelectedDate(null);
    fetchWeek(weekStart, weekEnd);
  }

  function getDayData(date: string): DailyTotal {
    return (
      dailyTotals.find((d) => d.date === date) ?? {
        date,
        energy_kcal: 0,
        energy_kj: 0,
        protein: 0,
        carbohydrate: 0,
        fat: 0,
        sugar: 0,
        sodium: 0,
        fibre: 0,
        calcium: 0,
        iron: 0,
        vitamin_c: 0,
        entry_count: 0,
      }
    );
  }

  function getMealData(date: string, meal: string): MealTotal | undefined {
    return mealTotals.find(
      (m) => m.date === date && m.meal.toLowerCase() === meal.toLowerCase()
    );
  }

  const selectedData = selectedDate ? getDayData(selectedDate) : null;

  // ── Weekly Calories Bar Chart ────────────────────────────────────────
  const weeklyCaloriesData = {
    labels: weekDates.map((d) => {
      const date = new Date(d + "T00:00:00");
      return DAY_NAMES[date.getDay()];
    }),
    datasets: [
      {
        label: "Calories (kcal)",
        data: weekDates.map((d) => Math.round(getDayData(d).energy_kcal)),
        backgroundColor: weekDates.map((d) =>
          d === selectedDate ? "#16a34a" : "rgba(22, 163, 74, 0.4)"
        ),
        borderColor: weekDates.map((d) =>
          d === selectedDate ? "#15803d" : "#16a34a"
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // ── Weekly Macros Line Chart ─────────────────────────────────────────
  const weeklyMacrosData = {
    labels: weekDates.map((d) => {
      const date = new Date(d + "T00:00:00");
      return DAY_NAMES[date.getDay()];
    }),
    datasets: [
      {
        label: "Protein (g)",
        data: weekDates.map((d) => Math.round(getDayData(d).protein)),
        borderColor: CHART_COLORS.blue,
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Carbs (g)",
        data: weekDates.map((d) => Math.round(getDayData(d).carbohydrate)),
        borderColor: CHART_COLORS.orange,
        backgroundColor: "rgba(234, 88, 12, 0.1)",
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Fat (g)",
        data: weekDates.map((d) => Math.round(getDayData(d).fat)),
        borderColor: CHART_COLORS.purple,
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // ── Daily Macros Doughnut ────────────────────────────────────────────
  const dailyMacrosDoughnut = selectedData
    ? {
        labels: ["Protein", "Carbohydrates", "Fat"],
        datasets: [
          {
            data: [
              Math.round(selectedData.protein),
              Math.round(selectedData.carbohydrate),
              Math.round(selectedData.fat),
            ],
            backgroundColor: [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.purple],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      }
    : null;

  // ── Daily Nutrients vs RDI Bar Chart ────────────────────────────────
  const rdiKeys: (keyof typeof RDI)[] = [
    "energy_kcal", "protein", "carbohydrate", "fat",
    "sugar", "sodium", "fibre", "calcium", "iron", "vitamin_c",
  ];
  const rdiLabels: Record<keyof typeof RDI, string> = {
    energy_kcal: "Calories",
    protein: "Protein",
    carbohydrate: "Carbs",
    fat: "Fat",
    sugar: "Sugar",
    sodium: "Sodium",
    fibre: "Fibre",
    calcium: "Calcium",
    iron: "Iron",
    vitamin_c: "Vit C",
  };

  const dailyRdiData = selectedData
    ? {
        labels: rdiKeys.map((k) => rdiLabels[k]),
        datasets: [
          {
            label: "% of Daily Target",
            data: rdiKeys.map((k) => {
              const val = selectedData[k as keyof DailyTotal] as number;
              const target = RDI[k];
              return Math.min(Math.round((val / target) * 100), 200);
            }),
            backgroundColor: rdiKeys.map((k) => {
              const val = selectedData[k as keyof DailyTotal] as number;
              const pct = (val / RDI[k]) * 100;
              if (pct < 80) return "rgba(37, 99, 235, 0.7)";
              if (pct <= 120) return "rgba(22, 163, 74, 0.7)";
              return "rgba(220, 38, 38, 0.7)";
            }),
            borderRadius: 6,
          },
        ],
      }
    : null;

  // ── Daily Meals Bar Chart ────────────────────────────────────────────
  const dailyMealsData = selectedData
    ? {
        labels: MEALS,
        datasets: [
          {
            label: "Calories (kcal)",
            data: MEALS.map(
              (m) => Math.round(getMealData(selectedDate!, m)?.energy_kcal ?? 0)
            ),
            backgroundColor: [
              "rgba(234, 88, 12, 0.7)",
              "rgba(22, 163, 74, 0.7)",
              "rgba(37, 99, 235, 0.7)",
              "rgba(124, 58, 237, 0.7)",
            ],
            borderRadius: 8,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  const rdiLineOption = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // biome-ignore lint/suspicious/noExplicitAny: chart.js type
          label: (ctx: any) => `${ctx.raw}% of target`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 150,
        ticks: {
          callback: (v: number | string) => `${v}%`,
        },
      },
    },
    // Show 100% target line
    // biome-ignore lint/suspicious/noExplicitAny: chart.js plugin type
    plugins2: {} as any,
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Data Visualisation</h1>
          <p>Browse your nutrition history week by week.</p>
        </div>

        {/* ── Test Data Controls ─────────────────────────────────────── */}
        <div className={styles.seedBar}>
          <span className={styles.seedLabel}>Test data:</span>
          <button type="button" className={styles.seedBtn} onClick={handleSeed} disabled={seeding}>
            {seeding ? "Working…" : "Load 2 weeks of fake data"}
          </button>
          <button type="button" className={styles.seedBtnDanger} onClick={handleClearSeed} disabled={seeding}>
            Remove test data
          </button>
          {seedMsg && <span className={styles.seedMsg}>{seedMsg}</span>}
        </div>

        {/* ── Week Navigator ─────────────────────────────────────────── */}
        <div className={styles.weekNav}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => { setWeekOffset((o) => o - 1); setSelectedDate(null); }}
          >
            ← Prev
          </button>
          <span className={styles.weekLabel}>{weekLabel}</span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => { setWeekOffset((o) => o + 1); setSelectedDate(null); }}
            disabled={weekOffset >= 0}
          >
            Next →
          </button>
        </div>

        {/* ── Day Selector ───────────────────────────────────────────── */}
        <div className={styles.dayGrid}>
          {weekDates.map((date) => {
            const dayData = getDayData(date);
            const dateObj = new Date(date + "T00:00:00");
            const isToday = date === formatDate(new Date());
            const hasData = dayData.entry_count > 0;
            return (
              <button
                key={date}
                type="button"
                className={`${styles.dayBtn} ${selectedDate === date ? styles.dayBtnActive : ""} ${isToday ? styles.dayBtnToday : ""}`}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
              >
                <span className={styles.dayName}>{DAY_NAMES[dateObj.getDay()]}</span>
                <span className={styles.dayDate}>{dateObj.getDate()}</span>
                {hasData ? (
                  <span className={styles.dayKcal}>{Math.round(dayData.energy_kcal)} kcal</span>
                ) : (
                  <span className={styles.dayEmpty}>No data</span>
                )}
              </button>
            );
          })}
        </div>

        {loading && <p className={styles.loading}>Loading data…</p>}

        {/* ── Weekly Overview Charts ─────────────────────────────────── */}
        <div className={styles.sectionTitle}>Weekly Overview</div>
        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h2>Daily Calories</h2>
            <div className={styles.chartWrap}>
              <Bar
                data={weeklyCaloriesData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        // biome-ignore lint/suspicious/noExplicitAny: chart.js
                        label: (ctx: any) => `${ctx.raw} kcal`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (v: number | string) => `${v} kcal` },
                    },
                  },
                  onClick: (_evt, elements) => {
                    if (elements.length > 0) {
                      const idx = elements[0].index;
                      const date = weekDates[idx];
                      setSelectedDate((prev) => prev === date ? null : date);
                    }
                  },
                }}
              />
            </div>
            <p className={styles.chartHint}>Click a bar to see that day&apos;s detail</p>
          </div>

          <div className={styles.chartCard}>
            <h2>Macronutrients Over the Week</h2>
            <div className={styles.chartWrap}>
              <Line data={weeklyMacrosData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* ── Daily Detail ───────────────────────────────────────────── */}
        {selectedDate && selectedData && (
          <>
            <div className={styles.sectionTitle}>
              {FULL_DAY_NAMES[new Date(selectedDate + "T00:00:00").getDay()]},{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-NZ", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>

            {selectedData.entry_count === 0 ? (
              <div className={styles.noDataMsg}>
                No food entries logged for this day.
              </div>
            ) : (
              <>
                {/* Summary stats */}
                <div className={styles.statsRow}>
                  {[
                    { label: "Calories", value: `${Math.round(selectedData.energy_kcal)} kcal`, color: CHART_COLORS.green },
                    { label: "Protein", value: `${fmt(selectedData.protein)}g`, color: CHART_COLORS.blue },
                    { label: "Carbs", value: `${fmt(selectedData.carbohydrate)}g`, color: CHART_COLORS.orange },
                    { label: "Fat", value: `${fmt(selectedData.fat)}g`, color: CHART_COLORS.purple },
                    { label: "Fibre", value: `${fmt(selectedData.fibre)}g`, color: CHART_COLORS.teal },
                    { label: "Sodium", value: `${Math.round(selectedData.sodium)}mg`, color: CHART_COLORS.pink },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={styles.statCard} style={{ borderTopColor: color }}>
                      <span className={styles.statLabel}>{label}</span>
                      <span className={styles.statValue} style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.chartsRow}>
                  {/* Macros Doughnut */}
                  {dailyMacrosDoughnut && (
                    <div className={styles.chartCard}>
                      <h2>Macros Breakdown</h2>
                      <div className={styles.chartWrapSm}>
                        <Doughnut
                          data={dailyMacrosDoughnut}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "bottom" },
                              tooltip: {
                                callbacks: {
                                  // biome-ignore lint/suspicious/noExplicitAny: chart.js
                                  label: (ctx: any) => ` ${ctx.raw}g`,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meals Bar Chart */}
                  {dailyMealsData && (
                    <div className={styles.chartCard}>
                      <h2>Calories by Meal</h2>
                      <div className={styles.chartWrap}>
                        <Bar
                          data={dailyMealsData}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: { display: false },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { callback: (v: number | string) => `${v} kcal` },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Nutrient vs RDI */}
                {dailyRdiData && (
                  <div className={styles.chartCardWide}>
                    <h2>Nutrients vs Daily Target (%)</h2>
                    <div className={styles.chartWrap}>
                      <Bar
                        data={dailyRdiData}
                        options={{
                          ...chartOptions,
                          ...rdiLineOption,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                // biome-ignore lint/suspicious/noExplicitAny: chart.js
                                label: (ctx: any) => ` ${ctx.raw}% of daily target`,
                              },
                            },
                            // Draw 100% reference line via inline plugin below
                          },
                        }}
                        plugins={[
                          {
                            id: "target-line",
                            // biome-ignore lint/suspicious/noExplicitAny: chart.js plugin
                            afterDraw(chart: any) {
                              const { ctx: c, scales: { y } } = chart;
                              const y100 = y.getPixelForValue(100);
                              c.save();
                              c.beginPath();
                              c.moveTo(chart.chartArea.left, y100);
                              c.lineTo(chart.chartArea.right, y100);
                              c.strokeStyle = "#374151";
                              c.lineWidth = 1.5;
                              c.setLineDash([6, 4]);
                              c.stroke();
                              c.restore();
                            },
                          },
                        ]}
                      />
                    </div>
                    <p className={styles.chartHint}>
                      Blue = under target · Green = on target · Red = over target · Dashed line = 100%
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
