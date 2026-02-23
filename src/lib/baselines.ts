/**
 * Personal-best tracking and baseline computation.
 * Data is persisted in localStorage so records survive page reloads.
 */

import { type DailyActivity } from "./analytics";

const PERSONAL_BESTS_KEY = "linkedin_tracker_personal_bests";

export interface PersonalBests {
  weeklyTotal: number;
  weeklyScore: number;
}

const DEFAULT_BESTS: PersonalBests = { weeklyTotal: 0, weeklyScore: 0 };

/** Read stored personal bests from localStorage. */
export function getPersonalBests(): PersonalBests {
  if (typeof window === "undefined") return DEFAULT_BESTS;
  try {
    const stored = localStorage.getItem(PERSONAL_BESTS_KEY);
    if (stored) return { ...DEFAULT_BESTS, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_BESTS };
}

function savePersonalBests(bests: PersonalBests): void {
  localStorage.setItem(PERSONAL_BESTS_KEY, JSON.stringify(bests));
}

export interface PersonalBestCheckResult {
  newBestTotal: boolean;
  newBestScore: boolean;
  bests: PersonalBests;
}

/**
 * Compare current weekly values against stored personal bests.
 * Updates localStorage when new records are set.
 * Returns which records were broken plus the updated bests.
 */
export function checkAndUpdatePersonalBests(
  weeklyTotal: number,
  weeklyScore: number
): PersonalBestCheckResult {
  const stored = getPersonalBests();
  const newBestTotal = weeklyTotal > stored.weeklyTotal;
  const newBestScore = weeklyScore > stored.weeklyScore;

  if (newBestTotal || newBestScore) {
    const updated: PersonalBests = {
      weeklyTotal: Math.max(weeklyTotal, stored.weeklyTotal),
      weeklyScore: Math.max(weeklyScore, stored.weeklyScore),
    };
    savePersonalBests(updated);
    return { newBestTotal, newBestScore, bests: updated };
  }

  return { newBestTotal: false, newBestScore: false, bests: stored };
}

export interface BaselineSummary {
  weekly: { avg: number; max: number };
  monthly: { avg: number; max: number };
}

/**
 * Compute baseline stats (weekly avg/max and monthly avg/max) from daily data.
 * Weeks are Mon–Sun; months are calendar months.
 */
export function computeBaselines(daily: DailyActivity[]): BaselineSummary {
  const weekTotals = new Map<string, number>();
  const monthTotals = new Map<string, number>();

  daily.forEach((d) => {
    // Use noon to avoid DST edge cases (same convention as analytics.ts)
    const date = new Date(d.day + "T12:00:00");
    const dow = date.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    const weekKey = monday.toISOString().split("T")[0];
    weekTotals.set(weekKey, (weekTotals.get(weekKey) ?? 0) + d.count);

    const monthKey = d.day.slice(0, 7); // YYYY-MM
    monthTotals.set(monthKey, (monthTotals.get(monthKey) ?? 0) + d.count);
  });

  const weekArr = Array.from(weekTotals.values());
  const monthArr = Array.from(monthTotals.values());

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
  const max = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);

  return {
    weekly: { avg: avg(weekArr), max: max(weekArr) },
    monthly: { avg: avg(monthArr), max: max(monthArr) },
  };
}
