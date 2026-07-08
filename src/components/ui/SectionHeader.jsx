import React from "react";

const SectionHeader = ({ title, subtitle, actions, compact = false, className = "" }) => (
  <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
    <div>
      {title && (
        <h3 className={compact ? "md3-title-lg" : "md3-headline-md"}>{title}</h3>
      )}
      {subtitle && (
        <p className="md3-body-md text-[var(--md-on-surface-variant)] mt-0.5">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default SectionHeader;
