export interface AuditEvent {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  actor: string;
}

const AUDIT_LOG_KEY = "linkedin_tracker_audit_log";

/** Maximum number of audit events retained in localStorage. */
const MAX_AUDIT_LOG_ENTRIES = 200;

const SEED_EVENTS: AuditEvent[] = [
  {
    id: "seed-1",
    action: "privacy_change",
    detail: "Anonymous mode enabled",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    actor: "You",
  },
  {
    id: "seed-2",
    action: "goal_change",
    detail: "Weekly goal changed to 10",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    actor: "You",
  },
  {
    id: "seed-3",
    action: "role_change",
    detail: "Role set to member",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actor: "You",
  },
];

export function getAuditLog(): AuditEvent[] {
  if (typeof window === "undefined") return SEED_EVENTS;
  const data = localStorage.getItem(AUDIT_LOG_KEY);
  if (data) return JSON.parse(data) as AuditEvent[];
  // First visit: seed with mock events
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(SEED_EVENTS));
  return SEED_EVENTS;
}

export function addAuditEvent(action: string, detail: string, actor = "You"): void {
  if (typeof window === "undefined") return;
  const events = getAuditLog();
  const event: AuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    action,
    detail,
    timestamp: new Date().toISOString(),
    actor,
  };
  events.unshift(event);
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(events.slice(0, MAX_AUDIT_LOG_ENTRIES)));
}
