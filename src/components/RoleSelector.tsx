"use client";

import { useState } from "react";
import { getRole, setRole, type Role, ROLE_LABELS } from "@/lib/roles";
import { addAuditEvent } from "@/lib/auditLog";

interface RoleSelectorProps {
  onRoleChange?: (role: Role) => void;
}

export default function RoleSelector({ onRoleChange }: RoleSelectorProps) {
  const [role, setRoleState] = useState<Role>(() => getRole());

  function handleChange(newRole: Role) {
    addAuditEvent("role_change", `Role changed from ${ROLE_LABELS[role]} to ${ROLE_LABELS[newRole]}`);
    setRole(newRole);
    setRoleState(newRole);
    onRoleChange?.(newRole);
  }

  const badgeColors: Record<Role, string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    member: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColors[role]}`}>
        {ROLE_LABELS[role]}
      </span>
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as Role)}
        className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
        aria-label="Select role"
        title="Switch role (demo only)"
      >
        <option value="member">Member</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}
