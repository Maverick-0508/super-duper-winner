"use client";

interface PersonalBestAlertProps {
  newBestTotal: boolean;
  newBestScore: boolean;
  weeklyTotal: number;
  weeklyScore: number;
  onDismiss: () => void;
}

export default function PersonalBestAlert({
  newBestTotal,
  newBestScore,
  weeklyTotal,
  weeklyScore,
  onDismiss,
}: PersonalBestAlertProps) {
  if (!newBestTotal && !newBestScore) return null;

  const items: string[] = [];
  if (newBestTotal) items.push(`Weekly total: ${weeklyTotal} activities`);
  if (newBestScore) items.push(`Quality score: ${weeklyScore} pts`);

  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg mb-6">
      <span className="text-2xl leading-none select-none" aria-hidden>🏆</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
          New personal best{items.length > 1 ? "s" : ""} this week!
        </p>
        <ul className="mt-0.5 text-xs text-amber-700 dark:text-amber-300 list-disc list-inside">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200 transition-colors flex-shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
