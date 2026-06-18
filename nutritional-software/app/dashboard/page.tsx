// Author: Marty & Logan

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ExportSection from "@/components/ExportSection";
import styles from "./page.module.css";

const NAV_ITEMS = [
  { href: "/food-log",              label: "Food Log",              desc: "Search and log your daily food intake."         },
  { href: "/profile",               label: "Profile",               desc: "View and edit your personal health profile."    },
  { href: "/summary",               label: "Nutrition Summary",     desc: "Compare today's intake against RDI targets."    },
  { href: "/nutritional-feedback",  label: "Nutritional Feedback",  desc: "See status feedback on today's nutrients."      },
  { href: "/analysis",              label: "Save Analysis",         desc: "Save a patient nutrition analysis with notes."  },
  { href: "/visualisation",         label: "Visualisation",         desc: "Browse weekly charts and nutrition history."    },
];

export default function DashboardPage() {
  const router = useRouter();

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
