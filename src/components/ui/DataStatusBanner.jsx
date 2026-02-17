import React from "react";
import { TriangleAlert, DatabaseZap } from "lucide-react";

const DataStatusBanner = ({ meta, className = "" }) => {
  if (!meta) return null;
  if (!meta.isStale && !meta.warning) return null;

  const label = meta.isStale
    ? "Showing cached data while the live source recovers."
    : meta.warning;

  return (
    <div
      className={`rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      {meta.isStale ? <DatabaseZap className="w-3.5 h-3.5" /> : <TriangleAlert className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );
};

export default DataStatusBanner;

