import React from "react";

const toneMap = {
  neutral: "bg-white/5 text-[var(--text-secondary)] border-[var(--border-color)]",
  live: "bg-red-500/20 text-red-200 border-red-500/40",
  success: "bg-emerald-500/20 text-emerald-200 border-emerald-500/35",
  warn: "bg-amber-500/20 text-amber-200 border-amber-500/35",
  danger: "bg-rose-500/20 text-rose-200 border-rose-500/35",
};

const StatusPill = ({ tone = "neutral", children }) => {
  const classes = toneMap[tone] || toneMap.neutral;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${classes}`}>
      {children}
    </span>
  );
};

export default StatusPill;
