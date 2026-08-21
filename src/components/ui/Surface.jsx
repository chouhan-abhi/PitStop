import React from "react";

const TIER_STYLES = {
  container: {
    background: "var(--md-surface-container)",
    border: "1px solid var(--md-outline-variant)",
    boxShadow: "var(--shadow-sm)",
    borderRadius: "var(--shape-md)",
  },
  "container-high": {
    background: "var(--md-surface-container-high)",
    border: "1px solid var(--md-outline-variant)",
    boxShadow: "var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    borderRadius: "var(--shape-md)",
  },
  "container-highest": {
    background: "var(--md-surface-container-highest)",
    border: "1px solid var(--md-outline)",
    boxShadow: "var(--shadow-raised), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    borderRadius: "var(--shape-lg)",
  },
  dim: {
    background: "var(--md-surface-dim)",
    border: "1px solid var(--md-outline-variant)",
    borderRadius: "var(--shape-md)",
  },
  glass: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-backdrop)",
    WebkitBackdropFilter: "var(--glass-backdrop)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    borderRadius: "var(--shape-lg)",
  },
  pitwall: {
    background: "var(--md-surface-container)",
    border: "1px solid var(--md-outline-variant)",
    boxShadow: "var(--shadow-sm)",
    position: "relative",
    overflow: "hidden",
    borderRadius: "var(--shape-md)",
  },
};

const Surface = React.forwardRef(({
  children,
  tier = "container",
  interactive = false,
  className = "",
  as = "div",
  style: externalStyle = {},
  ...props
}, ref) => {
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.container;
  const interactiveStyle = interactive
    ? {
        cursor: "pointer",
        transition: "transform var(--motion-standard) var(--ease-spring), border-color var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-standard) var(--ease-standard)",
      }
    : {};

  return React.createElement(
    as,
    {
      ref,
      className: `${className} ${interactive ? "hover:scale-[1.006] hover:shadow-md hover:border-white/10 active:scale-[0.99] active:shadow-sm" : ""}`.trim(),
      style: {
        color: "var(--md-on-surface)",
        ...tierStyle,
        ...interactiveStyle,
        ...externalStyle,
      },
      ...props,
    },
    children
  );
});

Surface.displayName = "Surface";

export default Surface;
