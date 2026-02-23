"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import OnboardingGuide from "@/components/OnboardingGuide";
import RecommendationsCard from "@/components/RecommendationsCard";
import EmptyState from "@/components/EmptyState";
import { Spinner, SkeletonList } from "@/components/LoadingState";
import LogActivityModal from "@/components/LogActivityModal";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import WeeklySummaryCards from "@/components/WeeklySummaryCards";
import ContentMixCard from "@/components/ContentMixCard";
import StreakCard from "@/components/StreakCard";
import GoalCard from "@/components/GoalCard";
import DailyChecklist from "@/components/DailyChecklist";
import MilestoneBadges from "@/components/MilestoneBadges";
import QualityScoreCard from "@/components/QualityScoreCard";
import PersonalBestAlert from "@/components/PersonalBestAlert";
import { getThisWeekTotal } from "@/lib/analytics";
import { computeQualityScore } from "@/lib/scoring";
import { checkAndUpdatePersonalBests, getPersonalBests } from "@/lib/baselines";

interface DailyActivity {
  day: string;
  count: number;
}

interface TypeCounts {
  post: number;
  comment: number;
  reaction: number;
}

interface ActivityResponse {
  daily: DailyActivity[];
  currentStreak: number;
  longestStreak: number;
  periodTypeCounts: TypeCounts;
  todayTypeCounts: TypeCounts;
  weeklyTypeCounts?: TypeCounts;
}

function DashboardContent() {
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [periodTypeCounts, setPeriodTypeCounts] = useState<TypeCounts>({ post: 0, comment: 0, reaction: 0 });
  const [todayTypeCounts, setTodayTypeCounts] = useState<TypeCounts>({ post: 0, comment: 0, reaction: 0 });
  const [weeklyTypeCounts, setWeeklyTypeCounts] = useState<TypeCounts>({ post: 0, comment: 0, reaction: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledType, setPrefilledType] = useState<"post" | "comment" | "reaction" | "">("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [accentNeon, setAccentNeon] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(5);

  // Personal best alert state
  const [pbAlert, setPbAlert] = useState<{
    newBestTotal: boolean;
    newBestScore: boolean;
    weeklyTotal: number;
    weeklyScore: number;
  } | null>(null);
  const pbCheckedRef = useRef(false);

  // Sync accent attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accentNeon ? "neon" : "default");
  }, [accentNeon]);

  // Read weeklyGoal from localStorage so DailyChecklist nudge stays in sync
  useEffect(() => {
    const stored = localStorage.getItem("linkedin_tracker_weekly_goal");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) setWeeklyGoal(parsed);
    }
  }, []);

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
          `/api/activity/daily?apiKey=${encodeURIComponent(apiKey)}&from=${fromStr}&to=${toStr}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch activity");
        }

        const data: ActivityResponse = await response.json();
        setActivity(data.daily);
        setCurrentStreak(data.currentStreak);
        setLongestStreak(data.longestStreak ?? 0);
        setPeriodTypeCounts(data.periodTypeCounts ?? { post: 0, comment: 0, reaction: 0 });
        setTodayTypeCounts(data.todayTypeCounts ?? { post: 0, comment: 0, reaction: 0 });
        const wCounts = data.weeklyTypeCounts ?? { post: 0, comment: 0, reaction: 0 };
        setWeeklyTypeCounts(wCounts);

        // Personal-best check (run once per session after first load)
        if (!pbCheckedRef.current) {
          pbCheckedRef.current = true;
          const wTotal = getThisWeekTotal(data.daily);
          const wScore = computeQualityScore(wCounts);
          const result = checkAndUpdatePersonalBests(wTotal, wScore);
          if (result.newBestTotal || result.newBestScore) {
            setPbAlert({
              newBestTotal: result.newBestTotal,
              newBestScore: result.newBestScore,
              weeklyTotal: wTotal,
              weeklyScore: wScore,
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [refreshKey]);

  // Calculate stats
  const totalActivities = activity.reduce((sum, item) => sum + item.count, 0);
  const lastActivityDate = activity.length > 0 ? activity[activity.length - 1].day : undefined;
  const thisWeekTotal = getThisWeekTotal(activity);
  const personalBests = getPersonalBests();

  const openModal = useCallback((type: "post" | "comment" | "reaction" | "" = "") => {
    setPrefilledType(type);
    setIsModalOpen(true);
  }, []);

  const handleRecommendationAction = (actionType: string) => {
    const typeMap: { [key: string]: "post" | "comment" | "reaction" } = {
      "log-post": "post",
      "log-comment": "comment",
      "log-reaction": "reaction",
    };
    if (actionType in typeMap) {
      openModal(typeMap[actionType]);
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
        body: JSON.stringify({ apiKey, type, timestamp, source: "linkedin" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log activity");
      }

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

        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              LinkedIn Activity Dashboard
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAccentNeon((v) => !v)}
                className="px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title={accentNeon ? "Switch to default theme" : "Switch to neon accent"}
              >
                {accentNeon ? "🎨 Default" : "⚡ Neon"}
              </button>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm"
              >
                Open LinkedIn →
              </a>
              <button
                onClick={() => openModal("")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors text-sm"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{totalActivities}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Activities</div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{activity.length}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Active Days</div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {activity.length > 0 ? (totalActivities / activity.length).toFixed(1) : 0}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Avg per Day</div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Current Streak 🔥</div>
              </div>
            </div>
          )}

          {/* Weekly / Monthly summary */}
          {!loading && !error && activity.length > 0 && (
            <WeeklySummaryCards daily={activity} />
          )}
        </div>

        {/* Personal Best Alert */}
        {pbAlert && (
          <PersonalBestAlert
            newBestTotal={pbAlert.newBestTotal}
            newBestScore={pbAlert.newBestScore}
            weeklyTotal={pbAlert.weeklyTotal}
            weeklyScore={pbAlert.weeklyScore}
            onDismiss={() => setPbAlert(null)}
          />
        )}

        {/* Analytics: Quality Score + Content Mix + Streak */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <QualityScoreCard
                typeCounts={weeklyTypeCounts}
                label="This Week"
                personalBest={personalBests.weeklyScore}
                isNewBest={pbAlert?.newBestScore ?? false}
              />
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <ContentMixCard typeCounts={periodTypeCounts} />
            </div>
          </div>
        )}

        {/* Streak */}
        {!loading && !error && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
            <StreakCard
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              daily={activity}
              onRecoverStreak={() => openModal("")}
            />
          </div>
        )}

        {/* Habits: Goal + Daily Checklist */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <GoalCard daily={activity} />
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <DailyChecklist
                todayTypeCounts={todayTypeCounts}
                currentStreak={currentStreak}
                weeklyGoal={weeklyGoal}
                thisWeekTotal={thisWeekTotal}
                onLogActivity={(type) => openModal(type)}
              />
            </div>
          </div>
        )}

        {/* Milestone Badges */}
        {!loading && !error && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
            <MilestoneBadges
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              totalActivities={totalActivities}
              activeDays={activity.length}
            />
          </div>
        )}

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
                <EmptyState type="activity" onAction={() => openModal("")} />
              ) : (
                <div className="space-y-2">
                  {activity.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                      title={`${item.count} ${item.count === 1 ? "activity" : "activities"} on ${item.day}`}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.day}</span>
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

      {/* Log Activity Modal */}
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
