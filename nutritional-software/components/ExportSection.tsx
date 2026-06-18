"use client";

// Author: Logan

import { useState, useEffect } from "react";
import styles from "./ExportSection.module.css";

type RdiEntry = { label: string; unit: string; target: number };
type RdiMap = Record<string, RdiEntry>;

const DEFAULT_RDI: RdiMap = {
  energy_kcal:  { label: "Energy",        unit: "kcal", target: 2100 },
  protein:      { label: "Protein",       unit: "g",    target: 70   },
  carbohydrate: { label: "Carbohydrates", unit: "g",    target: 260  },
  fat:          { label: "Fat",           unit: "g",    target: 70   },
  sugar:        { label: "Sugar",         unit: "g",    target: 50   },
  sodium:       { label: "Sodium",        unit: "mg",   target: 2000 },
  fibre:        { label: "Fibre",         unit: "g",    target: 25   },
  calcium:      { label: "Calcium",       unit: "mg",   target: 1000 },
  iron:         { label: "Iron",          unit: "mg",   target: 18   },
  vitamin_c:    { label: "Vitamin C",     unit: "mg",   target: 45   },
};

type DailyTotal = Record<string, number | string>;
type LogEntry   = Record<string, number | string | null>;

function fmt(n: number, dp = 1) {
  return Number.isFinite(n) ? n.toFixed(dp) : "0";
}

function pct(actual: number, target: number) {
  return target > 0 ? Math.round((actual / target) * 100) : 0;
}

function status(p: number) {
  if (p < 80)  return "Below target";
  if (p > 120) return "Above target";
  return "On target";
}

function offsetDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchDailyTotals(start: string, end: string): Promise<DailyTotal[]> {
  const res  = await fetch(`/api/visualisation?start=${start}&end=${end}`);
  const data = await res.json();
  return data.dailyTotals ?? [];
}

async function fetchLogEntries(start: string, end: string): Promise<LogEntry[]> {
  const res  = await fetch(`/api/food-log?start=${start}&end=${end}`);
  const data = await res.json();
  return data.logs ?? [];
}

function avgTotals(days: DailyTotal[], rdi: RdiMap): Record<string, number> {
  if (days.length === 0) return {};
  const sums: Record<string, number> = {};
  for (const key of Object.keys(rdi)) {
    sums[key] = days.reduce((acc, d) => acc + (Number(d[key]) || 0), 0) / days.length;
  }
  return sums;
}

// ── CSV ─────────────────────────────────────────────────────────────────────

function buildCSV(logs: LogEntry[], days: DailyTotal[], start: string, end: string, rdi: RdiMap): string {
  const lines: string[] = [];
  const avgs = avgTotals(days, rdi);

  lines.push(`Nutritional Intake Report`);
  lines.push(`Date Range,${start} to ${end}`);
  lines.push(`Generated,${todayStr()}`);
  lines.push(``);

  lines.push(`FOOD LOG`);
  lines.push(`Date,Meal,Food,Amount,Unit,Calories (kcal),Protein (g),Carbs (g),Fat (g),Sugar (g),Sodium (mg),Fibre (g)`);
  for (const e of logs) {
    lines.push([
      e.date, e.meal, `"${e.food_name}"`, e.amount, `"${e.unit}"`,
      fmt(Number(e.energy_kcal), 0), fmt(Number(e.protein)), fmt(Number(e.carbohydrate)),
      fmt(Number(e.fat)), fmt(Number(e.sugar)), fmt(Number(e.sodium), 0), fmt(Number(e.fibre)),
    ].join(","));
  }
  lines.push(``);

  lines.push(`DAILY TOTALS`);
  lines.push(`Date,Calories (kcal),Protein (g),Carbs (g),Fat (g),Sugar (g),Sodium (mg),Fibre (g),Entries`);
  for (const d of days) {
    lines.push([
      d.date, fmt(Number(d.energy_kcal), 0), fmt(Number(d.protein)), fmt(Number(d.carbohydrate)),
      fmt(Number(d.fat)), fmt(Number(d.sugar)), fmt(Number(d.sodium), 0), fmt(Number(d.fibre)),
      d.entry_count,
    ].join(","));
  }
  lines.push(``);

  lines.push(`RDI COMPARISON (${days.length}-day average)`);
  lines.push(`Nutrient,Unit,Daily Average,RDI Target,% of Target,Status`);
  for (const [key, { label, unit, target }] of Object.entries(rdi)) {
    const avg = avgs[key] ?? 0;
    const p   = pct(avg, target);
    lines.push([label, unit, fmt(avg, 1), target, p, status(p)].join(","));
  }

  return lines.join("\n");
}

// ── PDF helpers ──────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: jsPDF dynamic import
async function makePDF(): Promise<any> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF();
  return { doc, autoTable };
}

// ── PDF Report ───────────────────────────────────────────────────────────────

