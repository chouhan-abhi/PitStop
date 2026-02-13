import React from "react";

const StatChip = ({ label, value }) => (
  <div className="rounded-xl border border-[var(--border-color)] bg-black/10 px-3 py-2">
    <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</div>
    <div className="text-sm font-semibold text-[var(--text-primary)]">{value}</div>
  </div>
);

export default StatChip;
