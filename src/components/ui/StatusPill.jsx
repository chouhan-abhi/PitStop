import React from "react";

const TONE_STYLES = {
  neutral: {
    background: "var(--md-surface-container-highest)",
    color: "var(--md-on-surface-variant)",
    border: "1px solid var(--md-outline-variant)",
  },
  live: {
    background: "rgba(0, 229, 200, 0.08)",
    color: "var(--md-primary)",
    border: "1px solid rgba(0, 229, 200, 0.25)",
  },
  success: {
    background: "rgba(34, 197, 94, 0.08)",
    color: "var(--status-green)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
  },
  warn: {
    background: "rgba(245, 158, 11, 0.08)",
    color: "var(--warning)",
    border: "1px solid rgba(245, 158, 11, 0.25)",
  },
  danger: {
    background: "rgba(239, 68, 68, 0.08)",
    color: "var(--danger)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
  },
};

const StatusPill = ({ tone = "neutral", children, icon: Icon }) => {
  const style = TONE_STYLES[tone] || TONE_STYLES.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        borderRadius: "var(--shape-xs)",   /* sharp: 2px */
        padding: "0.2rem 0.5rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {Icon && <Icon size={11} aria-hidden />}
      {children}
    </span>
  );
};

export default StatusPill;
