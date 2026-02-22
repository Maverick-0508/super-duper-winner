"use client";

interface TypeCounts {
  post: number;
  comment: number;
  reaction: number;
}

interface ContentMixCardProps {
  typeCounts: TypeCounts;
}

const TYPE_CONFIG = [
  { key: "post" as const, label: "Posts", emoji: "📝", color: "bg-blue-500" },
  { key: "comment" as const, label: "Comments", emoji: "💬", color: "bg-purple-500" },
  { key: "reaction" as const, label: "Reactions", emoji: "👍", color: "bg-amber-500" },
];

export default function ContentMixCard({ typeCounts }: ContentMixCardProps) {
  const total = typeCounts.post + typeCounts.comment + typeCounts.reaction;

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
        Content Mix
      </h3>
      {total === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No activities logged yet. Start posting to see your content breakdown.
        </p>
      ) : (
        <div className="space-y-2">
          {TYPE_CONFIG.map(({ key, label, emoji, color }) => {
            const count = typeCounts[key];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {emoji} {label}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
