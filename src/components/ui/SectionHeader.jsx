import React from "react";

const SectionHeader = ({ title, subtitle, actions, compact = false, className = "" }) => (
  <div
    className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}
    style={{ marginBottom: compact ? "0.75rem" : "1rem" }}
  >
    <div>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 2,
              height: compact ? "0.875rem" : "1rem",
              background: "var(--md-primary)",
              borderRadius: "1px",
              boxShadow: "0 0 4px var(--md-primary)",
              flexShrink: 0,
            }}
          />
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: compact ? "0.875rem" : "1rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--md-on-surface)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>
        </div>
      )}
      {subtitle && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--md-on-surface-variant)",
            marginTop: "0.2rem",
            marginLeft: "0.625rem",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {actions}
      </div>
    )}
  </div>
);

export default SectionHeader;
