/**
 * In-memory event store for MVP only.
 * WARNING: All data will be lost on server restart!
 */

export type EventType = "post" | "comment" | "reaction";
export type EventSource = "linkedin_api" | "extension" | "manual";

export interface Event {
  userId: string;
  type: EventType;
  timestamp: string; // ISO string
  source: EventSource;
  externalId?: string; // External ID from LinkedIn API
  reconciledWithExternalId?: string; // Set when manual event is reconciled with API event
}

interface InternalEvent extends Event {
  __dayKey: string; // Internal YYYY-MM-DD for quick day comparisons
}

// In-memory storage (MVP only - no persistence)
const events: InternalEvent[] = [];

/**
 * Helper to strip internal __dayKey from event
 */
function stripInternalFields(event: InternalEvent): Event {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __dayKey, ...cleanEvent } = event;
  return cleanEvent;
}

/**
 * Normalize and validate a timestamp to ISO format.
 * Throws an error if the timestamp is invalid.
 */
export function toIsoTimestamp(raw: string | Date): string {
  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${raw}`);
  }
  return date.toISOString();
}

/**
 * Extract YYYY-MM-DD from an ISO timestamp
 */
export function dayKeyFromTimestamp(timestamp: string): string {
  return timestamp.split('T')[0];
}

/**
 * Add a new event to the store.
 * Returns an object with stored and duplicate flags.
 * 
 * Duplicate criteria:
 * - For linkedin_api events: duplicate if same userId + source 'linkedin_api' + same externalId
 * - For manual/extension events: duplicate if same userId + source + type + calendar day (YYYY-MM-DD)
 */
export function addEvent(event: Event): { stored: boolean; duplicate: boolean } {
  // Normalize timestamp to ISO format
  let normalizedTimestamp: string;
  try {
    normalizedTimestamp = toIsoTimestamp(event.timestamp);
  } catch (error) {
    throw new Error(`Invalid timestamp in event: ${error}`);
  }
  
  // Extract day key (YYYY-MM-DD) from timestamp
  const dayKey = dayKeyFromTimestamp(normalizedTimestamp);
  
  // Check for duplicate based on event source
  let isDuplicate = false;
  
  if (event.source === 'linkedin_api' && event.externalId) {
    // For LinkedIn API events, check by externalId
    isDuplicate = events.some((existingEvent) => 
      existingEvent.userId === event.userId &&
      existingEvent.source === 'linkedin_api' &&
      existingEvent.externalId === event.externalId
    );
  } else {
    // For manual/extension events, check by userId + source + type + day
    isDuplicate = events.some((existingEvent) => {
      if (existingEvent.userId !== event.userId) return false;
      if (existingEvent.type !== event.type) return false;
      if (existingEvent.source !== event.source) return false;
      return existingEvent.__dayKey === dayKey;
    });
  }
  
  if (isDuplicate) {
    return { stored: false, duplicate: true }; // Duplicate found, do not add
  }
  
  // Not a duplicate, add the event with normalized timestamp and __dayKey
  const internalEvent: InternalEvent = {
    ...event,
    timestamp: normalizedTimestamp,
    __dayKey: dayKey,
  };
  events.push(internalEvent);
  
  return { stored: true, duplicate: false }; // Successfully added
}

/**
 * Query events for a specific user with optional filters
 */
export function getEventsForUser(options: {
  userId: string;
  from?: string; // ISO timestamp or YYYY-MM-DD
  to?: string; // ISO timestamp or YYYY-MM-DD
  type?: EventType;
  source?: EventSource;
}): Event[] {
  const { userId, from, to, type, source } = options;
  
  // Parse date range if provided
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;
  
  return events.filter((event) => {
    if (event.userId !== userId) return false;
    
    if (fromDate) {
      const eventDate = new Date(event.timestamp);
      if (eventDate < fromDate) return false;
    }
    
    if (toDate) {
      const eventDate = new Date(event.timestamp);
      if (eventDate > toDate) return false;
    }
    
    if (type && event.type !== type) return false;
    if (source && event.source !== source) return false;
    
    return true;
  }).map(stripInternalFields);
}

/**
 * Query events for a specific user within a date range (legacy function for backward compatibility)
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
  }).map(stripInternalFields);
}

/**
 * Reconcile manual events with API events by marking them as reconciled.
 * For each API event with an externalId, find matching manual events for the same day and type
 * and mark them as reconciledWithExternalId.
 */
export function reconcileManualEventsWithApi(
  userId: string,
  apiEvents: Event[]
): void {
  apiEvents.forEach((apiEvent) => {
    if (!apiEvent.externalId) return; // Skip API events without externalId
    
    const apiDayKey = dayKeyFromTimestamp(apiEvent.timestamp);
    
    // Find manual events for the same user, type, and day
    events.forEach((existingEvent) => {
      if (
        existingEvent.userId === userId &&
        (existingEvent.source === 'manual' || existingEvent.source === 'extension') &&
        existingEvent.type === apiEvent.type &&
        existingEvent.__dayKey === apiDayKey &&
        !existingEvent.reconciledWithExternalId // Don't reconcile already reconciled events
      ) {
        existingEvent.reconciledWithExternalId = apiEvent.externalId;
      }
    });
  });
}

/**
 * Get all events (for debugging/testing)
 */
export function getAllEvents(): Event[] {
  return events.map(stripInternalFields);
}

/**
 * Clear all events (for testing)
 */
export function clearEvents(): void {
  events.length = 0;
}
