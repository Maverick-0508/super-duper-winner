/**
 * Streak calculation utilities for activity tracking.
 */

/**
 * Calculate the longest ever streak from a map of daily activity counts.
 *
 * @param dailyCounts - Map from YYYY-MM-DD to activity count
 * @returns The longest consecutive-day streak ever recorded
 */
export function calculateLongestStreak(
  dailyCounts: Record<string, number>
): number {
  const activeDays = Object.keys(dailyCounts)
    .filter((day) => dailyCounts[day] > 0)
    .sort();

  if (activeDays.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < activeDays.length; i++) {
    const prev = new Date(activeDays[i - 1]);
    const curr = new Date(activeDays[i]);
    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Calculate the current streak from a map of daily activity counts.
 * 
 * The current streak represents a continuous run of days with activity that:
 * - Ends on today (if today has activity), OR
 * - Ends on yesterday (if today has no activity but yesterday does)
 * 
 * A missing day in the past breaks the streak.
 * The absence of activity today does NOT break the streak if yesterday had activity.
 * 
 * @param dailyCounts - Map from YYYY-MM-DD to activity count
 * @param now - Optional current date (defaults to new Date(), useful for testing)
 * @returns The current streak count (number of consecutive days)
 */
export function calculateCurrentStreak(
  dailyCounts: Record<string, number>,
  now: Date = new Date()
): number {
  // Normalize 'now' to start of day in local timezone
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = formatDateKey(today);
  
  // Determine starting point: today if it has activity, otherwise yesterday
  let currentDate: Date;
  if (dailyCounts[todayKey] && dailyCounts[todayKey] > 0) {
    currentDate = today;
  } else {
    // Start from yesterday
    currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  let streak = 0;
  
  // Walk backward day by day, counting consecutive days with activity
  while (true) {
    const dayKey = formatDateKey(currentDate);
    const count = dailyCounts[dayKey] || 0;
    
    if (count > 0) {
      streak++;
      // Move to previous day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Found a day with no activity - streak is broken
      break;
    }
  }
  
  return streak;
}

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
