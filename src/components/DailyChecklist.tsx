"use client";

interface TypeCounts {
  post: number;
  comment: number;
  reaction: number;
}

interface DailyChecklistProps {
  todayTypeCounts: TypeCounts;
  currentStreak: number;
  weeklyGoal: number;
  thisWeekTotal: number;
  onLogActivity: (type: "post" | "comment" | "reaction") => void;
}

const ITEMS = [
  { key: "post" as const, label: "Post", emoji: "📝" },
  { key: "comment" as const, label: "Comment", emoji: "💬" },
  { key: "reaction" as const, label: "Reaction", emoji: "👍" },
] as const;

function getNudgeMessage(
  todayTypeCounts: TypeCounts,
  currentStreak: number,
  weeklyGoal: number,
  thisWeekTotal: number
): string | null {
  const todayTotal = todayTypeCounts.post + todayTypeCounts.comment + todayTypeCounts.reaction;
  const remaining = Math.max(weeklyGoal - thisWeekTotal, 0);

  if (remaining === 1) {
    return `You're 1 activity away from your weekly goal! 🎯`;
  }
  if (currentStreak > 0 && todayTotal === 0) {
    return `You have a ${currentStreak}-day streak — don't let it slip away! 🔥`;
  }
  if (todayTotal === 0) {
    return "No activity yet today. A small action today builds a big habit! 💪";
  }
  if (todayTotal >= 3) {
    return "Amazing! You've covered all 3 activity types today! 🌟";
  }
  return null;
}

export default function DailyChecklist({
  todayTypeCounts,
  currentStreak,
  weeklyGoal,
  thisWeekTotal,
  onLogActivity,
}: DailyChecklistProps) {
  const nudge = getNudgeMessage(todayTypeCounts, currentStreak, weeklyGoal, thisWeekTotal);

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
        ✅ Today&apos;s Checklist
      </h3>

      <div className="space-y-2 mb-3">
        {ITEMS.map(({ key, label, emoji }) => {
          const done = todayTypeCounts[key] > 0;
          return (
            <div
              key={key}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                done
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-zinc-50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg ${done ? "opacity-100" : "opacity-50"}`}
                  aria-hidden="true"
                >
                  {done ? "✅" : "⬜"}
                </span>
                <span
                  className={`text-sm font-medium ${
                    done
                      ? "text-green-800 dark:text-green-200 line-through"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {emoji} {label}
                </span>
                {done && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ×{todayTypeCounts[key]}
                  </span>
                )}
              </div>
              {!done && (
                <button
                  onClick={() => onLogActivity(key)}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Log
                </button>
              )}
            </div>
          );
        })}
      </div>

      {nudge && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{nudge}</p>
        </div>
      )}
    </div>
  );
}
