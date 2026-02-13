/**
 * In-memory event store for MVP only.
 * WARNING: All data will be lost on server restart!
 */

export type EventType = "post" | "comment" | "reaction";
export type EventSource = "linkedin";

export interface Event {
  userId: string;
  type: EventType;
  timestamp: string; // ISO string
  source: EventSource;
}

// In-memory storage (MVP only - no persistence)
const events: Event[] = [];

/**
 * Add a new event to the store.
 * Returns true if the event was added, false if it was a duplicate.
 * 
 * Duplicate criteria:
 * - Same userId
 * - Same type
 * - Same source
 * - Same calendar day (YYYY-MM-DD)
 */
export function addEvent(event: Event): boolean {
  // Normalize timestamp to ISO format
  const normalizedTimestamp = new Date(event.timestamp).toISOString();
  
  // Extract day key (YYYY-MM-DD) from timestamp
  const dayKey = normalizedTimestamp.split('T')[0];
  
  // Check for duplicate: same userId, type, source, and day
  const isDuplicate = events.some((existingEvent) => {
    if (existingEvent.userId !== event.userId) return false;
    if (existingEvent.type !== event.type) return false;
    if (existingEvent.source !== event.source) return false;
    
    const existingDayKey = existingEvent.timestamp.split('T')[0];
    return existingDayKey === dayKey;
  });
  
  if (isDuplicate) {
    return false; // Duplicate found, do not add
  }
  
  // Not a duplicate, add the event with normalized timestamp
  events.push({
    ...event,
    timestamp: normalizedTimestamp,
  });
  
  return true; // Successfully added
}

/**
 * Query events for a specific user within a date range
 */
export function getEvents(
  userId: string,
  fromDate?: Date,
  toDate?: Date,
  eventType?: EventType
): Event[] {
  return events.filter((event) => {
    if (event.userId !== userId) return false;
    
    const eventDate = new Date(event.timestamp);
    
    if (fromDate && eventDate < fromDate) return false;
    if (toDate && eventDate > toDate) return false;
    if (eventType && event.type !== eventType) return false;
    
    return true;
  });
}

/**
 * Get all events (for debugging/testing)
 */
export function getAllEvents(): Event[] {
  return [...events];
}

/**
 * Clear all events (for testing)
 */
export function clearEvents(): void {
  events.length = 0;
}
