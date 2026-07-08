import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import ProgressionChart from "./ProgressionChart";
import { useDriverStandings } from "./useDriverStandings";
import { useConstructorStandings } from "./useConstructorStandings";
import { useRaceResults } from "./useRaceResults";
import { useDriverRegistry } from "../../common/drivers/useDriverRegistry";
import PageShell from "../ui/PageShell";
import Surface from "../ui/Surface";
import Tabs from "../ui/Tabs";
import DataTable from "../ui/DataTable";
import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "../ui/CountryFlag";
import DataStatusBanner from "../ui/DataStatusBanner";
import { getTeamColorBorder } from "../../common/utils/colors";
import { teamNameToColor } from "../../common/drivers/driverRegistry";

const ScoreCardPage = ({ year }) => {
  const [activeTab, setActiveTab] = useState("drivers");
  const scoreYear = year || String(new Date().getFullYear());

  const { data: driverStandings, dataMeta: driverMeta, isLoading: standingsLoading, isError: standingsError, error: standingsErrObj } = useDriverStandings(scoreYear);
  const { data: constructorStandings, dataMeta: constructorMeta, isLoading: constructorsLoading, isError: constructorsError, error: constructorsErrObj } = useConstructorStandings(scoreYear);
  const { data: raceResults, dataMeta: raceMetaData, isLoading: resultsLoading, isError: resultsError, error: resultsErrObj } = useRaceResults(scoreYear);
  const { data: seasonDrivers } = useDriverRegistry(null, null, { year: scoreYear });

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

  const driverColumns = [
    { key: "position", label: "#", render: (row) => row.position },
    {
      key: "driver",
      label: "Driver",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <DriverAvatar driver={row.enriched || { full_name: row.driver }} size="md" variant="portrait" />
          <span className="truncate">{row.driver}</span>
          <CountryFlag countryCode={row.enriched?.country_code} size="lg" />
        </div>
      ),
    },
    { key: "constructor", label: "Team", render: (row) => <span style={{ color: getTeamColorBorder(row.team_colour) }}>{row.constructor}</span> },
    { key: "gap", label: "Gap", align: "text-right", render: (row) => (row.gap === 0 ? "—" : `-${row.gap}`) },
    { key: "points", label: "Pts", align: "text-right", render: (row) => <span className="font-mono font-semibold">{row.points}</span> },
    { key: "wins", label: "Wins", align: "text-right", render: (row) => row.wins },
  ];

  const constructorColumns = [
    { key: "position", label: "#", render: (row) => row.position },
    {
      key: "constructor",
      label: "Constructor",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-[var(--shape-xs)]" style={{ backgroundColor: getTeamColorBorder(row.team_colour) }} />
          {row.constructor}
        </div>
      ),
    },
    { key: "points", label: "Pts", align: "text-right", render: (row) => <span className="font-mono font-semibold">{row.points}</span> },
    { key: "wins", label: "Wins", align: "text-right", render: (row) => row.wins },
  ];

  return (
    <PageShell title="Standings" subtitle={`Championship tables for ${scoreYear}`}>
      <Tabs
        tabs={[
          { key: "drivers", label: "Drivers" },
          { key: "constructors", label: "Constructors" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
        className="sticky top-16 z-20"
      />

      {isLoading && (
        <Surface tier="container" className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin opacity-60" />
          <span className="ml-2 md3-body-md text-[var(--md-on-surface-variant)]">Loading standings…</span>
        </Surface>
      )}

      <DataStatusBanner meta={combinedMeta} />

      {isError && !hasAnyData && (
        <Surface tier="container" className="p-6 md3-body-md text-[var(--danger)]">{errorMessage}</Surface>
      )}

      {!isLoading && hasAnyData && (
        <div className="space-y-4 md3-content-auto">
          <DataTable
            columns={activeTab === "drivers" ? driverColumns : constructorColumns}
            rows={activeTab === "drivers" ? driverRows : constructorRows}
            getRowKey={(row) => row.id}
          />
          <ProgressionChart
            title={activeTab === "drivers" ? "Drivers Progression" : "Constructors Progression"}
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
