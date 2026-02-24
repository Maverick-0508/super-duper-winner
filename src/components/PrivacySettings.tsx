"use client";

import { useState } from "react";
import { savePrivacySettings, type PrivacySettings } from "@/lib/privacy";
import { addAuditEvent } from "@/lib/auditLog";

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-zinc-100 dark:border-zinc-700 last:border-0">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-zinc-900 dark:text-zinc-50 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent,#0ea5e9)] ${
          checked ? "bg-[var(--accent,#0ea5e9)]" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const SETTING_LABELS: Record<keyof PrivacySettings, string> = {
  dataSharing: "Data Sharing",
  anonymousMode: "Anonymous Mode",
  exportPermissions: "Export Permissions",
};

export default function PrivacySettingsPanel({ settings, onSettingsChange }: PrivacySettingsProps) {
  const [saved, setSaved] = useState(false);

  function updateSetting<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
    const next = { ...settings, [key]: value };
    onSettingsChange(next);
    savePrivacySettings(next);
    addAuditEvent("privacy_change", `${SETTING_LABELS[key]} ${value ? "enabled" : "disabled"}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {saved && (
        <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-xs text-green-800 dark:text-green-300">
          ✓ Settings saved
        </div>
      )}
      <div>
        <ToggleRow
          id="privacy-data-sharing"
          label="Data Sharing"
          description="Allow aggregated activity data to be shared with team analytics."
          checked={settings.dataSharing}
          onChange={(v) => updateSetting("dataSharing", v)}
        />
        <ToggleRow
          id="privacy-anonymous-mode"
          label="Anonymous Mode"
          description="Hide your real name in team views and leaderboards."
          checked={settings.anonymousMode}
          onChange={(v) => updateSetting("anonymousMode", v)}
        />
        <ToggleRow
          id="privacy-export-permissions"
          label="Export Permissions"
          description="Allow admins to include your data in exported reports."
          checked={settings.exportPermissions}
          onChange={(v) => updateSetting("exportPermissions", v)}
        />
      </div>
    </div>
  );
}
