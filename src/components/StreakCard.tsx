"use client";

import { useMemo } from "react";
import { getBestDay, type DailyActivity } from "@/lib/analytics";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  daily: DailyActivity[];
  onRecoverStreak?: () => void;
}

export default function StreakCard({
  currentStreak,
  longestStreak,
  daily,
  onRecoverStreak,
}: StreakCardProps) {
  const bestDay = useMemo(() => getBestDay(daily), [daily]);

  // Determine if today has any activity
  const todayKey = new Date().toISOString().split("T")[0];
  const todayHasActivity = daily.some((d) => d.day === todayKey && d.count > 0);

  // Yesterday had activity but today doesn't → show recovery CTA
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];
  const yesterdayHadActivity = daily.some((d) => d.day === yesterdayKey && d.count > 0);

  const showRecoveryCTA = !todayHasActivity && yesterdayHadActivity;

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
        🔥 Streak History
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
            {currentStreak}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Current Streak</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {longestStreak}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Longest Streak 🏆</div>
        </div>
      </div>

      {bestDay && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          📅 <strong>Best day:</strong> {bestDay.dayName} (avg {bestDay.avgCount} activities)
        </p>
      )}

      {!bestDay && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mb-3">
          Best day insight requires daily-level data (time-of-day breakdown not available).
        </p>
      )}

      {showRecoveryCTA && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            ⚡ Keep your streak alive! You were active yesterday.
          </p>
          {onRecoverStreak && (
            <button
              onClick={onRecoverStreak}
              className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium transition-colors"
            >
              Log Activity Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
