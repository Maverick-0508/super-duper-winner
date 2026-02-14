/**
 * Simple in-memory rate limiting utilities for LinkedIn API integrations.
 * This is for MVP - tracks rate limits in memory (resets on server restart).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in milliseconds
}

// In-memory rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a user has exceeded their rate limit.
 * 
 * @param userId - The user ID to check
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (e.g., 3600000 for 1 hour)
 * @returns Object with allowed flag and remaining count
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${userId}:${maxRequests}:${windowMs}`;
  
  let entry = rateLimitStore.get(key);
  
  // If no entry exists or the window has expired, create a new one
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit has been exceeded
  const allowed = entry.count < maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Increment the rate limit counter for a user.
 * Should be called after a successful request.
 * 
 * @param userId - The user ID to increment
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function incrementRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): void {
  const now = Date.now();
  const key = `${userId}:${maxRequests}:${windowMs}`;
  
  let entry = rateLimitStore.get(key);
  
  // If no entry exists or the window has expired, create a new one
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
  } else {
    entry.count++;
  }
  
  rateLimitStore.set(key, entry);
}

/**
 * Reset rate limit for a user (useful for testing or admin operations)
 */
export function resetRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): void {
  const key = `${userId}:${maxRequests}:${windowMs}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a user
 */
export function getRateLimitStatus(
  userId: string,
  maxRequests: number,
  windowMs: number
): { count: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${userId}:${maxRequests}:${windowMs}`;
  
  const entry = rateLimitStore.get(key);
  
  // If no entry or expired, return fresh state
  if (!entry || now >= entry.resetAt) {
    return {
      count: 0,
      remaining: maxRequests,
      resetAt: now + windowMs,
    };
  }
  
  return {
    count: entry.count,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
