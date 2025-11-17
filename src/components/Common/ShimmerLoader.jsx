// src/components/ShimmerLoader.jsx
import React from "react";

/**
 * ShimmerLoader props:
 * - rows: how many rows to render (default 3)
 * - compact: smaller spacing
 * - title: whether to show title skeleton
 */
const ShimmerLoader = ({ rows = 3, compact = false, title = true }) => {
  return (
    <div className={`animate-pulse ${compact ? "p-2" : "p-4"} rounded-md`}>
      {title && <div className="h-4 w-40 mb-3 rounded bg-[var(--skeleton-color)]" />}
      <div className={`space-y-${compact ? "2" : "3"}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`flex items-center ${compact ? "h-8" : "h-12"} gap-3`}>
            <div className={`rounded-full ${compact ? "w-8 h-8" : "w-10 h-10"} bg-[var(--skeleton-color)]`} />
            <div className="flex-1">
              <div className="h-3 w-3/5 mb-2 rounded bg-[var(--skeleton-color)]" />
              <div className="h-3 w-2/5 rounded bg-[var(--skeleton-color)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShimmerLoader;
