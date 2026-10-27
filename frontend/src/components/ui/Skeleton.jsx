import React from 'react';

export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return (
    <div
      className={`skeleton bg-gray-200 dark:bg-dark-surface ${rounded} ${className}`}
    />
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card p-5 space-y-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14" rounded="rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-light-border dark:border-dark-border">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-20" rounded="rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-light-border dark:divide-dark-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card p-5 flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
          <Skeleton className="w-12 h-12" rounded="rounded-xl" />
        </div>
      ))}
    </div>
  );
}
