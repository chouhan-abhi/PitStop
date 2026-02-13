import React from "react";

const SectionHeader = ({ title, subtitle, actions, compact = false }) => {
  return (
    <div className={`flex items-start justify-between gap-3 ${compact ? "mb-2" : "mb-4"}`}>
      <div>
        <h3 className="display-title text-base sm:text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
