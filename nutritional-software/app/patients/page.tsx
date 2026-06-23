"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Patient = {
  id: number;
  patientName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  measurementSystem: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/profile?all=true").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([allData, activeData]) => {
      setPatients(allData.profiles ?? []);
      setActiveId(activeData.profile?.id ?? null);
      setLoading(false);
    });
  }, []);

  async function handleSelect(profileId: number) {
    await fetch("/api/profile/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });
    setActiveId(profileId);
  }

  async function handleDelete(profileId: number) {
    if (!confirm("Delete this patient and all their food logs?")) return;
    await fetch(`/api/profile?id=${profileId}`, { method: "DELETE" });
    setPatients((prev) => prev.filter((p) => p.id !== profileId));
    if (activeId === profileId) setActiveId(null);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Patient Profiles</h1>
            <p>
              Manage patient profiles. Select an active patient to log food and
              run analyses for them.
            </p>
          </div>
          <Link href="/dashboard" className={styles.backBtn}>
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          className={styles.newPatientBtn}
          onClick={() => router.push("/profile?new=true")}
        >
          + New Patient
        </button>

        {patients.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No patient profiles yet. Create one to get started.</p>
          </div>
        ) : (
          <div className={styles.patientList}>
            {patients.map((p) => (
              <div
                key={p.id}
                className={`${styles.patientCard} ${p.id === activeId ? styles.active : ""}`}
              >
                <div className={styles.patientInfo}>
                  <h3>
                    {p.patientName}
                    {p.id === activeId && (
                      <span className={styles.activeBadge}>Active</span>
                    )}
                  </h3>
                  <span className={styles.patientMeta}>
                    {p.age} yrs · {p.gender} · {p.weight}
                    {p.measurementSystem === "Metric" ? "kg" : "lb"} · {p.activityLevel}
                  </span>
                </div>
                <div className={styles.patientActions}>
                  {p.id !== activeId && (
                    <button
                      type="button"
                      className={styles.selectBtn}
                      onClick={() => handleSelect(p.id)}
                    >
                      Select
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => router.push(`/profile?edit=${p.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
