import React, { Suspense } from "react";

import CircuitSVG from "../Common/CircuitSVG";

const CircuitModel = React.lazy(() => import("../Common/CircuitModel"));

const CircuitPreview = ({
  circuitName,
  location,
  width = 200,
  height = 120,
  use3D = true,
  className = "",
}) => (
  <div
    className={`rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--surface-2)]/40 overflow-hidden ${className}`}
  >
    {use3D ? (
      <Suspense
        fallback={
          <div className="flex items-center justify-center" style={{ width, height }}>
            <CircuitSVG circuitName={circuitName} location={location} size={Math.min(width, height) - 20} />
          </div>
        }
      >
        <CircuitModel
          circuitName={circuitName}
          location={location}
          width={width}
          height={height}
          enabled
          defer={false}
        />
      </Suspense>
    ) : (
      <div className="flex items-center justify-center p-2" style={{ width, height }}>
        <CircuitSVG circuitName={circuitName} location={location} size={Math.min(width, height) - 24} />
      </div>
    )}
  </div>
);

export default CircuitPreview;
