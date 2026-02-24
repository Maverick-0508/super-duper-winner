export interface PrivacySettings {
  dataSharing: boolean;
  anonymousMode: boolean;
  exportPermissions: boolean;
}

const PRIVACY_KEY = "linkedin_tracker_privacy";

const DEFAULT_SETTINGS: PrivacySettings = {
  dataSharing: false,
  anonymousMode: false,
  exportPermissions: true,
};

export function getPrivacySettings(): PrivacySettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  const data = localStorage.getItem(PRIVACY_KEY);
  if (!data) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    console.warn("Failed to parse privacy settings from localStorage; using defaults.");
    return { ...DEFAULT_SETTINGS };
  }
}

export function savePrivacySettings(settings: PrivacySettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRIVACY_KEY, JSON.stringify(settings));
}
