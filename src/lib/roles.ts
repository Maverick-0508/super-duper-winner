export type Role = "admin" | "manager" | "member";

const ROLE_KEY = "linkedin_tracker_role";

export function getRole(): Role {
  if (typeof window === "undefined") return "member";
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored === "admin" || stored === "manager" || stored === "member") return stored;
  return "member";
}

export function setRole(role: Role): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
}

export function canViewTeamAnalytics(role: Role): boolean {
  return role === "admin" || role === "manager";
}

export function canViewPrivacyControls(role: Role): boolean {
  return role === "admin";
}

export function canViewAuditLog(role: Role): boolean {
  return role === "admin";
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
};
