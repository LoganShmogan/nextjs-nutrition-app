"use client";

// Author: Marty Orchard
// Area: Frontend / UI

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/analysis/page.module.css";

type AnalysisFormData = {
  analysisName: string;
  patientIdentifier: string;
  notes: string;
  date: string;
};

type SavedAnalysis = {
  id: number;
  analysis_name: string;
  patient_identifier: string | null;
  notes: string | null;
  date: string;
  created_at: string;
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const emptyForm: AnalysisFormData = {
  analysisName: "",
  patientIdentifier: "",
  notes: "",
  date: todayStr(),
};

export default function Analysis() {
  const [formData, setFormData] = useState<AnalysisFormData>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    fetch("/api/analyses")
      .then((r) => r.json())
      .then((data) => setSavedAnalyses(data.analyses ?? []))
      .catch(() => {});
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSaved(false);
    setSaveError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save analysis.");
      }

      setSaved(true);
      const newEntry: SavedAnalysis = {
        id: data.id as number,
        analysis_name: formData.analysisName,
        patient_identifier: formData.patientIdentifier || null,
        notes: formData.notes || null,
        date: formData.date,
        created_at: new Date().toISOString(),
      };
      setSavedAnalyses((prev) => [newEntry, ...prev]);
      setFormData(emptyForm);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save analysis.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(emptyForm);
    setSaved(false);
    setSaveError(null);
  }

  return (
    <section className={styles.analysisPage}>
      <div className={styles.analysisHeader}>
        <h1>Save Analysis</h1>
        <p>Save a patient nutrition analysis with notes for later review.</p>
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
                placeholder="e.g. Day 1 dietary review"
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
              <li>Analysis name and patient identifier</li>
              <li>Notes and date</li>
            </ul>
          </div>

          <div className={styles.formActions}>
            <button className={styles.primaryButton} type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Analysis"}
            </button>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleCancel}
            >
              Clear
            </button>
          </div>

          {saved && (
            <div className={styles.successMessage}>
              Analysis saved successfully.
            </div>
          )}

          {saveError && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>{saveError}</p>
          )}
        </form>

        <aside className={styles.supportCard}>
          <h2>Saved Analyses</h2>

          {savedAnalyses.length === 0 ? (
            <p>No analyses saved yet.</p>
          ) : (
            <div className={styles.previewList}>
              {savedAnalyses.map((a) => (
                <div key={a.id}>
                  <span>{a.date}</span>
                  <strong>{a.analysis_name}</strong>
                  {a.patient_identifier && <small>{a.patient_identifier}</small>}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
