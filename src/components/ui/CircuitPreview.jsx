import React, { Suspense } from "react";

import CircuitSVG from "../Common/CircuitSVG";

const CircuitModel = React.lazy(() => import("../Common/CircuitModel"));

const CircuitPreview = ({
  circuitName,
  location,
  width = 200,
  height = 120,
  use3D = true,
  defer = true,
  className = "",
}) => (
  <div
    className={`rounded-[var(--shape-lg)] bg-[var(--md-surface-container-high)] overflow-hidden ${className}`}
    style={{ width, height }}
  >
    {use3D ? (
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
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
          defer={defer}
        />
      </Suspense>
    ) : (
      <div className="flex h-full w-full items-center justify-center p-2">
        <CircuitSVG circuitName={circuitName} location={location} size={Math.min(width, height) - 24} />
      </div>
    )}
  </div>
);

export default CircuitPreview;
