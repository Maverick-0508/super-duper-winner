"use client";

interface MilestoneBadgesProps {
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  activeDays: number;
}

interface Badge {
  id: string;
  emoji: string;
  label: string;
  description: string;
  earned: boolean;
}

function buildBadges(
  currentStreak: number,
  longestStreak: number,
  totalActivities: number,
  activeDays: number
): Badge[] {
  return [
    {
      id: "first-activity",
      emoji: "🚀",
      label: "First Step",
      description: "Log your first activity",
      earned: totalActivities >= 1,
    },
    {
      id: "streak-3",
      emoji: "🔥",
      label: "On Fire",
      description: "3-day streak",
      earned: longestStreak >= 3,
    },
    {
      id: "streak-7",
      emoji: "⚡",
      label: "Week Warrior",
      description: "7-day streak",
      earned: longestStreak >= 7,
    },
    {
      id: "streak-30",
      emoji: "🌟",
      label: "Monthly Legend",
      description: "30-day streak",
      earned: longestStreak >= 30,
    },
    {
      id: "total-10",
      emoji: "🎯",
      label: "Getting Started",
      description: "10 total activities",
      earned: totalActivities >= 10,
    },
    {
      id: "total-30",
      emoji: "🏆",
      label: "Consistent Creator",
      description: "30 total activities",
      earned: totalActivities >= 30,
    },
    {
      id: "total-100",
      emoji: "💎",
      label: "Power User",
      description: "100 total activities",
      earned: totalActivities >= 100,
    },
    {
      id: "active-days-7",
      emoji: "📅",
      label: "Full Week",
      description: "Active on 7 different days",
      earned: activeDays >= 7,
    },
    {
      id: "current-streak-active",
      emoji: "🔰",
      label: "Streak Alive",
      description: "Currently on a streak",
      earned: currentStreak >= 1,
    },
  ];
}

export default function MilestoneBadges({
  currentStreak,
  longestStreak,
  totalActivities,
  activeDays,
}: MilestoneBadgesProps) {
  const badges = buildBadges(currentStreak, longestStreak, totalActivities, activeDays);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          🏅 Milestones
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {earnedCount}/{badges.length} earned
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            title={`${badge.label}: ${badge.description}`}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
              badge.earned
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700"
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 opacity-40 grayscale"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">{badge.emoji}</span>
            <span
              className={`text-xs font-medium leading-tight ${
                badge.earned
                  ? "text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
