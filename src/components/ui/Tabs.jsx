import React from "react";

const Tabs = ({ tabs, activeKey, onChange, className = "" }) => (
  <div
    className={`flex gap-1 p-1 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--surface-2)]/50 ${className}`}
    role="tablist"
  >
    {tabs.map((tab) => {
      const isActive = activeKey === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.key)}
          className={`flex-1 px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] transition-all uppercase tracking-[0.12em] ${
            isActive
              ? "bg-[var(--accent-red-subtle)] text-[var(--text-primary)] border border-[var(--accent-red-border)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

export default Tabs;
