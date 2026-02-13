import React from "react";

const PageShell = ({ title, subtitle, meta, actions, children, className = "" }) => {
  return (
    <div className={`app-shell relative z-10 py-4 lg:py-7 space-y-5 ${className}`}>
      {(title || subtitle || actions || meta) && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="display-title text-2xl sm:text-3xl font-bold">{title}</h2>}
            {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
            {meta && <div className="text-[11px] text-[var(--text-muted)] mt-1">{meta}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
};

export default PageShell;
