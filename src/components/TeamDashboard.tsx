"use client";

import { MOCK_TEAM, type TeamMember } from "@/lib/teamData";
import { type PrivacySettings } from "@/lib/privacy";

interface TeamDashboardProps {
  privacy: PrivacySettings;
  /** The ID of the currently logged-in user; used to preserve their name in anonymous mode. */
  currentUserId?: string;
}

function medalEmoji(rank: number): string {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `${rank + 1}.`;
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full bg-[var(--accent,#0ea5e9)] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function TeamDashboard({ privacy, currentUserId = "you" }: TeamDashboardProps) {
  const displayName = (member: TeamMember) =>
    privacy.anonymousMode && member.id !== currentUserId ? "Anonymous" : member.name;

  // Leaderboard sorted by weekly total desc
  const leaderboard = [...MOCK_TEAM].sort((a, b) => b.weeklyTotal - a.weeklyTotal);
  const maxWeekly = leaderboard[0]?.weeklyTotal ?? 1;

  // Aggregate totals
  const teamWeeklyTotal = MOCK_TEAM.reduce((s, m) => s + m.weeklyTotal, 0);
  const teamAvgScore = Math.round(MOCK_TEAM.reduce((s, m) => s + m.qualityScore, 0) / MOCK_TEAM.length);

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{MOCK_TEAM.length}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Team Members</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{teamWeeklyTotal}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Team Activities This Week</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{teamAvgScore}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Avg Quality Score</div>
        </div>
      </div>

      {/* Weekly Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          🏆 Weekly Leaderboard
        </h3>
        <div className="space-y-2">
          {leaderboard.map((member, idx) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
            >
              <span className="text-xl w-8 text-center flex-shrink-0">
                {medalEmoji(idx)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                    {displayName(member)}
                  </span>
                  <span className="ml-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                    {member.weeklyTotal} acts
                  </span>
                </div>
                <MiniBar value={member.weeklyTotal} max={maxWeekly} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member List with totals */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          👥 Member Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600">
                <th className="pb-2 pr-4 font-medium">Member</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 pr-4 font-medium text-right">This Week</th>
                <th className="pb-2 pr-4 font-medium text-right">Total</th>
                <th className="pb-2 pr-4 font-medium text-right">Streak 🔥</th>
                <th className="pb-2 font-medium text-right">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {MOCK_TEAM.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">
                    {displayName(member)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 capitalize">
                    {member.role}
                  </td>
                  <td className="py-2 pr-4 text-right text-zinc-700 dark:text-zinc-300">
                    {member.weeklyTotal}
                  </td>
                  <td className="py-2 pr-4 text-right text-zinc-700 dark:text-zinc-300">
                    {member.totalActivities}
                  </td>
                  <td className="py-2 pr-4 text-right text-orange-600 dark:text-orange-400">
                    {member.currentStreak}
                  </td>
                  <td className="py-2 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                    {member.qualityScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
        * Team data is mocked for demo purposes. Connect a multi-user backend to replace.
      </p>
    </div>
  );
}
