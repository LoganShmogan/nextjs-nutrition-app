"use client";

// Author: Marty Orchard
// Area: Frontend / UI

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/analysis/page.module.css";

type AnalysisFormData = {
  analysisName: string;
  patientIdentifier: string;
  notes: string;
  date: string;
};

const initialFormData: AnalysisFormData = {
  analysisName: "Pregnancy Case Study - Day 1",
  patientIdentifier: "A.M",
  notes: "21 year old pregnant female",
  date: "2026-04-22",
};

export default function Analysis() {
  const [formData, setFormData] = useState<AnalysisFormData>(initialFormData);
  const [saved, setSaved] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function handleCancel() {
    setFormData(initialFormData);
    setSaved(false);
  }

  return (
    <section className={styles.analysisPage}>
      <div className={styles.analysisHeader}>
        <p className={styles.eyebrow}>Sprint 1 · Basic Version</p>
        <h1>Save Analysis</h1>
        <p>
          Save the current patient nutrition analysis as a frontend-only
          placeholder. Backend saving will be added later.
        </p>
      </div>

      <div className={styles.analysisLayout}>
        <form className={styles.analysisCard} onSubmit={handleSubmit}>
          <div className={styles.cardTopBar}>
            <Link className={styles.secondaryButton} href="/">
              ← Cancel
            </Link>
            <strong>Save current Analysis</strong>
          </div>

          <div className={styles.formSection}>
            <label>
              Analysis Name
              <input
                type="text"
                name="analysisName"
                value={formData.analysisName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Patient Identifier optional
              <input
                type="text"
                name="patientIdentifier"
                value={formData.patientIdentifier}
                onChange={handleChange}
                placeholder="e.g. A.M"
              />
            </label>

            <label>
              Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add notes about this analysis"
              />
            </label>

            <label>
              Date
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className={styles.saveInfoBox}>
            <h2>What will be saved:</h2>
            <ul>
              <li>Patient information and goals</li>
              <li>All food items and quantities</li>
              <li>Nutritional calculations and summary</li>
              <li>Comparison to recommendations</li>
            </ul>
          </div>

          <div className={styles.formActions}>
            <button className={styles.primaryButton} type="submit">
              Save Analysis
            </button>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          {saved && (
            <div className={styles.successMessage}>
              Analysis saved as a Sprint 1 frontend placeholder.
            </div>
          )}
        </form>

        <aside className={styles.supportCard}>
          <h2>Study Support</h2>
          <p>
            Students can save multiple patient analyses for coursework,
            comparison, and later review.
          </p>

          <div className={styles.previewList}>
            <div>
              <span>Analysis</span>
              <strong>{formData.analysisName || "Not provided"}</strong>
            </div>

            <div>
              <span>Patient ID</span>
              <strong>{formData.patientIdentifier || "Not provided"}</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>{formData.date || "Not selected"}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{saved ? "Saved" : "Not saved yet"}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}