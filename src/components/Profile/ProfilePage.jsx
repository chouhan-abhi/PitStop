import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Sparkles,
  RefreshCw,
  Archive,
  Users,
  ChevronRight,
  Database,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import Surface from "../ui/Surface";
import TeamSelectorModal from "../ui/TeamSelectorModal";
import { usePersonalization } from "../../common/storage/personalizationStore";
import { useQueryClient } from "@tanstack/react-query";

const THEMES = [
  { id: "system", label: "System", icon: Laptop },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "saint", label: "Saint Blue", icon: Sparkles },
];

export const ProfilePage = ({
  seasonYear,
  setSeasonYear,
  themeMode,
  setThemeMode,
  isRefreshing,
  handleRefresh,
}) => {
  const {
    favoriteTeam,
    favoriteTeamObj,
    spoilerMode,
    setSpoilerMode,
  } = usePersonalization();

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [clearedNotice, setClearedNotice] = useState(false);

  const CURRENT_YEAR = String(new Date().getFullYear());
  const MIN_YEAR = 2020;
  const YEAR_OPTIONS = Array.from(
    { length: Number(CURRENT_YEAR) - MIN_YEAR + 1 },
    (_, idx) => String(Number(CURRENT_YEAR) - idx)
  );

  const handleClearCache = () => {
    queryClient.clear();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="app-shell py-5 lg:py-8 space-y-5 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide uppercase text-white">
          Preferences & Hub
        </h1>
        <p className="text-xs font-mono text-[var(--md-on-surface-variant)] mt-1">
          Customize your PitStop experience, team tracking, and data storage
        </p>
      </div>

      {/* 1. Favorite Constructor Section */}
      <Surface tier="container-high" className="p-5 overflow-hidden relative">
        {favoriteTeamObj && (
          <div
            className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: favoriteTeamObj.color }}
          />
        )}

        <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-[var(--md-primary)]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              My Team & Drivers
            </h2>
          </div>
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="text-xs font-mono text-[var(--md-primary)] hover:underline uppercase tracking-wider cursor-pointer"
          >
            {favoriteTeam ? "Change Team" : "Select Team"}
          </button>
        </div>

        <div className="pt-4">
          {favoriteTeamObj ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-mono font-black text-lg shadow-md border"
                  style={{
                    backgroundColor: `${favoriteTeamObj.color}25`,
                    borderColor: `${favoriteTeamObj.color}60`,
                    color: favoriteTeamObj.color,
                  }}
                >
                  {favoriteTeamObj.code}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {favoriteTeamObj.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-[var(--md-on-surface-variant)]">
                    {favoriteTeamObj.drivers.map((d) => (
                      <span
                        key={d.number}
                        className="px-2 py-0.5 rounded-[var(--shape-xs)] bg-white/5 border border-white/5"
                      >
                        #{d.number} {d.name} ({d.acronym})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs font-mono text-[var(--md-on-surface-variant)]">
                NO FAVORITE TEAM SELECTED
              </p>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="px-4 py-2 rounded-[var(--shape-sm)] bg-[var(--md-primary)] text-black font-mono font-bold text-xs uppercase tracking-wider"
              >
                Choose Constructor
              </button>
            </div>
          )}
        </div>
      </Surface>

      {/* 2. Race Experience Settings */}
      <Surface tier="container" className="p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white pb-2.5 border-b border-white/5">
          Race Experience
        </h2>

        {/* Spoiler Mode Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--shape-sm)] bg-white/5 border border-white/10 flex items-center justify-center text-[var(--md-on-surface-variant)]">
              {spoilerMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Spoiler-Free Mode</div>
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                Mask race winner and podium results behind a tap-to-reveal overlay
              </div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={spoilerMode}
            onClick={() => setSpoilerMode(!spoilerMode)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              spoilerMode ? "bg-[var(--md-primary)]" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                spoilerMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Season Selector */}
        <div className="flex items-center justify-between py-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--shape-sm)] bg-white/5 border border-white/10 flex items-center justify-center text-[var(--md-on-surface-variant)]">
              <Calendar size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Active Season</div>
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                Default championship calendar and driver standings year
              </div>
            </div>
          </div>

          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
            className="bg-[var(--md-surface-container-high)] border border-[var(--md-outline)] text-white font-mono text-xs font-bold px-3 py-1.5 rounded-[var(--shape-sm)] outline-none cursor-pointer"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y} Season
              </option>
            ))}
          </select>
        </div>
      </Surface>

      {/* 3. Theme Selector */}
      <Surface tier="container" className="p-5 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white pb-2.5 border-b border-white/5">
          Appearance & Theme
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            const isSelected = themeMode === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setThemeMode(theme.id)}
                className={`flex items-center gap-2.5 p-3 rounded-[var(--shape-sm)] border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--md-primary)]/15 border-[var(--md-primary)] text-white font-bold"
                    : "bg-white/[0.02] border-white/5 text-[var(--md-on-surface-variant)] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon size={15} className={isSelected ? "text-[var(--md-primary)]" : ""} />
                <span className="text-xs font-mono">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </Surface>

      {/* 4. Quick Directory Links */}
      <Surface tier="container" className="p-2 divide-y divide-white/5">
        <Link
          to="/drivers"
          className="flex items-center justify-between p-3.5 hover:bg-white/[0.03] transition-colors rounded-[var(--shape-sm)] text-[var(--md-on-surface-variant)] hover:text-white"
        >
          <div className="flex items-center gap-3">
            <Users size={16} className="text-[var(--md-primary)]" />
            <div>
              <div className="text-xs font-bold text-white font-mono">Driver Personnel Directory</div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                Browse detailed driver bios, career statistics, and numbers
              </div>
            </div>
          </div>
          <ChevronRight size={14} />
        </Link>

        <Link
          to="/archives"
          className="flex items-center justify-between p-3.5 hover:bg-white/[0.03] transition-colors rounded-[var(--shape-sm)] text-[var(--md-on-surface-variant)] hover:text-white"
        >
          <div className="flex items-center gap-3">
            <Archive size={16} className="text-[var(--md-primary)]" />
            <div>
              <div className="text-xs font-bold text-white font-mono">Full Season Archives</div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                Historical Grand Prix timelines and circuit specs from 2020 onwards
              </div>
            </div>
          </div>
          <ChevronRight size={14} />
        </Link>
      </Surface>

      {/* 5. Performance & Data Storage */}
      <Surface tier="container" className="p-5 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white pb-2.5 border-b border-white/5">
          Storage & Performance
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="text-xs font-bold text-white">Local Data Cache</div>
            <div className="text-[11px] text-[var(--md-on-surface-variant)]">
              PitStop caches OpenF1 telemetry and Jolpica standings in browser storage for instant loading.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-[var(--shape-sm)] bg-white/5 border border-white/10 text-white font-mono text-xs hover:bg-white/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Syncing..." : "Sync Fresh Data"}
            </button>

            <button
              onClick={handleClearCache}
              className="px-3.5 py-2 rounded-[var(--shape-sm)] bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs hover:bg-red-500/20 cursor-pointer"
            >
              {clearedNotice ? "Cache Cleared!" : "Clear Cache"}
            </button>
          </div>
        </div>
      </Surface>

      <TeamSelectorModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
    </div>
  );
};

export default ProfilePage;
