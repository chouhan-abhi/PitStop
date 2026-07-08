import React from "react";

const VARIANTS = {
  filled:
    "bg-[var(--md-primary)] text-[var(--md-on-primary)] hover:opacity-92",
  tonal:
    "bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]",
  outlined:
    "border border-[var(--md-outline)] text-[var(--md-primary)] bg-transparent",
  text: "text-[var(--md-primary)] bg-transparent",
  ghost: "text-[var(--md-on-surface-variant)] bg-transparent",
  primary: "bg-[var(--md-primary)] text-[var(--md-on-primary)]",
  accent: "bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]",
  danger: "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]",
};

const SIZES = {
  sm: "h-8 px-4 text-[var(--type-label-md)]",
  md: "h-10 px-6 text-[var(--type-label-lg)]",
  lg: "h-12 px-8 text-[var(--type-body-md)]",
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
    className={`md3-state-layer inline-flex items-center justify-center gap-2 font-medium rounded-[var(--shape-full)] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.tonal} ${SIZES[size] || SIZES.md} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
