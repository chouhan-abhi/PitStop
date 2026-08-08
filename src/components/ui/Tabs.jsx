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
      className={className}
      style={{
        position: "relative",
        display: "flex",
        borderBottom: "1px solid var(--md-outline-variant)",
        background: "var(--md-surface-container)",
        overflow: "hidden",
      }}
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
            style={{
              flex: 1,
              padding: "0.625rem 1rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isActive ? "var(--md-primary)" : "var(--md-on-surface-variant)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "color 120ms ease",
            }}
          >
            {tab.label}
          </button>
        );
      })}
      {/* Sliding underline indicator */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          height: "2px",
          background: "var(--md-primary)",
          boxShadow: "0 0 6px var(--md-primary)",
          borderRadius: "2px 2px 0 0",
          transition: `left ${200}ms var(--ease-standard), width ${200}ms var(--ease-standard)`,
          left: indicator.left,
          width: indicator.width,
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default Tabs;
