"use client";

import { useMemo } from "react";

interface DailyActivity {
  day: string;
  count: number;
}

interface ActivityHeatmapProps {
  activity: DailyActivity[];
}

// GitHub contribution graph uses 5 levels (0-4)
const INTENSITY_LEVELS = 5;

function getIntensityLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  
  // Calculate intensity level (1-4) based on count
  const percentage = count / maxCount;
  if (percentage <= 0.25) return 1;
  if (percentage <= 0.5) return 2;
  if (percentage <= 0.75) return 3;
  return 4;
}

function getIntensityColor(level: number): string {
  // Light theme colors (GitHub-style green)
  const lightColors = [
    "bg-zinc-100 dark:bg-zinc-800", // No activity
    "bg-green-200 dark:bg-green-900/40", // Low
    "bg-green-400 dark:bg-green-700/60", // Medium-low
    "bg-green-600 dark:bg-green-600/80", // Medium-high
    "bg-green-800 dark:bg-green-500", // High
  ];
  
  return lightColors[level] || lightColors[0];
}

export default function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (!activity || activity.length === 0) {
      return { weeks: [], maxCount: 0 };
    }

    // Create a map of dates to counts for quick lookup
    const activityMap = new Map<string, number>();
    activity.forEach((item) => {
      activityMap.set(item.day, item.count);
    });

    // Find max count for intensity calculation
    const maxCount = Math.max(...activity.map((item) => item.count));

    // Get the date range (last 60 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 59); // 60 days total including today

    // Generate all days in the range
    const allDays: { date: Date; count: number; dateStr: string }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = activityMap.get(dateStr) || 0;
      allDays.push({
        date: new Date(currentDate),
        count,
        dateStr,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Organize into weeks (Sunday to Saturday)
    // Pad the beginning to start on Sunday
    const firstDay = allDays[0].date.getDay(); // 0 = Sunday, 6 = Saturday
    const paddingDays = firstDay; // Number of empty cells before first day

    // Create padding
    const padding = Array(paddingDays).fill(null);

    // Combine padding and actual days
    const allCells = [...padding, ...allDays];

    // Split into weeks (7 days each)
    const weeks: (typeof allDays[0] | null)[][] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7));
    }

    return { weeks, maxCount };
  }, [activity]);

  const { weeks, maxCount } = heatmapData;

  if (weeks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
                title={level === 0 ? "No activity" : `Level ${level}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1">
        <div className="w-8 flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="h-3"></div>
          <div className="h-3">Mon</div>
          <div className="h-3"></div>
          <div className="h-3">Wed</div>
          <div className="h-3"></div>
          <div className="h-3">Fri</div>
          <div className="h-3"></div>
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="w-3 h-3"
                    />
                  );
                }

                const level = getIntensityLevel(day.count, maxCount);
                const dateStr = day.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(
                      level
                    )} border border-zinc-200 dark:border-zinc-700 transition-all hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 cursor-pointer`}
                    title={`${dateStr}: ${day.count} ${
                      day.count === 1 ? "activity" : "activities"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {activity.filter(item => item.count > 0).length} active days in the last 60 days
      </p>
    </div>
  );
}
