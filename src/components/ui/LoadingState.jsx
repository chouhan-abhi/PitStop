import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState = ({ message = "Loading...", className = "" }) => (
  <div className={`flex items-center justify-center gap-2 py-12 text-[var(--text-secondary)] ${className}`}>
    <Loader2 className="w-5 h-5 animate-spin opacity-60" />
    <span className="text-sm">{message}</span>
  </div>
);

export default LoadingState;
