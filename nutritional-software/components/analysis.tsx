"use client";

// Author: Marty Orchard
// Area: Frontend / UI

import { useState } from "react";
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
            <button
              className={styles.backButton}
              type="button"
              onClick={handleCancel}
            >
              ← Cancel
            </button>

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
