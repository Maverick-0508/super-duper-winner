/**
 * Simple API key authentication for MVP.
 * Maps API keys to user IDs.
 */

/**
 * Validate API key and return associated user ID
 * Returns null if the API key is invalid or undefined
 */
export function getUserIdFromApiKey(apiKey: string | undefined): string | null {
  if (!apiKey) {
    return null;
  }
  
  const demoApiKey = process.env.DEMO_API_KEY;
  
  if (!demoApiKey) {
    console.warn("DEMO_API_KEY not configured in environment");
    return null;
  }
  
  if (apiKey === demoApiKey) {
    return "demo-user";
  }
  
  return null;
}
