import React from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

const AppError = ({ message = "Session suspended", onRetry, onHome }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0b0b] text-white font-sans relative overflow-hidden">
      {/* Flashing red header bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse" />

      {/* Main Content */}
      <div className="flex flex-col items-center text-center px-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={40} className="text-red-500 animate-pulse" />
          <h1 className="text-4xl font-bold tracking-widest text-red-500">
            RED FLAG
          </h1>
        </div>

        <p className="text-gray-400 text-sm uppercase tracking-wide mb-6">
          Race Control: {message}
        </p>

        <div className="flex gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2 rounded-md border border-red-500/50 text-red-400 hover:bg-red-600/20 transition-all"
            >
              <RotateCw size={16} />
              Retry
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800/50 transition-all"
            >
              <Home size={16} />
              Home
            </button>
          )}
        </div>
      </div>

      {/* Bottom telemetry line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 animate-[flash_2s_infinite]" />

      <style>
        {`
          @keyframes flash {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
};

export default AppError;
