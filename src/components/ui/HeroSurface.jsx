import React, { Suspense } from "react";

import CircuitSVG from "../Common/CircuitSVG";

const CircuitModel = React.lazy(() => import("../Common/CircuitModel"));

const HeroSurface = ({
  circuitName,
  location,
  children,
  className = "",
  eager3D = true,
  minHeight = "min-h-[280px] sm:min-h-[320px]",
}) => (
  <section
    className={`relative overflow-hidden rounded-[var(--shape-xl)] bg-[var(--md-surface-container-high)] ${minHeight} ${className}`}
  >
    <div
      className="absolute inset-0 opacity-[0.35] pointer-events-none"
      aria-hidden="true"
    >
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <CircuitSVG circuitName={circuitName} location={location} size={200} />
          </div>
        }
      >
        <div className="h-full w-full flex items-center justify-center scale-110">
          <CircuitModel
            circuitName={circuitName}
            location={location}
            width={520}
            height={320}
            enabled={Boolean(circuitName)}
            defer={!eager3D}
          />
        </div>
      </Suspense>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-[var(--md-surface-container-high)] via-[var(--md-surface-container-high)]/80 to-transparent pointer-events-none" />
    <div className="relative z-10 p-5 sm:p-8 h-full flex flex-col justify-end">{children}</div>
  </section>
);

export default HeroSurface;
