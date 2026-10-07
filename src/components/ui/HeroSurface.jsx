import React from "react";
import CircuitSVG from "../Common/CircuitSVG";

const HeroSurface = ({
  circuitName,
  location,
  children,
  className = "",
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
    {/* High-performance Vector Track Outline Background */}
    <div
      className="absolute right-2 -bottom-6 sm:right-6 sm:bottom-0 opacity-[0.22] pointer-events-none flex items-center justify-center transition-all duration-500"
      aria-hidden="true"
    >
      <div className="scale-125 sm:scale-150 drop-shadow-[0_0_24px_var(--md-primary)]">
        <CircuitSVG circuitName={circuitName} location={location} size={280} />
      </div>
    </div>

    {/* Cyan / Accent radial glow overlay */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 85% 45%, color-mix(in srgb, var(--md-primary) 12%, transparent), transparent 65%)",
      }}
      aria-hidden="true"
    />

    {/* Subtle grid pattern for tech aesthetic */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
      aria-hidden="true"
    />

    {/* Bottom gradient fade */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(to top, var(--md-surface-container-high) 15%, transparent 65%)",
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
