/**
 * Activity quality scoring utilities.
 *
 * Weights are intentionally grouped in one constant so they are easy to adjust.
 */

/** Point values awarded per activity type. */
export const ACTIVITY_WEIGHTS = {
  post: 3,
  comment: 2,
  reaction: 1,
} as const;

export interface TypeCounts {
  post: number;
  comment: number;
  reaction: number;
}

/**
 * Compute a weighted quality score from activity type counts.
 *  - post    = 3 pts  (original, high-effort content)
 *  - comment = 2 pts  (thoughtful engagement)
 *  - reaction= 1 pt   (quick acknowledgement)
 */
export function computeQualityScore(typeCounts: TypeCounts): number {
  return (
    typeCounts.post * ACTIVITY_WEIGHTS.post +
    typeCounts.comment * ACTIVITY_WEIGHTS.comment +
    typeCounts.reaction * ACTIVITY_WEIGHTS.reaction
  );
}
