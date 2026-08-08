import React, { useMemo, useState } from "react";
import { Loader2, SlidersHorizontal, Trophy, Award, TrendingUp } from "lucide-react";

import ProgressionChart from "./ProgressionChart";
import { useDriverStandings } from "./useDriverStandings";
import { useConstructorStandings } from "./useConstructorStandings";
import { useRaceResults } from "./useRaceResults";
import { useDriverRegistry } from "../../common/drivers/useDriverRegistry";
import PageShell from "../ui/PageShell";
import Surface from "../ui/Surface";
import DataTable from "../ui/DataTable";
import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "../ui/CountryFlag";
import DataStatusBanner from "../ui/DataStatusBanner";
import { getTeamColorBorder } from "../../common/utils/colors";
import { teamNameToColor } from "../../common/drivers/driverRegistry";

/* ── ToggleBar ───────────────────────────────────────────── */
const ToggleBar = ({ activeTab, setActiveTab }) => (
  <div style={{ display: "flex", gap: "0.25rem" }}>
    {[
      { key: "drivers", label: "DRIVER STANDINGS" },
      { key: "constructors", label: "CONSTRUCTOR STANDINGS" },
    ].map((tab) => {
      const active = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: "0.4rem 0.8rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: active ? 700 : 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            borderRadius: "var(--shape-xs)",
            border: active
              ? "1px solid var(--md-primary)"
              : "1px solid rgba(255, 255, 255, 0.08)",
            background: active
              ? "rgba(0, 229, 200, 0.08)"
              : "var(--md-surface-container-high)",
            color: active ? "var(--md-primary)" : "rgba(255, 255, 255, 0.8)",
            cursor: "pointer",
            transition: "all 100ms ease",
            outline: "none",
          }}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

const ScoreCardPage = ({ year }) => {
  const [activeTab, setActiveTab] = useState("drivers");
  const scoreYear = year || String(new Date().getFullYear());

  const { data: driverStandings, dataMeta: driverMeta, isLoading: standingsLoading, isError: standingsError, error: standingsErrObj } = useDriverStandings(scoreYear);
  const { data: constructorStandings, dataMeta: constructorMeta, isLoading: constructorsLoading, isError: constructorsError, error: constructorsErrObj } = useConstructorStandings(scoreYear);
  const { data: raceResults, dataMeta: raceMetaData, isLoading: resultsLoading, isError: resultsError, error: resultsErrObj } = useRaceResults(scoreYear);
  const { data: seasonDrivers } = useDriverRegistry(null, null, { year: scoreYear });

  const [h2hDriver1, setH2hDriver1] = useState(null);
  const [h2hDriver2, setH2hDriver2] = useState(null);
  const [simAdded1, setSimAdded1] = useState(25); // Default P1 simulated
  const [simAdded2, setSimAdded2] = useState(18); // Default P2 simulated

  const driversById = useMemo(() => {
    const map = new Map();
    (seasonDrivers || []).forEach((d) => {
      if (d.driverId) map.set(d.driverId, d);
    });
    return map;
  }, [seasonDrivers]);

  const rounds = useMemo(() => {
    if (!raceResults?.length) return [];
    return [...raceResults]
      .sort((a, b) => Number(a.round) - Number(b.round))
      .map((race) => ({ round: race.round, label: race.raceName?.split(" ")[0] || `R${race.round}` }));
  }, [raceResults]);

  const progression = useMemo(() => {
    const driverMap = new Map();
    const constructorMap = new Map();
    if (!raceResults?.length) return { driverMap, constructorMap };

    const sortedRaces = [...raceResults].sort((a, b) => Number(a.round) - Number(b.round));
    sortedRaces.forEach((race, raceIndex) => {
      (race.Results || []).forEach((result) => {
        const points = Number(result.points || 0);
        const driverId = result?.Driver?.driverId;
        const constructorId = result?.Constructor?.constructorId;
        if (driverId) {
          if (!driverMap.has(driverId)) driverMap.set(driverId, Array(raceIndex + 1).fill(0));
          const series = driverMap.get(driverId);
          series[raceIndex] = (series[raceIndex - 1] || 0) + points;
        }
        if (constructorId) {
          if (!constructorMap.has(constructorId)) constructorMap.set(constructorId, Array(raceIndex + 1).fill(0));
          const series = constructorMap.get(constructorId);
          series[raceIndex] = (series[raceIndex - 1] || 0) + points;
        }
      });
    });
    return { driverMap, constructorMap };
  }, [raceResults]);

  const leaderPoints = Number(driverStandings?.[0]?.points || 0);

  const driverRows = useMemo(() => {
    if (!driverStandings?.length) return [];
    return driverStandings.map((row) => {
      const id = row.Driver?.driverId;
      const enriched = driversById.get(id);
      return {
        id,
        position: row.position,
        driver: `${row.Driver?.givenName || ""} ${row.Driver?.familyName || ""}`.trim(),
        enriched,
        constructor: row.Constructors?.[0]?.name || "-",
        team_colour: enriched?.team_colour || teamNameToColor(row.Constructors?.[0]?.name),
        points: Number(row.points || 0),
        wins: Number(row.wins || 0),
        gap: leaderPoints - Number(row.points || 0),
      };
    });
  }, [driverStandings, driversById, leaderPoints]);

  const constructorRows = useMemo(() => {
    if (!constructorStandings?.length) return [];
    return constructorStandings.map((row) => ({
      id: row.Constructor?.constructorId,
      position: row.position,
      constructor: row.Constructor?.name || "-",
      team_colour: teamNameToColor(row.Constructor?.name),
      points: Number(row.points || 0),
      wins: Number(row.wins || 0),
    }));
  }, [constructorStandings]);

  const driverSeries = useMemo(
    () =>
      driverRows.map((row, idx) => {
        const raw = progression.driverMap.get(row.id) || [];
        const points = raw.length ? [...raw] : [];
        if (points.length) points[points.length - 1] = row.points;
        return {
          id: row.id,
          name: row.driver,
          points,
          color: idx === 0
            ? "var(--md-primary)"
            : `color-mix(in srgb, var(--md-on-surface-variant) ${Math.max(40, 90 - idx * 8)}%, transparent)`,
        };
      }),
    [driverRows, progression.driverMap]
  );

  const teamSeries = useMemo(
    () =>
      constructorRows.map((row, idx) => {
        const raw = progression.constructorMap.get(row.id) || [];
        const points = raw.length ? [...raw] : [];
        if (points.length) points[points.length - 1] = row.points;
        return {
          id: row.id,
          name: row.constructor,
          points,
          color: idx === 0
            ? "var(--md-primary)"
            : `color-mix(in srgb, var(--md-on-surface-variant) ${Math.max(40, 90 - idx * 8)}%, transparent)`,
        };
      }),
    [constructorRows, progression.constructorMap]
  );

  const isLoading = standingsLoading || constructorsLoading || resultsLoading;
  const isError = standingsError || constructorsError || resultsError;
  const hasAnyData = Boolean(driverRows.length || constructorRows.length);
  const errorMessage = standingsErrObj?.message || constructorsErrObj?.message || resultsErrObj?.message || "Unable to load standings";

  const combinedMeta = useMemo(() => {
    const metas = [driverMeta, constructorMeta, raceMetaData].filter(Boolean);
    if (!metas.length) return null;
    return {
      isStale: metas.some((m) => m?.isStale),
      warning: metas.map((m) => m?.warning).find(Boolean) || (isError ? errorMessage : null),
      source: metas.map((m) => m?.source).find(Boolean) || null,
      fetchedAt: metas.map((m) => m?.fetchedAt).find(Boolean) || null,
    };
  }, [driverMeta, constructorMeta, raceMetaData, isError, errorMessage]);

  // Premium grid table formatting
  const driverColumns = [
    {
      key: "position",
      label: "#",
      render: (row) => (
        <span className="font-mono font-bold text-[var(--md-on-surface-variant)]">
          {row.position}
        </span>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <DriverAvatar driver={row.enriched || { full_name: row.driver }} size="sm" variant="circle" />
          <span className="font-display font-semibold text-white truncate">{row.driver}</span>
          <CountryFlag countryCode={row.enriched?.country_code} size="sm" />
        </div>
      ),
    },
    {
      key: "constructor",
      label: "Team",
      render: (row) => (
        <span style={{ color: getTeamColorBorder(row.team_colour), fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 600 }}>
          {row.constructor}
        </span>
      ),
    },
    {
      key: "gap",
      label: "Gap",
      align: "text-right",
      render: (row) => (
        <span className="font-mono text-[var(--md-on-surface-variant)]">
          {row.gap === 0 ? "—" : `-${row.gap}`}
        </span>
      ),
    },
    {
      key: "points",
      label: "Pts",
      align: "text-right",
      render: (row) => (
        <span className="font-mono font-bold text-[var(--md-primary)]">
          {row.points}
        </span>
      ),
    },
    {
      key: "wins",
      label: "Wins",
      align: "text-right",
      render: (row) => (
        <span className="font-mono text-white">
          {row.wins}
        </span>
      ),
    },
  ];

  const constructorColumns = [
    {
      key: "position",
      label: "#",
      render: (row) => (
        <span className="font-mono font-bold text-[var(--md-on-surface-variant)]">
          {row.position}
        </span>
      ),
    },
    {
      key: "constructor",
      label: "Constructor",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2" style={{ backgroundColor: getTeamColorBorder(row.team_colour), borderRadius: "1px" }} />
          <span className="font-display font-bold text-white">{row.constructor}</span>
        </div>
      ),
    },
    {
      key: "points",
      label: "Pts",
      align: "text-right",
      render: (row) => (
        <span className="font-mono font-bold text-[var(--md-primary)]">
          {row.points}
        </span>
      ),
    },
    {
      key: "wins",
      label: "Wins",
      align: "text-right",
      render: (row) => (
        <span className="font-mono text-white">
          {row.wins}
        </span>
      ),
    },
  ];

  const d1 = useMemo(() => driverRows.find((r) => r.id === h2hDriver1) || driverRows[0], [driverRows, h2hDriver1]);
  const d2 = useMemo(() => driverRows.find((r) => r.id === h2hDriver2) || driverRows[1], [driverRows, h2hDriver2]);

  // Reactive simulated point values
  const simPoints1 = (d1?.points ?? 0) + simAdded1;
  const simPoints2 = (d2?.points ?? 0) + simAdded2;
  const simGap = Math.abs(simPoints1 - simPoints2);

  return (
    <PageShell title={null} subtitle={null}>
      <DataStatusBanner meta={combinedMeta} />

      {/* Redesigned Standings Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "2rem",
        marginTop: "0.5rem",
      }}>
        <div style={{ flex: "1 1 300px" }}>
          {/* Slanted badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(0, 229, 200, 0.08)",
            borderLeft: "3px solid var(--md-primary)",
            padding: "0.25rem 1rem 0.25rem 0.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "var(--md-primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
            marginBottom: "0.6rem",
          }}>
            CHAMPIONSHIP STANDINGS {scoreYear}
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.25rem",
            fontWeight: 900,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "0.04em",
          }}>
            SEASON STANDINGS
          </h1>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--md-on-surface-variant)",
            marginTop: "0.5rem",
            lineHeight: 1.5,
            maxWidth: "520px",
          }}>
            Constructor and Driver championship standings leaderboards, detailed round-by-round progression graphs, and simulated battle station outcomes.
          </p>
        </div>

        {/* Right column standings selector toggle */}
        <ToggleBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {isLoading && (
        <Surface tier="container" className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--md-primary)] opacity-80" />
          <span className="ml-2 font-mono text-sm text-[var(--md-on-surface-variant)]">Loading standings classifications…</span>
        </Surface>
      )}

      {isError && !hasAnyData && (
        <Surface tier="container" className="p-6 text-sm text-[var(--danger)]">{errorMessage}</Surface>
      )}

      {!isLoading && hasAnyData && (
        <div className="space-y-6 md3-content-auto">
          {/* Driver Battle Station Head-to-Head Simulator (Only on Drivers tab) */}
          {activeTab === "drivers" && driverRows.length >= 2 && (
            <Surface tier="container-high" style={{ padding: "1.25rem", borderRadius: "var(--shape-md)" }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  HEAD-TO-HEAD COMPARISON
                </h3>
                <span className="text-xs font-mono text-[var(--md-on-surface-variant)] uppercase">
                  SIMULATION SETTINGS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Driver A Selector */}
                <div className="p-4 bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)]" style={{ borderLeft: `4px solid ${getTeamColorBorder(d1?.team_colour)}`, borderRadius: "var(--shape-md)" }}>
                  <label className="block text-[11px] font-mono text-[var(--md-on-surface-variant)] uppercase mb-1">DRIVER A</label>
                  <select
                    value={d1?.id || ""}
                    onChange={(e) => setH2hDriver1(e.target.value)}
                    className="w-full h-10 bg-[var(--md-surface-container-high)] border border-[var(--md-outline)] font-display font-bold text-white px-3"
                    style={{ borderRadius: "var(--shape-xs)", outline: "none", cursor: "pointer" }}
                  >
                    {driverRows.map((r) => (
                      <option key={r.id} value={r.id}>{r.driver} ({r.constructor})</option>
                    ))}
                  </select>

                  <div className="mt-3 flex items-center justify-between font-mono text-[var(--md-on-surface-variant)]">
                    <span>PTS: <strong className="text-white font-mono">{d1?.points}</strong></span>
                    <span>WINS: <strong className="text-amber-400 font-mono">{d1?.wins}</strong></span>
                    <span>POS: <strong className="text-white font-mono">P{d1?.position}</strong></span>
                  </div>
                </div>

                {/* Driver B Selector */}
                <div className="p-4 bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)]" style={{ borderLeft: `4px solid ${getTeamColorBorder(d2?.team_colour)}`, borderRadius: "var(--shape-md)" }}>
                  <label className="block text-[11px] font-mono text-[var(--md-on-surface-variant)] uppercase mb-1">DRIVER B</label>
                  <select
                    value={d2?.id || ""}
                    onChange={(e) => setH2hDriver2(e.target.value)}
                    className="w-full h-10 bg-[var(--md-surface-container-high)] border border-[var(--md-outline)] font-display font-bold text-white px-3"
                    style={{ borderRadius: "var(--shape-xs)", outline: "none", cursor: "pointer" }}
                  >
                    {driverRows.map((r) => (
                      <option key={r.id} value={r.id}>{r.driver} ({r.constructor})</option>
                    ))}
                  </select>

                  <div className="mt-3 flex items-center justify-between font-mono text-[var(--md-on-surface-variant)]">
                    <span>PTS: <strong className="text-white font-mono">{d2?.points}</strong></span>
                    <span>WINS: <strong className="text-amber-400 font-mono">{d2?.wins}</strong></span>
                    <span>POS: <strong className="text-white font-mono">P{d2?.position}</strong></span>
                  </div>
                </div>
              </div>

              {/* Point Finish Selection */}
              <div className="mt-4 pt-4 border-t border-[var(--md-outline-variant)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center justify-between bg-black/40 p-2.5 border border-[var(--md-outline-variant)]" style={{ borderRadius: "var(--shape-sm)" }}>
                    <span>{d1?.driver} hypothetical finish:</span>
                    <select
                      className="bg-[var(--md-surface-container-high)] text-white px-2 py-1 font-bold border border-[var(--md-outline)]"
                      style={{ borderRadius: "var(--shape-xs)", outline: "none", cursor: "pointer" }}
                      value={simAdded1}
                      onChange={(e) => setSimAdded1(Number(e.target.value))}
                    >
                      <option value="25">P1 (+25 pts)</option>
                      <option value="18">P2 (+18 pts)</option>
                      <option value="15">P3 (+15 pts)</option>
                      <option value="12">P4 (+12 pts)</option>
                      <option value="10">P5 (+10 pts)</option>
                      <option value="8">P6 (+8 pts)</option>
                      <option value="6">P7 (+6 pts)</option>
                      <option value="4">P8 (+4 pts)</option>
                      <option value="2">P9 (+2 pts)</option>
                      <option value="1">P10 (+1 pts)</option>
                      <option value="0">DNF / P11+ (+0 pts)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-2.5 border border-[var(--md-outline-variant)]" style={{ borderRadius: "var(--shape-sm)" }}>
                    <span>{d2?.driver} hypothetical finish:</span>
                    <select
                      className="bg-[var(--md-surface-container-high)] text-white px-2 py-1 font-bold border border-[var(--md-outline)]"
                      style={{ borderRadius: "var(--shape-xs)", outline: "none", cursor: "pointer" }}
                      value={simAdded2}
                      onChange={(e) => setSimAdded2(Number(e.target.value))}
                    >
                      <option value="25">P1 (+25 pts)</option>
                      <option value="18">P2 (+18 pts)</option>
                      <option value="15">P3 (+15 pts)</option>
                      <option value="12">P4 (+12 pts)</option>
                      <option value="10">P5 (+10 pts)</option>
                      <option value="8">P6 (+8 pts)</option>
                      <option value="6">P7 (+6 pts)</option>
                      <option value="4">P8 (+4 pts)</option>
                      <option value="2">P9 (+2 pts)</option>
                      <option value="1">P10 (+1 pts)</option>
                      <option value="0">DNF / P11+ (+0 pts)</option>
                    </select>
                  </div>
                </div>

                {/* Simulated Outcome Display */}
                <div style={{
                  marginTop: "0.875rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(0, 229, 200, 0.05)",
                  border: "1px solid rgba(0, 229, 200, 0.2)",
                  borderRadius: "var(--shape-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--md-on-surface-variant)",
                }}>
                  <span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>SIMULATION FORECAST</span>
                  <div>
                    <span style={{ color: getTeamColorBorder(d1?.team_colour), fontWeight: 700 }}>{d1?.driver}</span>: <strong className="text-white text-sm font-mono">{simPoints1} PTS</strong>
                    <span className="mx-2 text-[var(--md-outline)]">|</span>
                    <span style={{ color: getTeamColorBorder(d2?.team_colour), fontWeight: 700 }}>{d2?.driver}</span>: <strong className="text-white text-sm font-mono">{simPoints2} PTS</strong>
                    <span className="mx-2 text-[var(--md-outline)]">|</span>
                    <span style={{ color: "var(--md-primary)", fontWeight: 700 }}>GAP: {simGap} PTS</span>
                  </div>
                </div>
              </div>
            </Surface>
          )}

          {/* Standings Table */}
          <DataTable
            columns={activeTab === "drivers" ? driverColumns : constructorColumns}
            rows={activeTab === "drivers" ? driverRows : constructorRows}
            getRowKey={(row) => row.id}
          />

          {/* Season Progression Chart */}
          <ProgressionChart
            title={activeTab === "drivers" ? "Drivers Championship Progression" : "Constructors Championship Progression"}
            rounds={rounds}
            series={activeTab === "drivers" ? driverSeries : teamSeries}
            collapsible
          />
        </div>
      )}
    </PageShell>
  );
};

export default ScoreCardPage;
