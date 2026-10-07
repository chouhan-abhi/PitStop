import React from "react";
import { Check, X, Shield, Sparkles } from "lucide-react";
import { usePersonalization, F1_TEAMS } from "../../common/storage/personalizationStore";
import Surface from "./Surface";

export const TeamSelectorModal = ({ isOpen, onClose }) => {
  const { favoriteTeam, setFavoriteTeam, clearFavoriteTeam } = usePersonalization();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-[var(--shape-xl)] bg-[var(--md-surface-container-high)] border border-[var(--md-outline-variant)] shadow-2xl overflow-hidden"
        style={{
          boxShadow: "0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[var(--md-surface-container)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--md-primary)]/10 border border-[var(--md-primary)]/30 flex items-center justify-center">
              <Shield size={16} className="text-[var(--md-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display tracking-wide uppercase">
                Choose Your Team
              </h2>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                Personalizes your news feed, standings, and telemetry highlights
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-on-surface-variant)] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Teams Grid */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 overscroll-contain">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {F1_TEAMS.map((team) => {
              const isSelected = favoriteTeam === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => {
                    if (isSelected) {
                      clearFavoriteTeam();
                    } else {
                      setFavoriteTeam(team.id);
                    }
                  }}
                  className={`group relative flex items-center gap-3.5 p-3.5 text-left rounded-[var(--shape-md)] border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.08] border-white/30 shadow-lg scale-[1.01]"
                      : "bg-[var(--md-surface-container)] border-[var(--md-outline-variant)] hover:bg-white/[0.04] hover:border-white/15"
                  }`}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: team.color,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black" style={{ color: team.color }}>
                        {team.code}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {team.shortName}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[var(--md-on-surface-variant)] mt-1 truncate">
                      {team.drivers.map((d) => d.name).join(" · ")}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? "bg-white text-black border-white"
                        : "border-white/10 group-hover:border-white/30"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[var(--md-surface-container)] flex items-center justify-between">
          {favoriteTeam ? (
            <button
              onClick={() => {
                clearFavoriteTeam();
              }}
              className="text-xs font-mono text-[var(--md-on-surface-variant)] hover:text-white transition-colors"
            >
              Clear Selection
            </button>
          ) : (
            <span className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
              No team selected (showing all)
            </span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[var(--shape-sm)] bg-[var(--md-primary)] text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelectorModal;
