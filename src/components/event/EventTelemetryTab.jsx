import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Activity, AlertTriangle, RefreshCw, Zap, Clock, Database } from "lucide-react";

import Surface from "../ui/Surface";
import LoadingState from "../ui/LoadingState";
import DriverSelectorPanel from "./DriverSelectorPanel";
import TelemetryChartPanel from "./TelemetryChartPanel";
import { useCarData } from "./useCarData";
import { useLaps } from "../Common/useLaps";

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Format seconds → m:ss.mmm */
const formatLapTime = (secs) => {
  if (!secs || !Number.isFinite(secs)) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const whole = Math.floor(s);
  const ms = Math.round((s - whole) * 1000);
  return `${m}:${whole.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
};

/** Estimate data point count at 3.7 Hz for a lap of `secs` duration */
const estimatePts = (secs) =>
  secs && Number.isFinite(secs) ? Math.round(secs * 3.7) : null;

/** Build an ISO timestamp string with a safety buffer applied */
const isoWithBuffer = (ms, bufferMs) => new Date(ms + bufferMs).toISOString();

// ── Sub-components ────────────────────────────────────────────────────────────

/** Animated progress / loading card shown while fetching car data */
const FetchingCard = ({ acronym, teamColor, isWaiting }) => (
  <Surface tier="container" className="p-4">
    <div className="flex items-center gap-3">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
        style={{ backgroundColor: teamColor }}
      />
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold text-white">
          {isWaiting ? `WAITING · DOWNLOADING DRIVER A FIRST` : `DOWNLOADING TELEMETRY · ${acronym}`}
        </p>
        <p className="font-mono text-[9px] text-[var(--md-on-surface-variant)] mt-0.5">
          {isWaiting
            ? "Sequential fetch — driver B loads after A completes to avoid rate limits."
            : "Fetching high-frequency car sensor data from OpenF1 (~3.7 Hz sampling)…"}
        </p>
      </div>
    </div>
    {/* Indeterminate progress bar */}
    <div
      className="mt-3 h-0.5 bg-white/5 overflow-hidden"
      style={{ borderRadius: "1px" }}
    >
      <div
        className="h-full w-1/3 animate-[slide_1.8s_ease-in-out_infinite]"
        style={{
          backgroundColor: teamColor,
          animation: "slide 1.8s ease-in-out infinite",
        }}
      />
    </div>
    {/* keyframes injected inline (tiny, Tailwind doesn't expose arbitrary keyframes) */}
    <style>{`@keyframes slide{0%{transform:translateX(-300%)}100%{transform:translateX(400%)}}`}</style>
  </Surface>
);

/** Error card with rate-limit awareness */
const ErrorCard = ({ error, acronym, onRetry }) => {
  const isRateLimited = error?.code === "RATE_LIMITED";
  const retryAfterSec = error?.retryAfterMs ? Math.ceil(error.retryAfterMs / 1000) : null;

  return (
    <Surface tier="container" className="p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={16}
          className={`shrink-0 mt-0.5 ${isRateLimited ? "text-amber-400" : "text-red-400"}`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-bold text-white">
            {isRateLimited ? "API RATE LIMITED" : "FETCH ERROR"} · {acronym}
          </p>
          <p className="font-mono text-[9px] text-[var(--md-on-surface-variant)] mt-0.5">
            {isRateLimited
              ? `OpenF1 rate limit reached.${retryAfterSec ? ` Retry in ${retryAfterSec}s.` : " Please wait a moment."}`
              : error?.message ?? "Failed to load telemetry data. Check your connection."}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1 font-mono text-[9px] text-[var(--md-primary)] hover:text-white transition-colors px-2 py-1 border border-[var(--md-primary)]/20 hover:border-white/20"
          style={{ borderRadius: "var(--shape-xs)" }}
        >
          <RefreshCw size={9} />
          RETRY
        </button>
      </div>
    </Surface>
  );
};

/** Stat pill shown in chart header */
const StatPill = ({ icon: Icon, value, label }) => (
  <span className="inline-flex items-center gap-1 font-mono text-[9px] text-[var(--md-on-surface-variant)]">
    <Icon size={9} className="shrink-0 text-[var(--md-primary)]" />
    <span className="font-bold text-white">{value}</span>
    {label && <span>{label}</span>}
  </span>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * EventTelemetryTab
 *
 * Orchestrates:
 *   1. Driver selection (up to 2 via DriverSelectorPanel)
 *   2. Lap selection (defaults to the fastest lap per driver A)
 *   3. Sequential car data fetching with progressive loading UX
 *   4. TelemetryChartPanel rendering with sync crosshair
 *
 * Props:
 *   sessionKey       — OpenF1 session_key for the race/qualifying session
 *   allDrivers       — enriched driver objects from EventDetails
 *   year             — race season year (for legacy-year guard)
 */
const EventTelemetryTab = ({ sessionKey, allDrivers = [], year }) => {
  const [driverANum, setDriverANum] = useState(null);
  const [driverBNum, setDriverBNum] = useState(null);
  const [selectedLapNum, setSelectedLapNum] = useState(null);
  const [retryKeyA, setRetryKeyA] = useState(0);
  const [retryKeyB, setRetryKeyB] = useState(0);

  // ── Laps data (small payload — needed for lap timestamps & list) ────────────
  const { data: lapsData = [], isLoading: lapsLoading } = useLaps(sessionKey, {
    enabled: Boolean(sessionKey),
  });

  // Group laps by driver_number, sorted by lap_number
  const lapsByDriver = useMemo(() => {
    const map = {};
    lapsData.forEach((lap) => {
      const num = Number(lap.driver_number);
      if (!map[num]) map[num] = [];
      map[num].push(lap);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => Number(a.lap_number) - Number(b.lap_number))
    );
    return map;
  }, [lapsData]);

  // Laps belonging to driver A
  const driverALaps = useMemo(
    () => (driverANum ? lapsByDriver[driverANum] ?? [] : []),
    [driverANum, lapsByDriver]
  );

  // Fastest lap for driver A
  const fastestLapA = useMemo(
    () =>
      driverALaps.reduce((best, lap) => {
        const d = Number(lap.lap_duration);
        if (!d) return best;
        return !best || d < Number(best.lap_duration) ? lap : best;
      }, null),
    [driverALaps]
  );

  // Auto-select fastest lap when driver A is first chosen
  useEffect(() => {
    if (fastestLapA && selectedLapNum === null) {
      setSelectedLapNum(Number(fastestLapA.lap_number));
    }
  }, [fastestLapA, selectedLapNum]);

  // Clear lap selection when driver A is removed
  useEffect(() => {
    if (!driverANum) setSelectedLapNum(null);
  }, [driverANum]);

  // Resolved selected lap record
  const selectedLap = useMemo(
    () =>
      selectedLapNum != null
        ? driverALaps.find((l) => Number(l.lap_number) === selectedLapNum) ?? null
        : null,
    [selectedLapNum, driverALaps]
  );

  // ── Date window for car_data filtering ─────────────────────────────────────
  const { dateFrom, dateTo, lapStartMs } = useMemo(() => {
    const startStr = selectedLap?.date_start;
    if (!startStr) return {};
    const startMs = new Date(startStr).getTime();
    if (!Number.isFinite(startMs)) return {};

    const dur = Number(selectedLap.lap_duration) || 120;
    const endMs = startMs + (dur + 5) * 1000; // +5 s buffer

    return {
      dateFrom: isoWithBuffer(startMs, -500),  // -0.5 s before lap trigger
      dateTo:   isoWithBuffer(endMs,   0),
      lapStartMs: startMs,
    };
  }, [selectedLap]);

  const hasLapWindow = Boolean(dateFrom && dateTo && lapStartMs);

  // ── Car data fetches ────────────────────────────────────────────────────────
  // Driver A — always first
  const {
    data: carDataA = [],
    isLoading: loadingA,
    isFetching: fetchingA,
    isError: errorA,
    error: errObjA,
    refetch: refetchA,
  } = useCarData(sessionKey, driverANum, {
    dateFrom,
    dateTo,
    enabled: Boolean(sessionKey) && Boolean(driverANum) && hasLapWindow,
    // retryKeyA forces a re-fetch when user hits "Retry"
    queryKey: ["carData", String(sessionKey), String(driverANum ?? ""), dateFrom ?? "", dateTo ?? "", retryKeyA],
  });

  // Driver B — sequential: only start after A finishes (not loading/fetching)
  const driverBReady = Boolean(driverBNum) && !loadingA && !fetchingA;
  const {
    data: carDataB = [],
    isLoading: loadingB,
    isFetching: fetchingB,
    isError: errorB,
    error: errObjB,
    refetch: refetchB,
  } = useCarData(sessionKey, driverBNum, {
    dateFrom,
    dateTo,
    enabled: Boolean(sessionKey) && driverBReady && hasLapWindow,
    queryKey: ["carData", String(sessionKey), String(driverBNum ?? ""), dateFrom ?? "", dateTo ?? "", retryKeyB],
  });

  // ── Driver info objects ─────────────────────────────────────────────────────
  const driverAObj = allDrivers.find((d) => d.driver_number === driverANum) ?? null;
  const driverBObj = allDrivers.find((d) => d.driver_number === driverBNum) ?? null;

  const colorA = driverAObj?.team_colour ? `#${driverAObj.team_colour}` : "var(--md-primary)";
  const colorB = driverBObj?.team_colour ? `#${driverBObj.team_colour}` : "#fb923c";

  // ── Callbacks ───────────────────────────────────────────────────────────────
  const handleSelectA = useCallback((num) => {
    setDriverANum(num);
    if (!num) {
      setDriverBNum(null);
      setSelectedLapNum(null);
    }
  }, []);

  const handleSelectB = useCallback((num) => {
    setDriverBNum(num);
  }, []);

  const handleLapChange = useCallback((e) => {
    setSelectedLapNum(Number(e.target.value));
  }, []);

  // ── Legacy-year guard ───────────────────────────────────────────────────────
  if (year && Number(year) < 2023) {
    return (
      <Surface tier="container" className="p-8 text-center space-y-3">
        <AlertTriangle size={22} className="mx-auto text-amber-400" />
        <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          TELEMETRY NOT AVAILABLE FOR {year}
        </p>
        <p className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
          OpenF1 car data coverage starts from the 2023 season.
        </p>
      </Surface>
    );
  }

  // ── Derived display states ──────────────────────────────────────────────────
  const isBusyA = loadingA || fetchingA;
  const isBusyB = loadingB || fetchingB;
  const hasDataA = carDataA.length > 0;
  const hasDataB = carDataB.length > 0;
  const bWaitingForA = Boolean(driverBNum) && isBusyA;
  const showCharts = !isBusyA && !errorA && hasDataA && hasLapWindow;

  const estPts = estimatePts(Number(selectedLap?.lap_duration));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* ── Driver Selector ── */}
      <Surface tier="container" className="p-4">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/5">
          <Activity size={13} className="text-[var(--md-primary)] shrink-0" />
          <h3 className="font-mono font-black text-[11px] text-white uppercase tracking-wider">
            DRIVER TELEMETRY
          </h3>
          <span className="ml-auto font-mono text-[9px] text-[var(--md-on-surface-variant)]">
            SELECT UP TO 2 DRIVERS
          </span>
        </div>

        {lapsLoading ? (
          <LoadingState message="Loading session lap data…" />
        ) : (
          <DriverSelectorPanel
            drivers={allDrivers}
            driverA={driverANum}
            driverB={driverBNum}
            onSelectA={handleSelectA}
            onSelectB={handleSelectB}
          />
        )}
      </Surface>

      {/* ── Lap Selector (visible once driver A has laps loaded) ── */}
      {driverANum !== null && driverALaps.length > 0 && (
        <Surface tier="container" className="p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[9px] font-bold text-[var(--md-on-surface-variant)] uppercase tracking-wider shrink-0">
              LAP:
            </span>

            <select
              value={selectedLapNum ?? ""}
              onChange={handleLapChange}
              className="bg-[var(--md-surface-container-high)] border border-[var(--md-outline-variant)] text-white font-mono text-[11px] px-3 py-2 outline-none focus:border-[var(--md-primary)]/50 cursor-pointer transition-all hover:bg-white/[0.04]"
              style={{ borderRadius: "var(--shape-sm)", minHeight: "44px" }}
            >
              {driverALaps.map((lap) => {
                const n = Number(lap.lap_number);
                const isFastest = fastestLapA?.lap_number === lap.lap_number;
                const t = formatLapTime(Number(lap.lap_duration));
                return (
                  <option key={n} value={n}>
                    {`Lap ${n}${isFastest ? " ★ FASTEST" : ""}${t ? `  ·  ${t}` : ""}`}
                  </option>
                );
              })}
            </select>

            {/* Inline stats */}
            <div className="flex items-center gap-3 flex-wrap">
              {estPts && (
                <StatPill icon={Database} value={`~${estPts}`} label="pts" />
              )}
              <StatPill icon={Zap} value="3.7 Hz" />
              {selectedLap?.lap_duration && (
                <StatPill
                  icon={Clock}
                  value={formatLapTime(Number(selectedLap.lap_duration))}
                />
              )}
            </div>
          </div>
        </Surface>
      )}

      {/* ── Empty / prompt state ── */}
      {!driverANum && (
        <Surface tier="container" className="py-12 text-center">
          <Activity
            size={30}
            className="mx-auto mb-3 text-[var(--md-primary)]/20"
          />
          <p className="font-mono text-[11px] font-bold text-[var(--md-on-surface-variant)] uppercase tracking-widest">
            SELECT A DRIVER TO LOAD TELEMETRY
          </p>
          <p className="font-mono text-[9px] text-[var(--md-on-surface-variant)]/50 mt-1.5">
            Add a second driver to enable side-by-side compare mode
          </p>
        </Surface>
      )}

      {/* ── Driver A loading ── */}
      {driverANum !== null && isBusyA && (
        <FetchingCard
          acronym={driverAObj?.name_acronym ?? `#${driverANum}`}
          teamColor={colorA}
          isWaiting={false}
        />
      )}

      {/* ── Driver A error ── */}
      {errorA && !isBusyA && (
        <ErrorCard
          error={errObjA}
          acronym={driverAObj?.name_acronym ?? `#${driverANum}`}
          onRetry={() => setRetryKeyA((k) => k + 1)}
        />
      )}

      {/* ── Driver B waiting for A ── */}
      {bWaitingForA && (
        <FetchingCard
          acronym={driverBObj?.name_acronym ?? `#${driverBNum}`}
          teamColor={colorB}
          isWaiting={true}
        />
      )}

      {/* ── Driver B loading (A done, B in progress) ── */}
      {driverBNum !== null && !bWaitingForA && isBusyB && (
        <FetchingCard
          acronym={driverBObj?.name_acronym ?? `#${driverBNum}`}
          teamColor={colorB}
          isWaiting={false}
        />
      )}

      {/* ── Driver B error ── */}
      {errorB && !isBusyB && (
        <ErrorCard
          error={errObjB}
          acronym={driverBObj?.name_acronym ?? `#${driverBNum}`}
          onRetry={() => setRetryKeyB((k) => k + 1)}
        />
      )}

      {/* ── No lap window (date_start missing) ── */}
      {driverANum !== null && !isBusyA && !errorA && driverALaps.length > 0 && !hasLapWindow && (
        <Surface tier="container" className="p-4 text-center">
          <p className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
            LAP TIMESTAMP DATA UNAVAILABLE FOR THIS SESSION.
          </p>
          <p className="font-mono text-[9px] text-[var(--md-on-surface-variant)]/50 mt-1">
            OpenF1 may not have timing data for this event.
          </p>
        </Surface>
      )}

      {/* ── Telemetry charts ── */}
      {showCharts && (
        <Surface tier="container-high" className="overflow-hidden">
          {/* Chart header */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              <span className="font-mono text-[10px] font-black text-white uppercase shrink-0">
                LAP {selectedLapNum}
              </span>

              {/* Driver A legend */}
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold shrink-0"
                style={{ color: colorA }}
              >
                <svg width="20" height="2" viewBox="0 0 20 2" fill="none">
                  <line x1="0" y1="1" x2="20" y2="1" stroke={colorA} strokeWidth="2" />
                </svg>
                {driverAObj?.name_acronym ?? `#${driverANum}`}
              </span>

              {/* Driver B legend (only if data arrived) */}
              {driverBNum !== null && !isBusyB && !errorB && hasDataB && (
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold shrink-0"
                  style={{ color: colorB }}
                >
                  <svg width="20" height="2" viewBox="0 0 20 2" fill="none">
                    <line
                      x1="0" y1="1" x2="20" y2="1"
                      stroke={colorB}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  {driverBObj?.name_acronym ?? `#${driverBNum}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {carDataA.length > 0 && (
                <span className="font-mono text-[9px] text-[var(--md-on-surface-variant)]">
                  {carDataA.length} pts · {Math.round(carDataA.length * 1000 / Math.max(Number(selectedLap?.lap_duration ?? 1), 1) / 10) / 100} Hz
                </span>
              )}
            </div>
          </div>

          {/* 6-channel stacked charts */}
          <TelemetryChartPanel
            dataA={carDataA}
            dataB={!isBusyB && !errorB ? carDataB : []}
            driverA={driverAObj}
            driverB={driverBObj}
            lapStartMs={lapStartMs}
          />

          {/* Driver B inline status below charts */}
          {driverBNum !== null && (isBusyA || isBusyB || bWaitingForA) && (
            <div className="px-4 py-2 border-t border-white/5 text-center">
              <span className="font-mono text-[9px] text-[var(--md-on-surface-variant)] animate-pulse uppercase">
                {bWaitingForA
                  ? `QUEUED — ${driverBObj?.name_acronym ?? "B"} LOADS AFTER A`
                  : `DOWNLOADING ${driverBObj?.name_acronym ?? "B"} OVERLAY…`}
              </span>
            </div>
          )}
        </Surface>
      )}
    </div>
  );
};

export default EventTelemetryTab;
