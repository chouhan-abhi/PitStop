import React from "react";

export const SkeletonPulse = ({ className = "", style = {} }) => (
  <div
    className={`animate-pulse bg-white/[0.06] rounded-[var(--shape-sm)] ${className}`}
    style={style}
  />
);

export const SkeletonCard = ({ rows = 3, className = "" }) => (
  <div
    className={`p-4 rounded-[var(--shape-md)] bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] space-y-3 ${className}`}
  >
    <div className="flex items-center gap-3">
      <SkeletonPulse className="w-8 h-8 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <SkeletonPulse className="h-3.5 w-1/3" />
        <SkeletonPulse className="h-2.5 w-1/4" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonPulse key={i} className="h-3 w-full" />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 6, cols = 4, className = "" }) => (
  <div
    className={`rounded-[var(--shape-md)] bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] p-4 space-y-3 ${className}`}
  >
    <div className="flex justify-between items-center pb-2 border-b border-white/5">
      <SkeletonPulse className="h-4 w-28" />
      <SkeletonPulse className="h-4 w-16" />
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 py-1.5">
        <SkeletonPulse className="h-3 w-6 shrink-0" />
        <SkeletonPulse className="h-3 w-28 shrink-0" />
        <SkeletonPulse className="h-3 flex-1" />
        <SkeletonPulse className="h-3 w-16 shrink-0" />
      </div>
    ))}
  </div>
);

export const SkeletonHero = ({ className = "" }) => (
  <div
    className={`rounded-[var(--shape-lg)] bg-[var(--md-surface-container-high)] border border-[var(--md-outline-variant)] p-6 space-y-4 min-h-[260px] flex flex-col justify-end ${className}`}
  >
    <SkeletonPulse className="h-3 w-32" />
    <SkeletonPulse className="h-8 w-2/3" />
    <div className="flex gap-4">
      <SkeletonPulse className="h-4 w-24" />
      <SkeletonPulse className="h-4 w-28" />
    </div>
  </div>
);

export default SkeletonPulse;
