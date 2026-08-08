import React from "react";

const VARIANTS = {
  filled:
    "bg-[var(--md-primary)] text-[var(--md-on-primary)] hover:opacity-90",
  tonal:
    "bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] hover:opacity-90",
  outlined:
    "border border-[var(--md-outline)] text-[var(--md-primary)] bg-transparent hover:bg-[var(--md-primary-container)]/20",
  text: "text-[var(--md-primary)] bg-transparent hover:bg-[var(--md-primary-container)]/15",
  ghost: "text-[var(--md-on-surface-variant)] bg-transparent hover:bg-[var(--md-surface-container-high)]",
  primary: "bg-[var(--md-primary)] text-[var(--md-on-primary)] hover:opacity-90",
  accent: "bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] hover:opacity-90",
  danger: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)]",
};

const SIZES = {
  sm: "h-7 px-3 gap-1.5",
  md: "h-9 px-4 gap-2",
  lg: "h-10 px-5 gap-2",
};

const Button = ({
  children,
  variant = "tonal",
  size = "md",
  className = "",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.tonal} ${SIZES[size] || SIZES.md} ${className}`}
    style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.65rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      borderRadius: "var(--shape-sm)",  /* sharp: 4px */
      cursor: "pointer",
    }}
    {...props}
  >
    {children}
  </button>
);

export default Button;
