import React from "react";

const PageShell = ({ title, subtitle, meta, actions, children, className = "" }) => {
  return (
    <div className={`app-shell relative z-10 py-5 lg:py-7 space-y-5 ${className}`}>
      {(title || subtitle || actions || meta) && (
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              {title && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: 3,
                      height: "1.25rem",
                      background: "var(--md-primary)",
                      borderRadius: "2px",
                      boxShadow: "0 0 6px var(--md-primary)",
                      flexShrink: 0,
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--md-on-surface)",
                      margin: 0,
                    }}
                  >
                    {title}
                  </h2>
                </div>
              )}
              {subtitle && (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--md-on-surface-variant)",
                    marginTop: "0.2rem",
                    marginLeft: subtitle ? "0.85rem" : 0,
                  }}
                >
                  {subtitle}
                </p>
              )}
              {meta && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--md-on-surface-variant)",
                    marginTop: "0.2rem",
                  }}
                >
                  {meta}
                </div>
              )}
            </div>
            {actions && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                {actions}
              </div>
            )}
          </div>
        </header>
      )}
      {children}
    </div>
  );
};

export default PageShell;
