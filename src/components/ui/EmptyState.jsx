import React from "react";

const EmptyState = ({ title = "Nothing here yet", message, icon: Icon, className = "" }) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    {Icon && <Icon className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-50" />}
    <p className="display-title text-lg font-semibold text-[var(--text-primary)]">{title}</p>
    {message && <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">{message}</p>}
  </div>
);

export default EmptyState;
