import React, { useRef, useEffect, useState } from "react";

const Tabs = ({ tabs, activeKey, onChange, className = "" }) => {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeKey];
    const container = containerRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();
    setIndicator({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [activeKey, tabs]);

  return (
    <div
      ref={containerRef}
      className={`relative flex border-b border-[var(--md-outline-variant)] ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[tab.key] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`md3-state-layer flex-1 px-4 py-3 md3-label-lg transition-colors ${
              isActive
                ? "text-[var(--md-primary)]"
                : "text-[var(--md-on-surface-variant)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
      <span
        className="absolute bottom-0 h-[3px] bg-[var(--md-primary)] rounded-t-full transition-all duration-[var(--motion-standard)] ease-[var(--ease-standard)]"
        style={{ left: indicator.left, width: indicator.width }}
        aria-hidden="true"
      />
    </div>
  );
};

export default Tabs;
