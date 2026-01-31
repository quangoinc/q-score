"use client";

import { CSSProperties } from "react";

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-card/50 rounded ${className}`}
      style={style}
    />
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="animate-fade-in stagger-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-28 h-6" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-36 h-9 rounded-lg" />
          <Skeleton className="w-32 h-9 rounded-lg" />
        </div>
      </div>
      <div className="bg-card/30 border border-border rounded-xl p-6">
        <div className="h-56 flex items-end justify-around gap-4 pb-8">
          {[40, 65, 80, 55, 45].map((height, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton className="w-full rounded" style={{ height: `${height}%` }} />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-between">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <div className="animate-fade-in stagger-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-6" />
        </div>
        <Skeleton className="w-16 h-4" />
      </div>
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-4" />
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-20 h-5" />
            </div>
            <Skeleton className="w-12 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="animate-fade-in stagger-3">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-6" />
      </div>
      <div className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4">
            <Skeleton className="w-28 h-5" />
            <Skeleton className="w-12 h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="animate-fade-in stagger-5">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-32 h-6" />
      </div>
      <div className="bg-card/30 border border-border rounded-xl divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
            <Skeleton className="w-16 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
