import React from "react";

const StatChip = ({ label, value }) => (
  <div className="rounded-[var(--shape-lg)] bg-[var(--md-surface-container-highest)] px-4 py-3">
    <div className="md3-label-md text-[var(--md-on-surface-variant)]">{label}</div>
    <div className="md3-headline-md font-mono tabular-nums mt-1">{value}</div>
  </div>
);

export default StatChip;
