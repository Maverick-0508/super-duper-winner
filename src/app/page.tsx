"use client";

import { useEffect, useState } from "react";

interface DailyActivity {
  day: string;
  count: number;
}

export default function Home() {
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const data = await response.json();
        setActivity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            LinkedIn Activity Dashboard (MVP)
          </h1>
          
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Note:</strong> Data is stored only in memory and will be cleared on server restart.
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading activity...</p>
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
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Daily Activity (Last 60 Days)
              </h2>
              
              {activity.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 py-8 text-center">
                  No activity recorded yet. Start by posting events to the API!
                </p>
              ) : (
                <div className="space-y-2">
                  {activity.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
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
    </div>
  );
}
