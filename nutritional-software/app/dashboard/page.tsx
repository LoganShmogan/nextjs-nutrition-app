// Author: Marty & Logan

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ExportSection from "@/components/ExportSection";
import styles from "./page.module.css";

const NAV_ITEMS = [
  { href: "/patients",             label: "Patients",              desc: "Create and manage patient profiles."           },
  { href: "/food-log",             label: "Food Log",              desc: "Search and log daily food intake."              },
  { href: "/profile",              label: "Edit Profile",          desc: "View and edit the active patient's profile."    },
  { href: "/summary",              label: "Nutrition Summary",     desc: "Compare today's intake against RDI targets."    },
  { href: "/nutritional-feedback", label: "Nutritional Feedback",  desc: "See status feedback on today's nutrients."      },
  { href: "/analysis",             label: "Save Analysis",         desc: "Save a patient nutrition analysis with notes."  },
  { href: "/visualisation",        label: "Visualisation",         desc: "Browse weekly charts and nutrition history."    },
  { href: "/education",            label: "Education",             desc: "Learn about nutrients, RDIs, and take quizzes." },
];

type ActiveProfile = { id: number; patientName: string } | null;

export default function DashboardPage() {
  const router = useRouter();
  const [activeProfile, setActiveProfile] = useState<ActiveProfile>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setActiveProfile({ id: data.profile.id, patientName: data.profile.patientName });
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.brand}>
              <span className={styles.brandDot} />
              Nutritional Software
            </div>
            <h1 className={styles.heading}>Dashboard</h1>
            {activeProfile ? (
              <p className={styles.cardDesc}>
                Active patient: <strong>{activeProfile.patientName}</strong>
              </p>
            ) : (
              <p className={styles.cardDesc}>
                No active patient — <Link href="/patients">select or create one</Link>
              </p>
            )}
          </div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </header>

        <div className={styles.grid}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <strong className={styles.cardTitle}>{item.label}</strong>
              <p className={styles.cardDesc}>{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className={styles.exportWrap}>
          <ExportSection />
        </div>
      </div>
    </div>
  );
}
