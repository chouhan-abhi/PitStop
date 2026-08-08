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
    className={`relative overflow-hidden ${minHeight} ${className}`}
    style={{
      borderRadius: "var(--shape-lg)",
      background: "var(--md-surface-container-high)",
      border: "1px solid var(--md-outline-variant)",
    }}
  >
    {/* Circuit model background */}
    <div
      className="absolute inset-0 opacity-[0.25] pointer-events-none"
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

    {/* Cyan radial glow overlay */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 80% 50%, rgba(0, 229, 200, 0.06), transparent 60%)",
      }}
      aria-hidden="true"
    />

    {/* Bottom gradient fade */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(to top, var(--md-surface-container-high) 10%, rgba(0,0,0,0) 60%)",
      }}
      aria-hidden="true"
    />

    {/* Content */}
    <div
      className="relative z-10 h-full flex flex-col justify-end"
      style={{ padding: "clamp(1.25rem, 4vw, 2rem)" }}
    >
      {children}
    </div>
  </section>
);

export default HeroSurface;
