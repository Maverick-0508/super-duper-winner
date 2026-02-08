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
 * Add a new event to the store
 */
export function addEvent(event: Event): void {
  events.push(event);
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
