"use client";

import { useMemo } from "react";
import { getWeeklySummary, getMonthlySummary, type DailyActivity, type PeriodSummary } from "@/lib/analytics";

interface WeeklySummaryCardsProps {
  daily: DailyActivity[];
}

function DeltaBadge({ delta, deltaPercent }: Pick<PeriodSummary, "delta" | "deltaPercent">) {
  if (delta === 0) {
    return <span className="text-xs text-zinc-500 dark:text-zinc-400">= same</span>;
  }
  const isPositive = delta > 0;
  const sign = isPositive ? "+" : "";
  const color = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-500 dark:text-red-400";
  const pct = deltaPercent !== null ? ` (${sign}${deltaPercent}%)` : "";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {sign}{delta}{pct} vs prev
    </span>
  );
}

function SummaryCard({ summary }: { summary: PeriodSummary }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{summary.total}</div>
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{summary.label}</div>
      <DeltaBadge delta={summary.delta} deltaPercent={summary.deltaPercent} />
    </div>
  );
}

export default function WeeklySummaryCards({ daily }: WeeklySummaryCardsProps) {
  const weekly = useMemo(() => getWeeklySummary(daily), [daily]);
  const monthly = useMemo(() => getMonthlySummary(daily), [daily]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <SummaryCard summary={weekly} />
      <SummaryCard summary={monthly} />
    </div>
  );
}
