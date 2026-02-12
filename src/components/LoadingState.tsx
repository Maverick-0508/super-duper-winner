"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-12 w-12 border-b-2",
    lg: "h-16 w-16 border-b-2",
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-zinc-900 dark:border-zinc-50 ${sizeClasses[size]} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-md animate-pulse"
        >
          <div className="h-4 bg-zinc-200 dark:bg-zinc-600 rounded w-1/4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-600 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
}

export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

export function GraphLoadingPlaceholder() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-zinc-100 dark:bg-zinc-700 rounded flex items-end justify-around p-4 space-x-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-200 dark:bg-zinc-600 rounded-t"
              style={{
                width: "12%",
                height: `${Math.random() * 60 + 40}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
