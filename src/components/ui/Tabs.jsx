import React, { useRef, useEffect, useState } from "react";

const Tabs = ({ tabs, activeKey, onChange, className = "" }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeKey];
    const track = trackRef.current;
    if (!el || !track) return;

    const trackRect = track.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();
    setIndicator({
      left: tabRect.left - trackRect.left,
      width: tabRect.width,
    });

    // Auto-scroll the active tab into view if container is overflowing
    const container = containerRef.current;
    if (container) {
      const containerLeft = container.scrollLeft;
      const containerRight = containerLeft + container.clientWidth;
      const tabLeft = tabRect.left - container.getBoundingClientRect().left + containerLeft;
      const tabRight = tabLeft + tabRect.width;

      if (tabLeft < containerLeft + 16) {
        container.scrollTo({ left: tabLeft - 16, behavior: "smooth" });
      } else if (tabRight > containerRight - 16) {
        container.scrollTo({ left: tabRight - container.clientWidth + 16, behavior: "smooth" });
      }
    }
  }, [activeKey, tabs]);

  return (
    <div
      ref={containerRef}
      className={`segmented-tabs-container ${className}`}
      style={{
        width: "100%",
        display: "flex",
        overflowX: "auto",
        scrollbarWidth: "none",
        background: "var(--md-surface-container)",
        borderRadius: "var(--shape-md)",
        padding: "4px",
        border: "1px solid var(--md-outline-variant)",
      }}
      role="tablist"
    >
      <div
        ref={trackRef}
        style={{
          position: "relative",
          display: "flex",
          flex: "1 0 auto",
          gap: "2px",
          width: "max-content",
          minWidth: "100%",
        }}
      >
        {/* Sliding background pill indicator */}
        <span
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.08)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            borderRadius: "calc(var(--shape-md) - 2px)",
            transition: "left 240ms cubic-bezier(0.25, 1, 0.5, 1), width 240ms cubic-bezier(0.25, 1, 0.5, 1)",
            left: indicator.left,
            width: indicator.width,
            pointerEvents: "none",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

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
                flex: "1 0 auto",
                padding: "0.55rem 1.1rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--md-primary)" : "var(--md-on-surface-variant)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "color 150ms ease, transform 100ms ease",
                zIndex: 1,
                borderRadius: "calc(var(--shape-md) - 2px)",
              }}
              className="hover:text-white active:scale-95"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
