"use client";

import { useMemo } from "react";
import { computeQualityScore, ACTIVITY_WEIGHTS, type TypeCounts } from "@/lib/scoring";

interface QualityScoreCardProps {
  typeCounts: TypeCounts;
  label?: string;
  personalBest?: number;
  isNewBest?: boolean;
}

export default function QualityScoreCard({
  typeCounts,
  label = "This Week",
  personalBest,
  isNewBest = false,
}: QualityScoreCardProps) {
  const score = useMemo(() => computeQualityScore(typeCounts), [typeCounts]);
  const total = typeCounts.post + typeCounts.comment + typeCounts.reaction;

  const rows = [
    { key: "post", label: "Posts", weight: ACTIVITY_WEIGHTS.post, count: typeCounts.post },
    { key: "comment", label: "Comments", weight: ACTIVITY_WEIGHTS.comment, count: typeCounts.comment },
    { key: "reaction", label: "Reactions", weight: ACTIVITY_WEIGHTS.reaction, count: typeCounts.reaction },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          ⭐ Quality Score
          {isNewBest && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
              🏆 New PB!
            </span>
          )}
        </h3>
        {personalBest !== undefined && personalBest > 0 && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            PB: {personalBest} pts
          </span>
        )}
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="text-4xl font-bold text-[var(--accent,#0ea5e9)]">{score}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">pts · {label}</div>
      </div>

      <div className="space-y-2 text-sm mb-3">
        {rows.map(({ key, label: rowLabel, weight, count }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-20 text-zinc-600 dark:text-zinc-400">{rowLabel}</span>
            <span className="w-6 text-center font-medium text-zinc-900 dark:text-zinc-100">{count}</span>
            <span className="text-zinc-400 dark:text-zinc-500 text-xs">×{weight}</span>
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 mx-1">
              {total > 0 && (
                <div
                  className="h-1.5 rounded-full bg-[var(--accent,#0ea5e9)] opacity-60"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              )}
            </div>
            <span className="w-8 text-right text-zinc-500 dark:text-zinc-400">{count * weight}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Weights: post={ACTIVITY_WEIGHTS.post} pts, comment={ACTIVITY_WEIGHTS.comment} pts, reaction={ACTIVITY_WEIGHTS.reaction} pt
      </p>
    </div>
  );
}
