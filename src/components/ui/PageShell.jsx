import React from "react";

const PageShell = ({ title, subtitle, meta, actions, children, className = "" }) => {
  return (
    <div className={`app-shell relative z-10 py-4 lg:py-6 space-y-4 ${className}`}>
      {(title || subtitle || actions || meta) && (
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="md3-headline-md">{title}</h2>}
            {subtitle && <p className="md3-body-md text-[var(--md-on-surface-variant)] mt-0.5">{subtitle}</p>}
            {meta && <div className="md3-label-md text-[var(--md-on-surface-variant)] mt-0.5">{meta}</div>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
};

export default PageShell;
