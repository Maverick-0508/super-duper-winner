"use client";

interface EmptyStateProps {
  type?: "activity" | "recommendations" | "achievements" | "general";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = "general",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const configs = {
    activity: {
      icon: "📊",
      title: "No activity yet",
      description:
        "Start tracking your LinkedIn activity by logging your first post, comment, or reaction!",
      actionLabel: "Log Activity",
    },
    recommendations: {
      icon: "💡",
      title: "No recommendations yet",
      description:
        "Keep logging your activity and we'll provide personalized insights to help you grow!",
      actionLabel: "Log Activity",
    },
    achievements: {
      icon: "🏆",
      title: "No achievements unlocked",
      description:
        "Complete activities to unlock achievements and track your LinkedIn journey!",
      actionLabel: "View Achievements",
    },
    general: {
      icon: "📭",
      title: "Nothing here yet",
      description: "Get started by adding some content!",
      actionLabel: "Get Started",
    },
  };

  const config = configs[type];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{config.icon}</div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
        {displayTitle}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
        {displayDescription}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          {displayActionLabel}
        </button>
      )}
    </div>
  );
}
