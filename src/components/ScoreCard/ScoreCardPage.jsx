import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import ProgressionChart from "./ProgressionChart";
import StandingsTable from "./StandingsTable";
import { useDriverStandings } from "./useDriverStandings";
import { useConstructorStandings } from "./useConstructorStandings";
import { useRaceResults } from "./useRaceResults";
import PageShell from "../ui/PageShell";
import Panel from "../ui/Panel";
import StatusPill from "../ui/StatusPill";

const YEAR_OPTIONS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

const ScoreCardPage = ({ year }) => {
  const [activeTab, setActiveTab] = useState("drivers");
  const [scoreYear, setScoreYear] = useState(year || "2025");

  useEffect(() => {
    if (year) {
      setScoreYear(year);
    }
  }, [year]);

  const {
    data: driverStandings,
    isLoading: standingsLoading,
    isError: standingsError,
    error: standingsErrObj,
  } = useDriverStandings(scoreYear);

  const {
    data: constructorStandings,
    isLoading: constructorsLoading,
    isError: constructorsError,
    error: constructorsErrObj,
  } = useConstructorStandings(scoreYear);

  const {
    data: raceResults,
    isLoading: resultsLoading,
    isError: resultsError,
    error: resultsErrObj,
  } = useRaceResults(scoreYear);

  const rounds = useMemo(() => {
    if (!raceResults?.length) return [];
    return [...raceResults]
      .sort((a, b) => Number(a.round) - Number(b.round))
      .map((race) => ({
        round: race.round,
        label: race.raceName?.split(" ")[0] || `R${race.round}`,
      }));
  }, [raceResults]);

  const raceMeta = useMemo(() => {
    const raceCount = raceResults?.length || 0;
    const totalResults = raceResults?.reduce(
      (sum, race) => sum + (race.Results?.length || 0),
      0
    );
    const maxRound = raceResults?.reduce(
      (max, race) => Math.max(max, Number(race.round || 0)),
      0
    );
    return { raceCount, totalResults, maxRound };
  }, [raceResults]);

  const progression = useMemo(() => {
    const driverMap = new Map();
    const constructorMap = new Map();

    if (!raceResults?.length) {
      return { driverMap, constructorMap };
    }

    const sortedRaces = [...raceResults].sort(
      (a, b) => Number(a.round) - Number(b.round)
    );

    sortedRaces.forEach((race, raceIndex) => {
      (race.Results || []).forEach((result) => {
        const points = Number(result.points || 0);
        const driverId = result?.Driver?.driverId;
        const constructorId = result?.Constructor?.constructorId;

        if (driverId) {
          if (!driverMap.has(driverId)) {
            driverMap.set(driverId, Array(raceIndex + 1).fill(0));
          }
          const series = driverMap.get(driverId);
          const prev = series[raceIndex - 1] || 0;
          series[raceIndex] = prev + points;
        }

        if (constructorId) {
          if (!constructorMap.has(constructorId)) {
            constructorMap.set(constructorId, Array(raceIndex + 1).fill(0));
          }
          const series = constructorMap.get(constructorId);
          const prev = series[raceIndex - 1] || 0;
          series[raceIndex] = prev + points;
        }
      });
    });

    return { driverMap, constructorMap };
  }, [raceResults]);

  const driverRows = useMemo(() => {
    if (!driverStandings?.length) return [];
    return driverStandings.map((row) => ({
      id: row.Driver?.driverId,
      position: row.position,
      driver: `${row.Driver?.givenName || ""} ${row.Driver?.familyName || ""}`.trim(),
      constructor: row.Constructors?.[0]?.name || "-",
      points: Number(row.points || 0),
      wins: Number(row.wins || 0),
    }));
  }, [driverStandings]);

  const constructorRows = useMemo(() => {
    if (!constructorStandings?.length) return [];
    return constructorStandings.map((row) => ({
      id: row.Constructor?.constructorId,
      position: row.position,
      constructor: row.Constructor?.name || "-",
      points: Number(row.points || 0),
      wins: Number(row.wins || 0),
    }));
  }, [constructorStandings]);

  const driverSeries = useMemo(() => {
    return driverRows.map((row, idx) => {
      const raw = progression.driverMap.get(row.id) || [];
      const points = raw.length ? [...raw] : [];
      if (points.length) {
        points[points.length - 1] = row.points;
      }
      return {
        id: row.id,
        name: row.driver,
        points,
        color: idx === 0 ? "#ff2d2d" : `rgba(255,255,255,${0.68 - idx * 0.08})`,
      };
    });
  }, [driverRows, progression.driverMap]);

  const teamSeries = useMemo(() => {
    return constructorRows.map((row, idx) => {
      const raw = progression.constructorMap.get(row.id) || [];
      const points = raw.length ? [...raw] : [];
      if (points.length) {
        points[points.length - 1] = row.points;
      }
      return {
        id: row.id,
        name: row.constructor,
        points,
        color: idx === 0 ? "#ff2d2d" : `rgba(255,255,255,${0.68 - idx * 0.08})`,
      };
    });
  }, [constructorRows, progression.constructorMap]);

  const isLoading = standingsLoading || constructorsLoading || resultsLoading;
  const isError = standingsError || constructorsError || resultsError;
  const errorMessage =
    standingsErrObj?.message ||
    constructorsErrObj?.message ||
    resultsErrObj?.message ||
    "Unable to load score card data";

  return (
    <PageShell
      title="Score Card"
      subtitle={`Standings and progression for ${scoreYear}`}
      meta={`Events loaded: ${raceMeta.raceCount} · Max round: ${raceMeta.maxRound} · Results: ${raceMeta.totalResults}`}
      actions={(
        <>
          <StatusPill tone="live">Season Pulse</StatusPill>
          <select
            value={scoreYear}
            onChange={(event) => setScoreYear(event.target.value)}
            className="btn btn-ghost !text-[11px] !tracking-[0.1em] !normal-case"
          >
            {YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </>
      )}
    >
      <Panel className="p-1">
        <div className="flex gap-2 p-1">
          {[
            { key: "drivers", label: "Drivers" },
            { key: "constructors", label: "Constructors" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 text-xs font-semibold rounded-xl transition-all uppercase tracking-[0.12em] ${
                activeTab === tab.key
                  ? "bg-red-600/30 text-red-100"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Panel>

      {isLoading && (
        <Panel className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin opacity-60" />
          <span className="ml-2 text-sm opacity-60">Loading data…</span>
        </Panel>
      )}

      {isError && (
        <Panel className="p-6 text-sm text-red-400">{errorMessage}</Panel>
      )}

      {!isLoading && !isError && (
        <>
          {activeTab === "drivers" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1.1fr] gap-4 lg:gap-6">
              <ProgressionChart title="Drivers Progression" rounds={rounds} series={driverSeries} />
              <StandingsTable
                title="Driver Standings"
                columns={[
                  { key: "position", label: "#", align: "text-left" },
                  { key: "driver", label: "Driver" },
                  { key: "constructor", label: "Constructor" },
                  { key: "points", label: "Pts", align: "text-right" },
                  { key: "wins", label: "Wins", align: "text-right" },
                ]}
                rows={driverRows}
              />
            </div>
          )}
          {activeTab === "constructors" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1.1fr] gap-4 lg:gap-6">
              <ProgressionChart title="Teams Progression" rounds={rounds} series={teamSeries} />
              <StandingsTable
                title="Constructor Standings"
                columns={[
                  { key: "position", label: "#", align: "text-left" },
                  { key: "constructor", label: "Constructor" },
                  { key: "points", label: "Pts", align: "text-right" },
                  { key: "wins", label: "Wins", align: "text-right" },
                ]}
                rows={constructorRows}
              />
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};

export default ScoreCardPage;
