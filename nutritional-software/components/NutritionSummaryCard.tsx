"use client";

// Author: Marty Orchard
// Area: Frontend / UI / Nutrition Analysis

import { useState } from "react";
import styles from "@/app/summary/page.module.css";

type NutrientStatus = "low" | "ok" | "high";

type NutrientComparison = {
  nutrient: string;
  label: string;
  unit: string;
  total: number;
  target: number;
  percentage: number;
  status: NutrientStatus;
  basis: string;
  message: string;
};

type NutritionAnalysisResponse = {
  analysis: {
    comparisons: NutrientComparison[];
    summary: {
      totalFoods: number;
      totalAmount: number;
      lowCount: number;
      okCount: number;
      highCount: number;
    };
  };
};

const demoRequestBody = {
  profile: {
    patientName: "Alex Taylor",
    age: 25,
    gender: "Female",
    weight: 70,
    height: 170,
    activityLevel: "Active",
    measurementSystem: "Metric",
  },
  foods: [
    {
      foodId: "A1007",
      amount: 100,
      mealType: "breakfast",
    },
    {
      foodId: "A1008",
      amount: 80,
      mealType: "lunch",
    },
  ],
};

function getStatusLabel(status: NutrientStatus): string {
  if (status === "low") {
    return "Below target";
  }

  if (status === "high") {
    return "Above target";
  }

  return "Within range";
}

function getStatusClass(status: NutrientStatus): string {
  if (status === "ok") {
    return styles.successBadge;
  }

  if (status === "high") {
    return styles.dangerBadge;
  }

  return styles.warningBadge;
}

export default function NutritionSummaryCard() {
  const [analysis, setAnalysis] = useState<NutritionAnalysisResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRunDemoAnalysis() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/nutrition-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(demoRequestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nutrition analysis failed.");
      }

      setAnalysis(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nutrition analysis failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const comparisons = analysis?.analysis.comparisons ?? [];
  const summary = analysis?.analysis.summary;

  return (
    <section className={styles.summaryPage}>
      <div className={styles.summaryHeader}>
        <p className={styles.eyebrow}>Sprint 3 · Full RDI Analysis</p>
        <h1>Nutrition Summary</h1>
        <p>
          Compare logged food intake against profile-based daily targets,
          including energy, macronutrients, fibre, sodium, calcium, iron, and
          vitamin C.
        </p>
      </div>

      <section className={styles.overviewCard}>
        <div>
          <p className={styles.cardLabel}>Daily Intake Analysis</p>
          <h2>Intake vs RDI targets</h2>
          <p>
            This demo uses Alex Taylor&apos;s profile and two logged food items
            from the local food database to calculate full nutrient comparisons.
          </p>
        </div>

        <div className={styles.overallStatus}>
          <span>Overall Status</span>
          <strong>
            {summary
              ? `${summary.lowCount} low · ${summary.okCount} ok · ${summary.highCount} high`
              : "Ready to analyse"}
          </strong>
        </div>
      </section>

      <section className={styles.demoPanel}>
        <div>
          <h2>Demo Input</h2>
          <p>
            Profile: 25-year-old female, 70 kg, 170 cm, active. Foods: 100 g
            white bread and 80 g wheatmeal bread.
          </p>
        </div>

        <button
          className={styles.primaryButton}
          type="button"
          onClick={handleRunDemoAnalysis}
          disabled={isLoading}
        >
          {isLoading ? "Analysing..." : "Run RDI Analysis"}
        </button>
      </section>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

      {!analysis ? (
        <section className={styles.feedbackCard}>
          <h2>No analysis loaded yet</h2>
          <p>
            Click <strong>Run RDI Analysis</strong> to call the new
            nutrition-summary API and display the calculated frontend results.
          </p>
        </section>
      ) : (
        <>
          <section className={styles.summaryGrid}>
            {comparisons.map((item) => (
              <article className={styles.nutrientCard} key={item.nutrient}>
                <div className={styles.nutrientTopRow}>
                  <span>{item.label}</span>

                  <small className={getStatusClass(item.status)}>
                    {getStatusLabel(item.status)}
                  </small>
                </div>

                <strong>
                  {item.total} {item.unit}
                </strong>

                <p>
                  Target: {item.target} {item.unit}
                </p>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                    }}
                  />
                </div>

                <p className={styles.percentageText}>
                  {item.percentage}% of target
                </p>
              </article>
            ))}
          </section>

          <section className={styles.feedbackCard}>
            <h2>Analysis Feedback</h2>
            <p>
              The system now calculates nutrient totals from logged foods and
              compares them against daily targets. Energy and protein targets
              are adjusted using the saved profile.
            </p>

            <div className={styles.feedbackList}>
              {comparisons.map((item) => (
                <div key={item.nutrient}>
                  <span>{item.label}</span>
                  <strong>{item.message}</strong>
                  <small>{item.basis}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}