"use client";

import { useMemo } from "react";

interface Recommendation {
  id: string;
  type: "frequency" | "engagement" | "network" | "streak" | "achievement" | "timing";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  progress?: number; // 0-100
  action?: string;
  actionType?: "log-post" | "log-comment" | "log-reaction" | "view-analytics" | "external";
}

interface RecommendationsCardProps {
  activityCount?: number;
  lastActivityDate?: string;
  onAction?: (actionType: string, recommendation: Recommendation) => void;
}

function generateRecommendations(
  activityCount: number,
  lastActivityDate?: string
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Posting frequency suggestions
  if (activityCount < 5) {
    recommendations.push({
      id: "freq-1",
      type: "frequency",
      title: "Increase Posting Frequency",
      description: "Post at least 3 times this week to boost your LinkedIn presence",
      priority: "high",
      progress: (activityCount / 5) * 100,
      action: "Log a Post",
      actionType: "log-post",
    });
  } else if (activityCount >= 5 && activityCount < 20) {
    recommendations.push({
      id: "freq-2",
      type: "frequency",
      title: "Great Progress!",
      description: "You're building momentum. Try to post 5 times this week.",
      priority: "medium",
      progress: (activityCount / 20) * 100,
      action: "Log a Post",
      actionType: "log-post",
    });
  }

  // Engagement tips
  if (activityCount > 0) {
    recommendations.push({
      id: "engage-1",
      type: "engagement",
      title: "Engage with Others",
      description: "Comment on 3 posts today to increase visibility and build relationships",
      priority: "high",
      progress: 0,
      action: "Log a Comment",
      actionType: "log-comment",
    });
  }

  // Network growth advice
  recommendations.push({
    id: "network-1",
    type: "network",
    title: "Grow Your Network",
    description: "React to posts in your industry to stay visible and attract connections",
    priority: "medium",
    progress: 0,
    action: "Log a Reaction",
    actionType: "log-reaction",
  });

  // Streak maintenance alerts
  if (lastActivityDate) {
    const lastDate = new Date(lastActivityDate);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) {
      recommendations.push({
        id: "streak-1",
        type: "streak",
        title: "Keep Your Streak Alive! 🔥",
        description: "You posted today! Come back tomorrow to maintain your streak.",
        priority: "low",
        progress: 100,
      });
    } else if (daysSince === 1) {
      recommendations.push({
        id: "streak-2",
        type: "streak",
        title: "Don't Break Your Streak!",
        description: "You haven't posted yet today. Log an activity to keep your streak going!",
        priority: "high",
        progress: 50,
        action: "Log Activity",
        actionType: "log-post",
      });
    } else if (daysSince > 1) {
      recommendations.push({
        id: "streak-3",
        type: "streak",
        title: "Start a New Streak",
        description: `It's been ${daysSince} days since your last activity. Start fresh today!`,
        priority: "high",
        progress: 0,
        action: "Log Activity",
        actionType: "log-post",
      });
    }
  }

  // Achievement proximity notifications
  if (activityCount === 8 || activityCount === 9) {
    recommendations.push({
      id: "achieve-1",
      type: "achievement",
      title: "Almost There! 🏆",
      description: `Only ${10 - activityCount} more ${activityCount === 9 ? 'activity' : 'activities'} until you unlock the "Getting Started" achievement!`,
      priority: "high",
      progress: (activityCount / 10) * 100,
      action: "Log Activity",
      actionType: "log-post",
    });
  }

  // Best posting time insights
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 11) {
    recommendations.push({
      id: "timing-1",
      type: "timing",
      title: "Prime Time to Post! ⏰",
      description: "9-11 AM is peak engagement time. Post now for maximum visibility!",
      priority: "medium",
      progress: 0,
      action: "Log a Post Now",
      actionType: "log-post",
    });
  } else if (hour >= 13 && hour <= 15) {
    recommendations.push({
      id: "timing-2",
      type: "timing",
      title: "Good Time to Post",
      description: "1-3 PM is a good time for engagement. Consider posting an update!",
      priority: "low",
      progress: 0,
      action: "Log a Post",
      actionType: "log-post",
    });
  }

  // Open LinkedIn reminder
  recommendations.push({
    id: "linkedin-1",
    type: "engagement",
    title: "Visit LinkedIn",
    description: "Open LinkedIn to discover new content and engage with your network",
    priority: "low",
    progress: 0,
    action: "Open LinkedIn",
    actionType: "external",
  });

  return recommendations;
}

export default function RecommendationsCard({
  activityCount = 0,
  lastActivityDate,
  onAction,
}: RecommendationsCardProps) {
  // Use useMemo to compute recommendations based on props
  const recommendations = useMemo(
    () => generateRecommendations(activityCount, lastActivityDate),
    [activityCount, lastActivityDate]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
      case "low":
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-full font-medium">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full font-medium">
            Low Priority
          </span>
        );
    }
  };

  const handleAction = (recommendation: Recommendation) => {
    if (recommendation.actionType === "external") {
      window.open("https://www.linkedin.com", "_blank");
    } else if (onAction && recommendation.actionType) {
      onAction(recommendation.actionType, recommendation);
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          💡 Smart Recommendations
        </h2>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Based on your activity
        </span>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Personalized insights to help you maximize your LinkedIn engagement
      </p>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {rec.title}
              </h3>
              {getPriorityBadge(rec.priority)}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              {rec.description}
            </p>

            {rec.progress !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Progress
                  </span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {Math.round(rec.progress)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${rec.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {rec.action && (
              <button
                onClick={() => handleAction(rec)}
                className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                {rec.action}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
