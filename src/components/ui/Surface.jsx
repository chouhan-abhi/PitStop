import React from "react";

// Reduced rounding — sharp, technical shape scale
const TIER_STYLES = {
  container: {
    background: "var(--md-surface-container)",
    border: "1px solid var(--md-outline-variant)",
    boxShadow: "var(--shadow-sm)",
  },
  "container-high": {
    background: "var(--md-surface-container-high)",
    border: "1px solid var(--md-outline-variant)",
    boxShadow: "var(--shadow-sm)",
  },
  "container-highest": {
    background: "var(--md-surface-container-highest)",
    border: "1px solid var(--md-outline)",
    boxShadow: "var(--shadow-md)",
  },
  dim: {
    background: "var(--md-surface-dim)",
    border: "1px solid var(--md-outline-variant)",
  },
  glass: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-backdrop)",
    WebkitBackdropFilter: "var(--glass-backdrop)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--shadow-md)",
  },
  pitwall: {
    background: "var(--md-surface-container)",
    border: "1px solid var(--md-outline-variant)",
    position: "relative",
    overflow: "hidden",
  },
};

// Sharp radius — var(--shape-md) = 10px globally
const RADIUS = "var(--shape-md)";

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
    ? { cursor: "pointer", transition: "border-color var(--motion-fast) ease, background-color var(--motion-fast) ease" }
    : {};

  return React.createElement(
    as,
    {
      ref,
      className: `${className}`.trim(),
      style: {
        borderRadius: RADIUS,
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
