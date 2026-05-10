// Author: Marty Orchard
// Area: Frontend / UI

import NutritionSummaryCard from "@/components/NutritionSummaryCard";
import styles from "./page.module.css";

export default function SummaryPage() {
  return (
    <main className={styles.pageShell}>
      <NutritionSummaryCard />
    </main>
  );
}