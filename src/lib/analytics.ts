/**
 * Client-side analytics helpers derived from daily activity data.
 */

export interface DailyActivity {
  day: string; // YYYY-MM-DD
  count: number;
}

/**
 * Sum counts for a set of days that fall within [startISO, endISO] (inclusive).
 */
function sumRange(daily: DailyActivity[], startISO: string, endISO: string): number {
  return daily
    .filter((d) => d.day >= startISO && d.day <= endISO)
    .reduce((acc, d) => acc + d.count, 0);
}

/**
 * Format a Date to YYYY-MM-DD in LOCAL timezone.
 */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get ISO start/end keys for the current calendar week (Mon–Sun).
 * weeksBack = 0 → this week, weeksBack = 1 → last week.
 */
function weekRange(weeksBack: number): { start: string; end: string } {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun,6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset - weeksBack * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateKey(monday), end: toDateKey(sunday) };
}

/**
 * Get ISO start/end keys for the current calendar month.
 * monthsBack = 0 → this month, monthsBack = 1 → last month.
 */
function monthRange(monthsBack: number): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() - monthsBack;
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return { start: toDateKey(first), end: toDateKey(last) };
}

export interface PeriodSummary {
  label: string;
  total: number;
  delta: number; // absolute change vs previous period
  deltaPercent: number | null; // null when previous total was 0
}

/** Weekly summary: this week vs last week */
export function getWeeklySummary(daily: DailyActivity[]): PeriodSummary {
  const thisWeek = weekRange(0);
  const lastWeek = weekRange(1);
  const current = sumRange(daily, thisWeek.start, thisWeek.end);
  const previous = sumRange(daily, lastWeek.start, lastWeek.end);
  const delta = current - previous;
  return {
    label: "This Week",
    total: current,
    delta,
    deltaPercent: previous === 0 ? null : Math.round((delta / previous) * 100),
  };
}

/** Monthly summary: this month vs last month */
export function getMonthlySummary(daily: DailyActivity[]): PeriodSummary {
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);
  const current = sumRange(daily, thisMonth.start, thisMonth.end);
  const previous = sumRange(daily, lastMonth.start, lastMonth.end);
  const delta = current - previous;
  return {
    label: "This Month",
    total: current,
    delta,
    deltaPercent: previous === 0 ? null : Math.round((delta / previous) * 100),
  };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface BestDayResult {
  dayName: string; // e.g. "Wednesday"
  avgCount: number;
}

/**
 * Compute which day-of-week has the highest average activity count.
 * Returns null when there is no data.
 */
export function getBestDay(daily: DailyActivity[]): BestDayResult | null {
  const active = daily.filter((d) => d.count > 0);
  if (active.length === 0) return null;

  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);

  active.forEach((d) => {
    const dow = new Date(d.day + "T12:00:00").getDay(); // noon to avoid TZ edge cases
    totals[dow] += d.count;
    counts[dow]++;
  });

  let bestDow = 0;
  let bestAvg = 0;
  for (let i = 0; i < 7; i++) {
    if (counts[i] === 0) continue;
    const avg = totals[i] / counts[i];
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDow = i;
    }
  }

  return {
    dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][bestDow],
    avgCount: Math.round(bestAvg * 10) / 10,
  };
}

/** Return total activities for this week (Mon–today). */
export function getThisWeekTotal(daily: DailyActivity[]): number {
  const { start, end } = weekRange(0);
  return sumRange(daily, start, end);
}

/** Day-of-week labels short form */
export { DAY_NAMES };
