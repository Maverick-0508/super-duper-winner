"use client";

import { useState, useCallback } from "react";
import { getThisWeekTotal, type DailyActivity } from "@/lib/analytics";

const GOAL_KEY = "linkedin_tracker_weekly_goal";
const DEFAULT_GOAL = 5;

/** Pre-defined goal templates users can apply with one click. */
export const GOAL_TEMPLATES = [
  {
    name: "Consistent Posting",
    weeklyGoal: 5,
    description: "Post at least 5 times per week to build audience trust.",
  },
  {
    name: "Engagement Growth",
    weeklyGoal: 15,
    description: "Mix posts, comments and reactions to grow your reach.",
  },
  {
    name: "Thought Leader",
    weeklyGoal: 3,
    description: "Focus on 3 high-quality, in-depth posts per week.",
  },
  {
    name: "Community Builder",
    weeklyGoal: 10,
    description: "Engage with 10 posts via comments and reactions each week.",
  },
] as const;

interface GoalCardProps {
  daily: DailyActivity[];
}

function getStoredGoal(): number {
  if (typeof window === "undefined") return DEFAULT_GOAL;
  const stored = localStorage.getItem(GOAL_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_GOAL;
}

function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
}: {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  const isComplete = progress >= 100;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-200 dark:text-zinc-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={
          isComplete
            ? "text-green-500 dark:text-green-400"
            : "text-[var(--accent,#0ea5e9)]"
        }
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

export default function GoalCard({ daily }: GoalCardProps) {
  const [goal, setGoal] = useState<number>(getStoredGoal);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState<string>(() => String(getStoredGoal()));
  const [showTemplates, setShowTemplates] = useState(false);

  // No need for a separate useEffect to read localStorage - handled in lazy initializers

  const applyGoal = useCallback((value: number) => {
    setGoal(value);
    setInputVal(String(value));
    localStorage.setItem(GOAL_KEY, String(value));
    setEditing(false);
    setShowTemplates(false);
  }, []);

  const saveGoal = useCallback(() => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      applyGoal(parsed);
    } else {
      setEditing(false);
    }
  }, [inputVal, applyGoal]);

  const thisWeek = getThisWeekTotal(daily);
  const progress = goal > 0 ? (thisWeek / goal) * 100 : 0;
  const remaining = Math.max(goal - thisWeek, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          🎯 Weekly Goal
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowTemplates((v) => !v); setEditing(false); }}
            className="text-xs px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-600 rounded transition-colors"
          >
            📋 Templates
          </button>
          {!editing ? (
            <button
              onClick={() => { setEditing(true); setShowTemplates(false); }}
              className="text-xs px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-600 rounded transition-colors"
            >
              Edit goal
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveGoal();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <button
                onClick={saveGoal}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Goal Templates */}
      {showTemplates && (
        <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
            Goal Templates
          </p>
          <div className="space-y-2">
            {GOAL_TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => applyGoal(t.weeklyGoal)}
                className={`w-full text-left px-3 py-2 rounded-md border transition-colors text-sm ${
                  goal === t.weeklyGoal
                    ? "border-[var(--accent,#0ea5e9)] bg-sky-50 dark:bg-sky-900/20 text-zinc-900 dark:text-zinc-50"
                    : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span className="font-medium">{t.name}</span>
                <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                  ({t.weeklyGoal}/wk)
                </span>
                <br />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ProgressRing progress={progress} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              {thisWeek}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">/{goal}</span>
          </div>
        </div>

        <div className="flex-1">
          {progress >= 100 ? (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              🎉 Goal reached! You&apos;ve logged {thisWeek} activities this week.
            </p>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {remaining === 1
                ? `You're 1 activity away from your weekly goal!`
                : `${remaining} more ${remaining === 1 ? "activity" : "activities"} to reach your goal of ${goal} this week.`}
            </p>
          )}
          <div className="mt-1 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                progress >= 100
                  ? "bg-green-500"
                  : "bg-[var(--accent,#0ea5e9)]"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
