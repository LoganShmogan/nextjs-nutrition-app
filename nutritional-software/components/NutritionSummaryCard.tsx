// Author: Marty Orchard
// Area: Frontend / UI

import styles from "@/app/summary/page.module.css";

const summaryItems = [
  {
    label: "Energy",
    value: "1,850 kcal",
    target: "Target: 2,100 kcal",
    status: "Slightly under",
    statusType: "warning",
  },
  {
    label: "Protein",
    value: "72 g",
    target: "Target: 70 g",
    status: "Meeting target",
    statusType: "success",
  },
  {
    label: "Carbohydrates",
    value: "230 g",
    target: "Target: 260 g",
    status: "Slightly under",
    statusType: "warning",
  },
  {
    label: "Fat",
    value: "62 g",
    target: "Target: 70 g",
    status: "Within range",
    statusType: "success",
  },
];

export default function NutritionSummaryCard() {
  return (
    <section className={styles.summaryPage}>
      <div className={styles.summaryHeader}>
        <p className={styles.eyebrow}>Sprint 1 · Basic Version</p>
        <h1>Nutrition Summary</h1>
        <p>
          View simple nutritional feedback using hardcoded values. This page is
          frontend-only for Sprint 1.
        </p>
      </div>

      <section className={styles.overviewCard}>
        <div>
          <p className={styles.cardLabel}>Daily Intake Summary</p>
          <h2>Basic nutritional feedback</h2>
          <p>
            This summary gives a quick view of estimated energy and
            macronutrient intake against placeholder targets.
          </p>
        </div>