async function buildPDFReport(days: DailyTotal[], start: string, end: string, rdi: RdiMap) {
  const { doc, autoTable } = await makePDF();
  const avgs = avgTotals(days, rdi);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Nutritional Intake Report", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date range: ${start} to ${end}`, 14, 30);
  doc.text(`Generated: ${todayStr()}`, 14, 36);
  doc.text(`Days with data: ${days.length}`, 14, 42);

  // Daily totals table
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Daily Totals", 14, 54);

  autoTable(doc, {
    startY: 58,
    head: [["Date", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "Fibre (g)", "Sodium (mg)"]],
    body: days.map((d) => [
      d.date,
      fmt(Number(d.energy_kcal), 0),
      fmt(Number(d.protein)),
      fmt(Number(d.carbohydrate)),
      fmt(Number(d.fat)),
      fmt(Number(d.fibre)),
      fmt(Number(d.sodium), 0),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  // biome-ignore lint/suspicious/noExplicitAny: jsPDF lastAutoTable
  const afterTable = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Intake vs. RDI (Daily Average)", 14, afterTable);

  autoTable(doc, {
    startY: afterTable + 4,
    head: [["Nutrient", "Unit", "Average", "RDI Target", "% of Target", "Status"]],
    body: Object.entries(rdi).map(([key, { label, unit, target }]) => {
      const avg = avgs[key] ?? 0;
      const p   = pct(avg, target);
      return [label, unit, fmt(avg, 1), String(target), `${p}%`, status(p)];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 40] },
    // biome-ignore lint/suspicious/noExplicitAny: jsPDF autoTable cell hook
    didParseCell(data: any) {
      if (data.column.index === 5 && data.section === "body") {
        const s = data.cell.raw as string;
        if (s === "Below target") data.cell.styles.textColor = [37, 99, 235];
        else if (s === "Above target") data.cell.styles.textColor = [220, 38, 38];
        else data.cell.styles.textColor = [22, 163, 74];
      }
    },
  });

  doc.save(`nutrition-report-${start}-to-${end}.pdf`);
}

// ── Assignment Summary PDF ───────────────────────────────────────────────────

async function buildAssignmentPDF(days: DailyTotal[], start: string, end: string, rdi: RdiMap) {
  const { doc, autoTable } = await makePDF();
  const avgs = avgTotals(days, rdi);

  const below  = Object.entries(rdi).filter(([k]) => pct(avgs[k] ?? 0, rdi[k].target) < 80);
  const above  = Object.entries(rdi).filter(([k]) => pct(avgs[k] ?? 0, rdi[k].target) > 120);
  const onTgt  = Object.entries(rdi).filter(([k]) => { const p = pct(avgs[k] ?? 0, rdi[k].target); return p >= 80 && p <= 120; });

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Dietary Intake Analysis", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Analysis period: ${start} to ${end}  |  Days recorded: ${days.length}  |  Generated: ${todayStr()}`, 14, 32);

  // Horizontal rule
  doc.setDrawColor(180);
  doc.line(14, 36, 196, 36);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Overview", 14, 46);

  const totalKcal = days.reduce((s, d) => s + (Number(d.energy_kcal) || 0), 0);
  const totalEntries = days.reduce((s, d) => s + (Number(d.entry_count) || 0), 0);

  const overview = [
    `This report covers ${days.length} day(s) of dietary intake data recorded between ${start} and ${end}.`,
    `A total of ${totalEntries} food entries were logged, providing ${fmt(totalKcal, 0)} kcal`,
    `across the period (average ${fmt(days.length > 0 ? totalKcal / days.length : 0, 0)} kcal/day).`,
    ``,
    `Of the ${Object.keys(rdi).length} nutrients tracked:`,
    `  - ${onTgt.length} were within the recommended daily intake (RDI) range`,
    `  - ${below.length} were below target: ${below.map(([, v]) => v.label).join(", ") || "none"}`,
    `  - ${above.length} were above target: ${above.map(([, v]) => v.label).join(", ") || "none"}`,
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let y = 54;
  for (const line of overview) {
    doc.text(line, 14, y);
    y += 6;
  }

  y += 4;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Nutrient Intake vs. Recommended Daily Intake", 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [["Nutrient", "Unit", "Avg/Day", "RDI", "% of RDI", "Assessment"]],
    body: Object.entries(rdi).map(([key, { label, unit, target }]) => {
      const avg = avgs[key] ?? 0;
      const p   = pct(avg, target);
      return [label, unit, fmt(avg, 1), String(target), `${p}%`, status(p)];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: { 0: { fontStyle: "bold" } },
    // biome-ignore lint/suspicious/noExplicitAny: jsPDF autoTable cell hook
    didParseCell(data: any) {
      if (data.column.index === 5 && data.section === "body") {
        const s = data.cell.raw as string;
        if (s === "Below target") data.cell.styles.textColor = [37, 99, 235];
        else if (s === "Above target") data.cell.styles.textColor = [220, 38, 38];
        else data.cell.styles.textColor = [22, 163, 74];
      }
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: jsPDF lastAutoTable
  let finalY = (doc as any).lastAutoTable.finalY + 10;

  if (below.length > 0 || above.length > 0) {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Key Findings", 14, finalY);
    finalY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    for (const [key, { label, unit, target }] of below) {
      const avg = avgs[key] ?? 0;
      const p   = pct(avg, target);
      doc.text(`• ${label}: averaged ${fmt(avg, 1)}${unit}/day (${p}% of RDI). Consider increasing intake through dietary sources.`, 14, finalY, { maxWidth: 182 });
      finalY += 10;
    }
    for (const [key, { label, unit, target }] of above) {
      const avg = avgs[key] ?? 0;
      const p   = pct(avg, target);
      doc.text(`• ${label}: averaged ${fmt(avg, 1)}${unit}/day (${p}% of RDI). Intake exceeds recommended levels.`, 14, finalY, { maxWidth: 182 });
      finalY += 10;
    }
  }

  finalY += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120);
  doc.text("RDI values are based on default adult targets. Individual requirements may vary. Generated by Nutritional Software.", 14, finalY, { maxWidth: 182 });

  doc.save(`dietary-analysis-${start}-to-${end}.pdf`);
}

// ── Component ────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Last 7 days",  days: 7  },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Custom",       days: 0  },
];

export default function ExportSection() {
  const [preset, setPreset]       = useState(7);
  const [customStart, setStart]   = useState(offsetDate(7));
  const [customEnd,   setEnd]     = useState(todayStr());
  const [loading, setLoading]     = useState<string | null>(null);
  const [message, setMessage]     = useState("");
  const [rdi, setRdi]             = useState<RdiMap>(DEFAULT_RDI);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.targets) {
          const tgt = data.targets;
          setRdi({
            energy_kcal:  { label: "Energy",        unit: "kcal", target: tgt.energy_kcal.target  },
            protein:      { label: "Protein",       unit: "g",    target: tgt.protein.target       },
            carbohydrate: { label: "Carbohydrates", unit: "g",    target: tgt.carbohydrate.target  },
            fat:          { label: "Fat",           unit: "g",    target: tgt.fat.target           },
            sugar:        { label: "Sugar",         unit: "g",    target: tgt.sugar.target         },
            sodium:       { label: "Sodium",        unit: "mg",   target: tgt.sodium.target        },
            fibre:        { label: "Fibre",         unit: "g",    target: tgt.fibre.target         },
            calcium:      { label: "Calcium",       unit: "mg",   target: tgt.calcium.target       },
            iron:         { label: "Iron",          unit: "mg",   target: tgt.iron.target          },
            vitamin_c:    { label: "Vitamin C",     unit: "mg",   target: tgt.vitamin_c.target     },
          });
        }
      })
      .catch(() => {});
  }, []);

  const start = preset > 0 ? offsetDate(preset) : customStart;
  const end   = preset > 0 ? todayStr()          : customEnd;

  async function run(type: "csv" | "pdf-report" | "pdf-summary") {
    setLoading(type);
    setMessage("");
    try {
      const [days, logs] = await Promise.all([
        fetchDailyTotals(start, end),
        type === "csv" ? fetchLogEntries(start, end) : Promise.resolve([]),
      ]);

      if (days.length === 0 && logs.length === 0) {
        setMessage("No data found for this date range.");
        return;
      }

      if (type === "csv")         triggerDownload(buildCSV(logs, days, start, end, rdi), `nutrition-${start}-to-${end}.csv`, "text/csv");
      if (type === "pdf-report")  await buildPDFReport(days, start, end, rdi);
      if (type === "pdf-summary") await buildAssignmentPDF(days, start, end, rdi);
    } catch (e) {
      setMessage("Export failed. Check the console for details.");
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Export</h2>
      <p className={styles.sub}>Download your intake data as a CSV or PDF report.</p>

      <div className={styles.presets}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`${styles.presetBtn} ${preset === p.days ? styles.presetActive : ""}`}
            onClick={() => setPreset(p.days)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 0 && (
        <div className={styles.customRow}>
          <label>
            From
            <input type="date" value={customStart} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={customEnd} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
      )}

      <p className={styles.rangeLabel}>
        Range: <strong>{start}</strong> → <strong>{end}</strong>
      </p>

      <div className={styles.buttons}>
        <div className={styles.exportItem}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => run("csv")}
            disabled={!!loading}
          >
            {loading === "csv" ? "Exporting…" : "Export CSV"}
          </button>
          <span className={styles.btnDesc}>Raw log + daily totals + RDI comparison</span>
        </div>

        <div className={styles.exportItem}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => run("pdf-report")}
            disabled={!!loading}
          >
            {loading === "pdf-report" ? "Exporting…" : "Export PDF Report"}
          </button>
          <span className={styles.btnDesc}>Daily totals and intake vs. RDI table</span>
        </div>

        <div className={styles.exportItem}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => run("pdf-summary")}
            disabled={!!loading}
          >
            {loading === "pdf-summary" ? "Exporting…" : "Export Assignment Summary"}
          </button>
          <span className={styles.btnDesc}>Written analysis report suitable for submission</span>
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
