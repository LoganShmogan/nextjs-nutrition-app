"use client";

// Author: Marty Orchard
// Area: Frontend / UI / Nutrition Analysis

import { useState, useEffect } from "react";
import styles from "@/app/summary/page.module.css";
import type { ProfileData } from "@/types/profile";

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

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getStatusLabel(status: NutrientStatus): string {
  if (status === "low") return "Below target";
  if (status === "high") return "Above target";
  return "Within range";
}

function getStatusClass(status: NutrientStatus): string {
  if (status === "ok") return styles.successBadge;
  if (status === "high") return styles.dangerBadge;
  return styles.warningBadge;
}

export default function NutritionSummaryCard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => setProfile(data.profile ?? null))
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false));
  }, []);

  async function handleRunAnalysis() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/nutrition-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr(), profile: profile ?? undefined }),
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
        <h1>Nutrition Summary</h1>
        <p>
          Compare today&apos;s logged food intake against your profile-based daily targets,
          including energy, macronutrients, fibre, sodium, calcium, iron, and vitamin C.
        </p>
      </div>

      <section className={styles.overviewCard}>
        <div>
          <p className={styles.cardLabel}>Daily Intake Analysis</p>
          <h2>Intake vs RDI targets</h2>
          <p>
            {profile
              ? `Showing personalised targets for ${profile.patientName} based on their saved profile.`
              : "No profile saved — using default adult targets. Save a profile for personalised targets."}
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
          <h2>Today&apos;s Intake — {todayStr()}</h2>
          <p>
            {isLoadingProfile
              ? "Loading profile…"
              : profile
                ? `Profile: ${profile.patientName}, ${profile.age} years old, ${profile.gender}, ${profile.activityLevel}.`
                : "No profile saved. Go to Profile to set up personalised targets."}
          </p>
        </div>

        <button
          className={styles.primaryButton}
          type="button"
          onClick={handleRunAnalysis}
          disabled={isLoading || isLoadingProfile}
        >
          {isLoading ? "Analysing..." : "Run RDI Analysis"}
        </button>
      </section>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

      {!analysis ? (
        <section className={styles.feedbackCard}>
          <h2>No analysis loaded yet</h2>
          <p>
            Click <strong>Run RDI Analysis</strong> to analyse your logged food for today.
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
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
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
              Nutrient totals are calculated from your food log entries for today. Energy and protein
              targets are adjusted using your saved profile.
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
