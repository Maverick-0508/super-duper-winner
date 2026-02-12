"use client";

import { useState, useEffect } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const ONBOARDING_KEY = "linkedin_tracker_onboarding_complete";

function getInitialVisibility() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(ONBOARDING_KEY);
}

function getInitialSteps() {
  const hasApiKey = !!process.env.NEXT_PUBLIC_DEMO_API_KEY;
  return [
    {
      id: "connect",
      title: "Connect LinkedIn Account",
      description: "Set up your API key to start tracking activity",
      completed: hasApiKey,
    },
    {
      id: "first-activity",
      title: "Log First Activity",
      description: "Record your first post, comment, or reaction",
      completed: false,
    },
    {
      id: "auto-sync",
      title: "Configure Auto-Sync",
      description: "Enable automatic activity tracking (optional)",
      completed: false,
    },
    {
      id: "explore",
      title: "Explore Analytics",
      description: "Check out your activity dashboard and insights",
      completed: false,
    },
    {
      id: "achievement",
      title: "Earn First Achievement",
      description: "Complete activities to unlock achievements",
      completed: false,
    },
  ];
}

export default function OnboardingGuide() {
  const [isVisible, setIsVisible] = useState(getInitialVisibility);
  const [steps, setSteps] = useState<OnboardingStep[]>(getInitialSteps);

  useEffect(() => {
    // No state updates needed in this effect
  }, []);

  const handleStepComplete = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
  };

  const allCompleted = steps.every((step) => step.completed);

  useEffect(() => {
    if (allCompleted && isVisible) {
      // Auto-dismiss when all steps are complete
      setTimeout(() => {
        handleComplete();
      }, 2000);
    }
  }, [allCompleted, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            Welcome to LinkedIn Activity Tracker! 👋
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Let&apos;s get you set up in just a few steps
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xl"
          aria-label="Dismiss onboarding"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
              step.completed
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                step.completed
                  ? "bg-green-500 text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {step.completed ? "✓" : index + 1}
            </div>
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  step.completed
                    ? "text-green-900 dark:text-green-100 line-through"
                    : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
            {!step.completed && (
              <button
                onClick={() => handleStepComplete(step.id)}
                className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Mark Done
              </button>
            )}
          </div>
        ))}
      </div>

      {allCompleted && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-md text-center">
          <p className="text-green-800 dark:text-green-200 font-medium">
            🎉 Great job! You&apos;re all set up. This guide will auto-dismiss in a moment.
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleComplete}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
        >
          I&apos;ll do this later
        </button>
      </div>
    </div>
  );
}
