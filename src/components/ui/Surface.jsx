import React from "react";

const TIER_CLASSES = {
  container: "md3-surface-container",
  "container-high": "md3-surface-container-high",
  "container-highest": "md3-surface-container-highest",
  dim: "bg-[var(--md-surface-dim)]",
};

const Surface = React.forwardRef(({
  children,
  tier = "container",
  interactive = false,
  className = "",
  as = "div",
  ...props
}, ref) => {
  const tierClass = TIER_CLASSES[tier] || TIER_CLASSES.container;
  const stateClass = interactive ? "md3-state-layer" : "";

  return React.createElement(
    as,
    {
      ref,
      className: `${tierClass} ${stateClass} ${className}`.trim(),
      ...props,
    },
    children
  );
});

Surface.displayName = "Surface";

export default Surface;
