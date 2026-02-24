"use client";

import { useState } from "react";
import { getAuditLog, type AuditEvent } from "@/lib/auditLog";

const ACTION_ICONS: Record<string, string> = {
  role_change: "👤",
  privacy_change: "🔒",
  goal_change: "🎯",
  activity_logged: "✅",
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>(() => getAuditLog());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {events.length} event{events.length !== 1 ? "s" : ""} recorded
        </p>
        <button
          onClick={() => setEvents(getAuditLog())}
          className="text-xs px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">
          No audit events yet.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg text-sm"
            >
              <span className="text-lg flex-shrink-0" aria-hidden>
                {ACTION_ICONS[event.action] ?? "📋"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-900 dark:text-zinc-50 font-medium">{event.detail}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                  {event.actor} · {formatTimestamp(event.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
