import React from "react";

const VARIANTS = {
  primary:
    "bg-[var(--accent-red)] text-white border border-[var(--accent-red-border)] hover:opacity-90",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--accent-red-border)]",
  accent:
    "bg-[var(--accent-red-subtle)] text-[var(--text-primary)] border border-[var(--accent-red-border)] hover:bg-[color-mix(in_srgb,var(--accent-red)_18%,transparent)]",
  danger:
    "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)]",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-[11px]",
  md: "px-4 py-2 text-xs",
  lg: "px-5 py-2.5 text-sm",
};

const Button = ({
  children,
  variant = "ghost",
  size = "md",
  className = "",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.1em] rounded-[var(--radius-md)] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.ghost} ${SIZES[size] || SIZES.md} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
