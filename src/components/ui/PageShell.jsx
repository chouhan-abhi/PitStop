import React from "react";

const PageShell = ({ title, subtitle, meta, actions, children, className = "" }) => {
  return (
    <div className={`app-shell relative z-10 py-5 lg:py-8 space-y-6 ${className}`}>
      {(title || subtitle || actions || meta) && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="md3-headline-lg">{title}</h2>}
            {subtitle && <p className="md3-body-md text-[var(--md-on-surface-variant)] mt-1">{subtitle}</p>}
            {meta && <div className="md3-label-md text-[var(--md-on-surface-variant)] mt-1">{meta}</div>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
};

export default PageShell;
