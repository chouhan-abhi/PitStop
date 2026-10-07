import React, { useState } from "react";
import { Shield, Sparkles, ChevronRight, Users, Bell } from "lucide-react";
import { usePersonalization } from "../../common/storage/personalizationStore";
import TeamSelectorModal from "./TeamSelectorModal";

export const MyTeamHeroCard = ({ className = "" }) => {
  const { favoriteTeam, favoriteTeamObj } = usePersonalization();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!favoriteTeam || !favoriteTeamObj) {
    return (
      <>
        <div
          className={`relative overflow-hidden p-4 sm:p-5 rounded-[var(--shape-lg)] bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] shadow-sm ${className}`}
          style={{
            background:
              "linear-gradient(135deg, var(--md-surface-container) 0%, color-mix(in srgb, var(--md-primary) 8%, var(--md-surface-container)) 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--md-primary)]/15 border border-[var(--md-primary)]/30 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-[var(--md-primary)]" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
                  Personalize Your Command Center
                </h3>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] mt-0.5">
                  Pick your favorite constructor to customize news feeds, standings, and track telemetry.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-[var(--shape-sm)] bg-[var(--md-primary)] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90 active:scale-95 transition-all shadow-md shrink-0"
            >
              <Shield size={14} />
              Choose Team
            </button>
          </div>
        </div>

        <TeamSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  const team = favoriteTeamObj;

  return (
    <>
      <div
        className={`relative overflow-hidden p-4 sm:p-5 rounded-[var(--shape-lg)] border transition-all duration-300 shadow-md ${className}`}
        style={{
          background: `linear-gradient(135deg, var(--md-surface-container) 40%, ${team.color}15 100%)`,
          borderColor: `${team.color}40`,
          boxShadow: `0 8px 24px -8px ${team.color}25, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: team.color }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-mono font-black text-sm text-white shrink-0 shadow-lg border"
              style={{
                backgroundColor: `${team.color}25`,
                borderColor: `${team.color}60`,
                color: team.color,
              }}
            >
              {team.code}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--md-on-surface-variant)]">
                  FAVORITE CONSTRUCTOR
                </span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: team.color }} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display tracking-wide">
                {team.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                <Users size={12} />
                <span>{team.drivers.map((d) => `#${d.number} ${d.name}`).join("  ·  ")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-[var(--shape-sm)] bg-white/5 border border-white/10 text-white font-mono text-[11px] hover:bg-white/10 active:scale-95 transition-all"
            >
              Switch Team
            </button>
          </div>
        </div>
      </div>

      <TeamSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default MyTeamHeroCard;
