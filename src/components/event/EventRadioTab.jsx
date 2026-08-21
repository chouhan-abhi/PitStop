import React, { useState } from "react";
import { Play, Pause, Radio, Calendar } from "lucide-react";
import Surface from "../ui/Surface";
import LoadingState from "../ui/LoadingState";
import { useTeamRadio } from "./useTeamRadio";

const EventRadioTab = ({ meetingKey, allDrivers = [] }) => {
  const { data: radioLogs = [], isLoading } = useTeamRadio(meetingKey);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [audio] = useState(() => new Audio());

  const handlePlayToggle = (url) => {
    if (playingUrl === url) {
      audio.pause();
      setPlayingUrl(null);
    } else {
      audio.pause();
      audio.src = url;
      audio.play().catch(err => console.error("Audio playback blocked or failed:", err));
      setPlayingUrl(url);
      
      audio.onended = () => {
        setPlayingUrl(null);
      };
    }
  };

  // Build drivers mapping
  const driverMap = React.useMemo(() => {
    const map = {};
    allDrivers.forEach((d) => {
      map[d.driver_number] = d;
    });
    return map;
  }, [allDrivers]);

  if (isLoading) {
    return <LoadingState message="Loading team radio recordings…" />;
  }

  const hasRadio = radioLogs && radioLogs.length > 0;

  return (
    <Surface tier="container" className="p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Radio size={16} className="text-[var(--md-primary)]" />
        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
          LIVE TEAM RADIO INBOX
        </h3>
        <span className="text-[10px] font-mono text-[var(--md-on-surface-variant)] uppercase ml-auto">
          {radioLogs.length} TRANSMISSIONS
        </span>
      </div>

      {!hasRadio ? (
        <p className="md3-body-md text-[var(--md-on-surface-variant)] py-8 text-center font-mono text-xs">
          NO TEAM RADIO RECORDINGS REPORTED FOR THIS GP.
        </p>
      ) : (
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {radioLogs.map((log, index) => {
            const driver = driverMap[log.driver_number];
            const name = driver?.full_name || `Driver #${log.driver_number}`;
            const team = driver?.team_name || "Constructor";
            const acronym = driver?.name_acronym || `#${log.driver_number}`;
            const color = driver?.team_colour ? `#${driver.team_colour}` : "var(--md-primary)";
            const dateStr = log.date ? new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Live";
            const isCurrentPlaying = playingUrl === log.recording_url;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] hover:border-white/10 transition-colors"
                style={{
                  borderLeft: `3px solid ${color}`,
                  borderRadius: "var(--shape-sm)",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <span
                    className="font-mono text-xs font-black px-2 py-0.5"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      borderRadius: "var(--shape-xs)",
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {acronym}
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-none truncate">{name}</p>
                    <p className="text-[10px] font-mono text-[var(--md-on-surface-variant)] mt-1 truncate">
                      {team} · <Calendar size={8} className="inline mr-0.5" /> {dateStr}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayToggle(log.recording_url)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCurrentPlaying ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-[var(--md-primary)]/10 text-[var(--md-primary)] border border-[var(--md-primary)]/30 hover:bg-[var(--md-primary)]/20"
                  }`}
                >
                  {isCurrentPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Surface>
  );
};

export default EventRadioTab;
