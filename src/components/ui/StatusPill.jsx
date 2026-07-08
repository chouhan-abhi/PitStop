import React from "react";

const toneMap = {
  neutral: "bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]",
  live: "bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]",
  success: "bg-[color-mix(in_srgb,var(--success)_20%,var(--md-surface-container))] text-[var(--success)]",
  warn: "bg-[color-mix(in_srgb,var(--warning)_20%,var(--md-surface-container))] text-[var(--warning)]",
  danger: "bg-[color-mix(in_srgb,var(--danger)_20%,var(--md-surface-container))] text-[var(--danger)]",
};

const StatusPill = ({ tone = "neutral", children, icon: Icon }) => {
  const classes = toneMap[tone] || toneMap.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--shape-sm)] px-3 py-1 md3-label-md ${classes}`}
    >
      {Icon && <Icon size={14} aria-hidden />}
      {children}
    </span>
  );
};

export default StatusPill;
