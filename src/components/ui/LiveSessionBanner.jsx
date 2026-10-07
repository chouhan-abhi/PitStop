import React from "react";
import { Link } from "react-router-dom";
import { Activity, Radio, Flag, ChevronRight } from "lucide-react";
import { useAdaptiveLiveState } from "../../hooks/useAdaptiveLiveState";

export const LiveSessionBanner = ({ currentMeetingKey }) => {
  const { isLive, activeSession, nextSession } = useAdaptiveLiveState(currentMeetingKey);

  if (isLive && activeSession) {
    return (
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-[var(--shape-md)] border shadow-lg overflow-hidden relative animate-apple-fade-in animate-live-glow"
        style={{
          background:
            "linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)",
          borderColor: "rgba(239, 68, 68, 0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-red-400 tracking-widest uppercase">
                LIVE ON TRACK
              </span>
              <span className="text-white/40">·</span>
              <span className="font-mono text-xs font-bold text-white uppercase">
                {activeSession.session_name}
              </span>
            </div>
            <div className="text-[10px] font-mono text-[var(--md-on-surface-variant)] mt-0.5">
              Live timing, car telemetry, and pit telemetry are active
            </div>
          </div>
        </div>

        <Link
          to={`/event/${currentMeetingKey}`}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[var(--shape-xs)] bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm self-stretch sm:self-auto shrink-0 apple-interactive"
        >
          <Activity size={14} />
          <span>Launch Telemetry</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return null;
};

export default LiveSessionBanner;
