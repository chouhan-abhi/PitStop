import React from "react";
import CircuitSVG from "../Common/CircuitSVG";

const CircuitPreview = ({
  circuitName,
  location,
  width = 200,
  height = 120,
  className = "",
}) => (
  <div
    className={`rounded-[var(--shape-md)] bg-[var(--md-surface-container)] flex items-center justify-center p-3 border border-[var(--md-outline-variant)] ${className}`}
    style={{ width, height }}
  >
    <CircuitSVG
      circuitName={circuitName}
      location={location}
      size={Math.min(width, height) - 24}
    />
  </div>
);

export default CircuitPreview;
