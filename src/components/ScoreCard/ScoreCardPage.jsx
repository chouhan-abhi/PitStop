import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import ProgressionChart from "./ProgressionChart";
import StandingsTable from "./StandingsTable";
import { useDriverStandings } from "./useDriverStandings";
import { useConstructorStandings } from "./useConstructorStandings";
import { useRaceResults } from "./useRaceResults";
import PageShell from "../ui/PageShell";
import Panel from "../ui/Panel";
import StatusPill from "../ui/StatusPill";
import DataStatusBanner from "../ui/DataStatusBanner";

const ScoreCardPage = ({ year }) => {
  const [activeTab, setActiveTab] = useState("drivers");
  const scoreYear = year || String(new Date().getFullYear());

  const {
    data: driverStandings,
    dataMeta: driverMeta,
    isLoading: standingsLoading,
    isError: standingsError,
    error: standingsErrObj,
  } = useDriverStandings(scoreYear);

  const {
    data: constructorStandings,
    dataMeta: constructorMeta,
    isLoading: constructorsLoading,
    isError: constructorsError,
    error: constructorsErrObj,
  } = useConstructorStandings(scoreYear);

  const {
    data: raceResults,
    dataMeta: raceMetaData,
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
  const chartTitle = activeTab === "drivers" ? "Drivers Progression" : "Teams Progression";
  const chartSeries = activeTab === "drivers" ? driverSeries : teamSeries;

  const isLoading = standingsLoading || constructorsLoading || resultsLoading;
  const isError = standingsError || constructorsError || resultsError;
  const hasAnyData = Boolean(driverRows.length || constructorRows.length || raceResults?.length);
  const errorMessage =
    standingsErrObj?.message ||
    constructorsErrObj?.message ||
    resultsErrObj?.message ||
    "Unable to load score card data";
  const combinedMeta = useMemo(() => {
    const metas = [driverMeta, constructorMeta, raceMetaData].filter(Boolean);
    if (!metas.length) return null;
    const stale = metas.some((meta) => meta?.isStale);
    const warning = metas.map((meta) => meta?.warning).find(Boolean) || (isError ? errorMessage : null);
    const source = metas.map((meta) => meta?.source).find(Boolean) || null;
    const fetchedAt = metas.map((meta) => meta?.fetchedAt).find(Boolean) || null;
    return {
      isStale: stale,
      warning,
      source,
      fetchedAt,
    };
  }, [driverMeta, constructorMeta, raceMetaData, isError, errorMessage]);

  return (
    <PageShell
      title="Score Card"
      subtitle={`Standings and progression for ${scoreYear}`}
      meta={`Events loaded: ${raceMeta.raceCount} · Max round: ${raceMeta.maxRound} · Results: ${raceMeta.totalResults}`}
      actions={(
        <StatusPill tone="live">Season Pulse</StatusPill>
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

      <DataStatusBanner meta={combinedMeta} />

      {isError && !hasAnyData && (
        <Panel className="p-6 text-sm text-red-400">{errorMessage}</Panel>
      )}

      {!isLoading && (!isError || hasAnyData) && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1.1fr] gap-4 lg:gap-6">
            <ProgressionChart title={chartTitle} rounds={rounds} series={chartSeries} />
            {activeTab === "drivers" && (
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
            )}
            {activeTab === "constructors" && (
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
            )}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default ScoreCardPage;
