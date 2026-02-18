"use client";

import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import OnboardingGuide from "@/components/OnboardingGuide";
import RecommendationsCard from "@/components/RecommendationsCard";
import EmptyState from "@/components/EmptyState";
import { Spinner, SkeletonList } from "@/components/LoadingState";
import LogActivityModal from "@/components/LogActivityModal";
import ActivityHeatmap from "@/components/ActivityHeatmap";

interface DailyActivity {
  day: string;
  count: number;
}

interface ActivityResponse {
  daily: DailyActivity[];
  currentStreak: number;
}

function DashboardContent() {
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledType, setPrefilledType] = useState<"post" | "comment" | "reaction" | "">("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY;
        if (!apiKey) {
          throw new Error("NEXT_PUBLIC_DEMO_API_KEY not configured");
        }

        // Fetch activity for the last 60 days
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 60);

        const fromStr = fromDate.toISOString().split("T")[0];
        const toStr = toDate.toISOString().split("T")[0];

        const response = await fetch(
          `/api/activity/daily?apiKey=${encodeURIComponent(
            apiKey
          )}&from=${fromStr}&to=${toStr}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch activity");
        }

        const data: ActivityResponse = await response.json();
        setActivity(data.daily);
        setCurrentStreak(data.currentStreak);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [refreshKey]);

  // Calculate stats for recommendations
  const totalActivities = activity.reduce((sum, item) => sum + item.count, 0);
  const lastActivityDate = activity.length > 0 ? activity[activity.length - 1].day : undefined;

  const handleRecommendationAction = (actionType: string) => {
    const typeMap: { [key: string]: "post" | "comment" | "reaction" } = {
      "log-post": "post",
      "log-comment": "comment",
      "log-reaction": "reaction",
    };

    if (actionType in typeMap) {
      setPrefilledType(typeMap[actionType]);
      setIsModalOpen(true);
    }
  };

  const handleLogActivity = async (type: string, timestamp: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY;
      if (!apiKey) {
        alert("API key not configured");
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          type,
          timestamp,
          source: "linkedin",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log activity");
      }

      // Refresh activity data
      setRefreshKey((prev) => prev + 1);
      alert("Activity logged successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to log activity");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        {/* Onboarding Guide */}
        <OnboardingGuide />

        {/* Header with Quick Actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              LinkedIn Activity Dashboard
            </h1>
            <div className="flex gap-2">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm"
                title="Open LinkedIn in a new tab"
              >
                Open LinkedIn →
              </a>
              <button
                onClick={() => {
                  setPrefilledType("");
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors text-sm"
                title="Log a new activity"
              >
                + Log Activity
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Note:</strong> Data is stored only in memory and will be cleared on server restart.
            </p>
          </div>

          {/* Stats Summary */}
          {!loading && !error && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {totalActivities}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total Activities
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {activity.length}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Active Days
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {activity.length > 0 ? (totalActivities / activity.length).toFixed(1) : 0}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Avg per Day
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Current Streak 🔥
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Heatmap */}
        {!loading && !error && activity.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-6">
            <ActivityHeatmap activity={activity} />
          </div>
        )}

        {/* Smart Recommendations */}
        {!loading && !error && (
          <RecommendationsCard
            activityCount={totalActivities}
            lastActivityDate={lastActivityDate}
            onAction={handleRecommendationAction}
          />
        )}

        {/* Activity List */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Daily Activity (Last 60 Days)
          </h2>

          {loading && (
            <div>
              <div className="text-center py-6 mb-4">
                <Spinner />
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading activity...</p>
              </div>
              <SkeletonList count={5} />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <div>
              {activity.length === 0 ? (
                <EmptyState
                  type="activity"
                  onAction={() => {
                    setPrefilledType("");
                    setIsModalOpen(true);
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {activity.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                      title={`${item.count} ${item.count === 1 ? "activity" : "activities"} on ${item.day}`}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {item.day}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {item.count} {item.count === 1 ? "event" : "events"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Log Activity Modal - key prop ensures fresh state when opening with different prefilled types */}
      <LogActivityModal
        key={isModalOpen ? `modal-${prefilledType}` : "modal-closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLogActivity}
        prefilledType={prefilledType}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
