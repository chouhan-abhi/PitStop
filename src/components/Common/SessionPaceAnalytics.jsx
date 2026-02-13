import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Decimation,
} from "chart.js";
import { ArrowLeft } from "lucide-react";

import { useLatestSessionDrivers } from "../Drivers/useLatestSessionDrivers";
import { useLaps } from "./useLaps";
import { getTeamColorBorder } from "../../common/utils/colors";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Decimation);

const fallbackColorForDriver = (num) => `hsl(${(num * 57) % 360} 68% 50%)`;

const SECTOR_GRAPH_HEIGHT = 160;
const PACE_GRAPH_HEIGHT = 320;
const DELTA_GRAPH_HEIGHT = 180;
const SPEED_GRAPH_HEIGHT = 190;

const parseN = (value) => {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getSectorValue = (lap, sectorKey) => {
  if (!lap) return null;
  if (sectorKey === 1) {
    return parseN(lap.duration_sector_1 ?? lap.lap_duration_sector_1 ?? lap.sector1_time);
  }
  if (sectorKey === 2) {
    return parseN(lap.duration_sector_2 ?? lap.lap_duration_sector_2 ?? lap.sector2_time);
  }
  return parseN(lap.duration_sector_3 ?? lap.lap_duration_sector_3 ?? lap.sector3_time);
};

const getTopSpeedFromLap = (lap) => {
  if (!lap) return null;

  const speeds = [
    parseN(lap.st_speed),
    parseN(lap.i1_speed),
    parseN(lap.i2_speed),
  ].filter((value) => value != null);

  return speeds.length ? Math.max(...speeds) : null;
};

const baseLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  parsing: false,
  normalized: true,
  interaction: { mode: "index", intersect: false },
  plugins: {
    decimation: {
      enabled: true,
      algorithm: "lttb",
      samples: 140,
    },
    tooltip: { mode: "index", intersect: false },
  },
};

export default function SessionPaceAnalytics({ meetingKey, sessionKey, year }) {
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedLayout, setExpandedLayout] = useState(false);

  const overlayRef = useRef();

  const { data: latestDrivers = [], isLoading: driversLoading } = useLatestSessionDrivers(
    meetingKey,
    sessionKey,
    { enabled: Boolean(meetingKey || sessionKey), year }
  );

  const { data: lapsData = [], isLoading: loadingLaps } = useLaps(sessionKey, {
    enabled: Boolean(sessionKey),
  });

  const driversMap = useMemo(() => {
    const map = {};
    if (Array.isArray(latestDrivers)) {
      latestDrivers.forEach((driver) => {
        const num = Number(driver.driver_number);
        map[num] =
          driver.broadcast_name || driver.driver_name || driver.full_name || `#${num}`;
      });
    }
    return map;
  }, [latestDrivers]);

  const driversTeamMap = useMemo(() => {
    const map = {};
    if (Array.isArray(latestDrivers)) {
      latestDrivers.forEach((driver) => {
        const num = Number(driver.driver_number);
        map[num] = {
          teamColor: driver.team_colour ? getTeamColorBorder(driver.team_colour) : null,
          teamName: driver.team_name || null,
        };
      });
    }
    return map;
  }, [latestDrivers]);

  const { lapsByDriver, lapLookupByDriver, lapLabels } = useMemo(() => {
    const byDriver = {};
    const lookup = {};
    const labelsSet = new Set();

    for (const lap of lapsData) {
      const driverNum = Number(lap.driver_number);
      const lapNum = Number(lap.lap_number);
      if (!Number.isFinite(driverNum) || !Number.isFinite(lapNum)) continue;

      if (!byDriver[driverNum]) {
        byDriver[driverNum] = [];
        lookup[driverNum] = new Map();
      }

      byDriver[driverNum].push(lap);
      lookup[driverNum].set(lapNum, lap);
      labelsSet.add(lapNum);
    }

    Object.values(byDriver).forEach((rows) =>
      rows.sort((a, b) => Number(a.lap_number || 0) - Number(b.lap_number || 0))
    );

    return {
      lapsByDriver: byDriver,
      lapLookupByDriver: lookup,
      lapLabels: Array.from(labelsSet).sort((a, b) => a - b),
    };
  }, [lapsData]);

  useEffect(() => {
    const keys = Object.keys(driversMap);
    if (keys.length && selectedDrivers.length === 0) {
      setSelectedDrivers(keys.slice(0, 2).map((value) => Number(value)));
    }
  }, [driversMap, selectedDrivers.length]);

  const toggleDriver = useCallback((num) => {
    setSelectedDrivers((previous) =>
      previous.includes(num)
        ? previous.filter((value) => value !== num)
        : [...previous, num]
    );
  }, []);

  const clearAll = useCallback(() => {
    const firstTwo = Object.keys(driversMap).slice(0, 2).map((value) => Number(value));
    setSelectedDrivers(firstTwo);
  }, [driversMap]);

  const fastestLapByDriver = useMemo(() => {
    const out = {};
    Object.entries(lapsByDriver).forEach(([num, laps]) => {
      let best = null;
      laps.forEach((lap) => {
        const duration = parseN(lap.lap_duration);
        if (duration == null) return;
        if (!best || duration < best.duration) {
          best = { lap_number: Number(lap.lap_number), duration };
        }
      });
      out[num] = best;
    });
    return out;
  }, [lapsByDriver]);

  const fastestSectorByDriver = useMemo(() => {
    const out = {};

    Object.entries(lapsByDriver).forEach(([num, laps]) => {
      const best = { s1: null, s2: null, s3: null };

      laps.forEach((lap) => {
        const s1 = getSectorValue(lap, 1);
        const s2 = getSectorValue(lap, 2);
        const s3 = getSectorValue(lap, 3);

        if (s1 != null && (!best.s1 || s1 < best.s1.duration)) {
          best.s1 = { lap_number: Number(lap.lap_number), duration: s1 };
        }
        if (s2 != null && (!best.s2 || s2 < best.s2.duration)) {
          best.s2 = { lap_number: Number(lap.lap_number), duration: s2 };
        }
        if (s3 != null && (!best.s3 || s3 < best.s3.duration)) {
          best.s3 = { lap_number: Number(lap.lap_number), duration: s3 };
        }
      });

      out[num] = best;
    });

    return out;
  }, [lapsByDriver]);

  const perDriverSectorStats = useMemo(() => {
    const out = {};

    for (const num of selectedDrivers) {
      const rows = lapsByDriver[num] || [];

      let sumS1 = 0;
      let sumS2 = 0;
      let sumS3 = 0;
      let cnt1 = 0;
      let cnt2 = 0;
      let cnt3 = 0;
      let lowestS1 = null;
      let lowestS2 = null;
      let lowestS3 = null;
      let speedSum = 0;
      let speedCount = 0;
      let speedPeak = null;

      rows.forEach((row) => {
        const s1 = getSectorValue(row, 1);
        const s2 = getSectorValue(row, 2);
        const s3 = getSectorValue(row, 3);
        const topSpeed = getTopSpeedFromLap(row);

        if (s1 != null) {
          sumS1 += s1;
          cnt1 += 1;
          if (lowestS1 == null || s1 < lowestS1) lowestS1 = s1;
        }
        if (s2 != null) {
          sumS2 += s2;
          cnt2 += 1;
          if (lowestS2 == null || s2 < lowestS2) lowestS2 = s2;
        }
        if (s3 != null) {
          sumS3 += s3;
          cnt3 += 1;
          if (lowestS3 == null || s3 < lowestS3) lowestS3 = s3;
        }

        if (topSpeed != null) {
          speedSum += topSpeed;
          speedCount += 1;
          if (speedPeak == null || topSpeed > speedPeak) speedPeak = topSpeed;
        }
      });

      out[num] = {
        avgS1: cnt1 ? +(sumS1 / cnt1).toFixed(3) : null,
        avgS2: cnt2 ? +(sumS2 / cnt2).toFixed(3) : null,
        avgS3: cnt3 ? +(sumS3 / cnt3).toFixed(3) : null,
        lowestS1,
        lowestS2,
        lowestS3,
        avgTopSpeed: speedCount ? +(speedSum / speedCount).toFixed(1) : null,
        peakSpeed: speedPeak,
        fastestLap: fastestLapByDriver[num] ? { ...fastestLapByDriver[num] } : null,
      };
    }

    return out;
  }, [selectedDrivers, lapsByDriver, fastestLapByDriver]);

  const selectedTeamGroups = useMemo(() => {
    const groups = {};

    selectedDrivers.forEach((num) => {
      const teamName = driversTeamMap[num]?.teamName;
      if (!teamName) return;
      if (!groups[teamName]) {
        groups[teamName] = [];
      }
      groups[teamName].push(num);
    });

    return groups;
  }, [selectedDrivers, driversTeamMap]);

  const buildSectorData = useCallback(
    (sectorKey) => {
      if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };
      const datasets = [];

      const avgPerLap = lapLabels.map((lap) => {
        let sum = 0;
        let count = 0;

        selectedDrivers.forEach((driverNum) => {
          const lapRecord = lapLookupByDriver[driverNum]?.get(lap);
          const value = getSectorValue(lapRecord, sectorKey);
          if (value != null) {
            sum += value;
            count += 1;
          }
        });

        return count ? +(sum / count).toFixed(3) : null;
      });

      selectedDrivers.forEach((driverNum) => {
        const teamInfo = driversTeamMap[driverNum];
        const color = teamInfo?.teamColor || fallbackColorForDriver(Number(driverNum));
        const teamName = teamInfo?.teamName;
        const sameTeamCount = teamName ? selectedTeamGroups[teamName]?.length || 0 : 0;
        const fastest = fastestSectorByDriver[driverNum]?.[`s${sectorKey}`];

        const data = lapLabels.map((lap) => {
          const lapRecord = lapLookupByDriver[driverNum]?.get(lap);
          return getSectorValue(lapRecord, sectorKey);
        });

        datasets.push({
          label: driversMap[driverNum] || `#${driverNum}`,
          data,
          borderColor: color,
          borderDash: sameTeamCount > 1 ? [5, 5] : [],
          tension: 0.2,
          pointRadius: lapLabels.map((lap) =>
            fastest && lap === fastest.lap_number ? 3 : 0
          ),
          pointBackgroundColor: lapLabels.map((lap) =>
            fastest && lap === fastest.lap_number ? "#fff" : color
          ),
          pointHoverRadius: 2,
        });
      });

      datasets.push({
        label: "Average (selected)",
        data: avgPerLap,
        borderColor: "rgba(200,200,200,0.9)",
        borderDash: [6, 6],
        pointRadius: 0,
        tension: 0.2,
      });

      return { labels: lapLabels, datasets };
    },
    [
      selectedDrivers,
      lapLabels,
      lapLookupByDriver,
      driversTeamMap,
      selectedTeamGroups,
      fastestSectorByDriver,
      driversMap,
    ]
  );

  const paceGraphData = useMemo(() => {
    if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };

    const datasets = selectedDrivers.map((driverNum) => {
      const teamInfo = driversTeamMap[driverNum];
      const color = teamInfo?.teamColor || fallbackColorForDriver(Number(driverNum));
      const teamName = teamInfo?.teamName;
      const sameTeamCount = teamName ? selectedTeamGroups[teamName]?.length || 0 : 0;
      const fastest = fastestLapByDriver[driverNum];

      const data = lapLabels.map((lap) => {
        const lapRecord = lapLookupByDriver[driverNum]?.get(lap);
        return lapRecord ? parseN(lapRecord.lap_duration) : null;
      });

      return {
        label: driversMap[driverNum] || `#${driverNum}`,
        data,
        borderColor: color,
        borderDash: sameTeamCount > 1 ? [5, 5] : [],
        tension: 0.25,
        pointRadius: lapLabels.map((lap) => (fastest && lap === fastest.lap_number ? 3 : 0)),
        pointBackgroundColor: lapLabels.map((lap) =>
          fastest && lap === fastest.lap_number ? "#fff" : color
        ),
        pointHoverRadius: 2,
      };
    });

    return { labels: lapLabels, datasets };
  }, [
    selectedDrivers,
    lapLabels,
    driversTeamMap,
    selectedTeamGroups,
    fastestLapByDriver,
    driversMap,
    lapLookupByDriver,
  ]);

  const speedGraphData = useMemo(() => {
    if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };

    const datasets = selectedDrivers.map((driverNum) => {
      const teamInfo = driversTeamMap[driverNum];
      const color = teamInfo?.teamColor || fallbackColorForDriver(Number(driverNum));
      const teamName = teamInfo?.teamName;
      const sameTeamCount = teamName ? selectedTeamGroups[teamName]?.length || 0 : 0;

      const data = lapLabels.map((lap) => {
        const lapRecord = lapLookupByDriver[driverNum]?.get(lap);
        return getTopSpeedFromLap(lapRecord);
      });

      return {
        label: driversMap[driverNum] || `#${driverNum}`,
        data,
        borderColor: color,
        borderDash: sameTeamCount > 1 ? [5, 5] : [],
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 2,
      };
    });

    return { labels: lapLabels, datasets };
  }, [
    selectedDrivers,
    lapLabels,
    driversTeamMap,
    selectedTeamGroups,
    driversMap,
    lapLookupByDriver,
  ]);

  const deltaGraphData = useMemo(() => {
    if (selectedDrivers.length !== 2) return null;

    const [aDriver, bDriver] = selectedDrivers;

    const data = lapLabels.map((lap) => {
      const aLap = lapLookupByDriver[aDriver]?.get(lap);
      const bLap = lapLookupByDriver[bDriver]?.get(lap);
      const a = parseN(aLap?.lap_duration);
      const b = parseN(bLap?.lap_duration);
      if (a == null || b == null) return null;
      return +(a - b).toFixed(3);
    });

    return {
      labels: lapLabels,
      datasets: [
        {
          label: `${driversMap[aDriver] || `#${aDriver}`} − ${driversMap[bDriver] || `#${bDriver}`} (Δs)`,
          data,
          borderColor: "#ffb86b",
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 2,
        },
      ],
    };
  }, [selectedDrivers, lapLabels, driversMap, lapLookupByDriver]);

  const overallLoading = loadingLaps || driversLoading;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onOverlayClick = (event) => {
    if (event.target === overlayRef.current) {
      setDrawerOpen(false);
    }
  };

  if (overallLoading) return <p className="p-3 text-sm opacity-70">Loading session analytics…</p>;
  if (!lapsData.length) return <p className="p-3 text-sm opacity-60">No lap data available for this session.</p>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn"
            aria-expanded={drawerOpen}
            aria-controls="driver-drawer"
          >
            Select drivers
          </button>

          <button
            type="button"
            onClick={() => setExpandedLayout((previous) => !previous)}
            className="btn btn-ghost"
          >
            {expandedLayout ? "Compact" : "Enlarge"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs opacity-70">Selected: {selectedDrivers.length}</div>
          <button type="button" onClick={clearAll} className="btn btn-ghost">
            Reset
          </button>
        </div>
      </div>

      <div
        className="grid gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
      >
        {selectedDrivers.map((num) => {
          const stats = perDriverSectorStats[num] || {};
          const teamInfo = driversTeamMap[num];
          const teamColor = teamInfo?.teamColor || fallbackColorForDriver(Number(num));

          const totalTime =
            stats.avgS1 && stats.avgS2 && stats.avgS3
              ? stats.avgS1 + stats.avgS2 + stats.avgS3
              : stats.fastestLap?.duration || null;

          const s1Percent = totalTime && stats.avgS1 ? (stats.avgS1 / totalTime) * 100 : 0;
          const s2Percent = totalTime && stats.avgS2 ? (stats.avgS2 / totalTime) * 100 : 0;
          const s3Percent = totalTime && stats.avgS3 ? (stats.avgS3 / totalTime) * 100 : 0;

          const formatTime = (seconds) => {
            if (!seconds) return "-";
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const wholeSecs = Math.floor(secs);
            const milliseconds = Math.floor((secs - wholeSecs) * 1000);

            if (mins > 0) {
              return `${mins}:${wholeSecs.toString().padStart(2, "0")}.${milliseconds
                .toString()
                .padStart(3, "0")}`;
            }

            return `${wholeSecs}.${milliseconds.toString().padStart(3, "0")}`;
          };

          const getSectorColor = (sectorNum) => {
            if (!teamInfo?.teamColor) {
              const fallbackColors = { 1: "#3b82f6", 2: "#10b981", 3: "#f59e0b" };
              return fallbackColors[sectorNum] || fallbackColorForDriver(Number(num));
            }

            const baseColor = teamColor.replace("#", "");
            const r = parseInt(baseColor.substring(0, 2), 16);
            const g = parseInt(baseColor.substring(2, 4), 16);
            const b = parseInt(baseColor.substring(4, 6), 16);
            const brightnessFactors = { 1: 1, 2: 0.85, 3: 0.7 };
            const factor = brightnessFactors[sectorNum];

            const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
            const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
            const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));

            return `#${newR.toString(16).padStart(2, "0")}${newG
              .toString(16)
              .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
          };

          const s1Color = getSectorColor(1);
          const s2Color = getSectorColor(2);
          const s3Color = getSectorColor(3);

          return (
            <div
              key={num}
              className="p-2 sm:p-3 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">{driversMap[num] || `#${num}`}</div>
                <div className="text-xs opacity-70">({num})</div>
              </div>

              {totalTime && stats.avgS1 && stats.avgS2 && stats.avgS3 ? (
                <div className="mb-3">
                  <div className="relative h-12 rounded-md overflow-hidden border border-[var(--border-color)] flex">
                    {s1Percent > 0 && (
                      <div
                        className="flex items-center justify-center text-[9px] font-semibold text-white relative overflow-hidden"
                        style={{
                          width: `${s1Percent}%`,
                          backgroundColor: s1Color,
                          minWidth: s1Percent > 5 ? "auto" : "0",
                        }}
                        title={`S1: ${stats.avgS1.toFixed(3)}s`}
                      >
                        {s1Percent > 8 && <span className="px-1 truncate">S1: {stats.avgS1.toFixed(3)}</span>}
                      </div>
                    )}

                    {s2Percent > 0 && (
                      <div
                        className="flex items-center justify-center text-[9px] font-semibold text-white relative overflow-hidden border-l border-white/20"
                        style={{
                          width: `${s2Percent}%`,
                          backgroundColor: s2Color,
                          minWidth: s2Percent > 5 ? "auto" : "0",
                        }}
                        title={`S2: ${stats.avgS2.toFixed(3)}s`}
                      >
                        {s2Percent > 8 && <span className="px-1 truncate">S2: {stats.avgS2.toFixed(3)}</span>}
                      </div>
                    )}

                    {s3Percent > 0 && (
                      <div
                        className="flex items-center justify-center text-[9px] font-semibold text-white relative overflow-hidden border-l border-white/20"
                        style={{
                          width: `${s3Percent}%`,
                          backgroundColor: s3Color,
                          minWidth: s3Percent > 5 ? "auto" : "0",
                        }}
                        title={`S3: ${stats.avgS3.toFixed(3)}s`}
                      >
                        {s3Percent > 8 && <span className="px-1 truncate">S3: {stats.avgS3.toFixed(3)}</span>}
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-2">
                    <div className="text-xs font-semibold opacity-90">Avg Total: {formatTime(totalTime)}</div>
                  </div>
                </div>
              ) : (
                <div className="mb-3 text-xs opacity-60 text-center py-4">No sector data available</div>
              )}

              <div className="space-y-1 mt-3 pt-3 border-t border-[var(--border-color)]">
                <div className="text-xs opacity-70">Best Sectors:</div>
                <div className="text-xs opacity-80">S1: {stats.lowestS1 ? `${stats.lowestS1.toFixed(3)}s` : "-"}</div>
                <div className="text-xs opacity-80">S2: {stats.lowestS2 ? `${stats.lowestS2.toFixed(3)}s` : "-"}</div>
                <div className="text-xs opacity-80">S3: {stats.lowestS3 ? `${stats.lowestS3.toFixed(3)}s` : "-"}</div>
                <div className="text-xs opacity-80">Avg Speed: {stats.avgTopSpeed ? `${stats.avgTopSpeed} km/h` : "-"}</div>
                <div className="text-xs opacity-80">Peak Speed: {stats.peakSpeed ? `${Math.round(stats.peakSpeed)} km/h` : "-"}</div>
                {stats.fastestLap && (
                  <div
                    className="text-xs opacity-70 mt-2 font-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Fastest: Lap {stats.fastestLap.lap_number} : {formatTime(stats.fastestLap.duration)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={
          expandedLayout ? "flex flex-col gap-2 sm:gap-3 lg:gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4"
        }
      >
        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {[1, 2, 3].map((sector) => {
            const data = buildSectorData(sector);
            return (
              <section key={sector} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold">Sector {sector} — time (s)</h5>
                  <div className="text-xs opacity-60">Average (dashed)</div>
                </div>
                <div style={{ height: SECTOR_GRAPH_HEIGHT, position: "relative" }}>
                  <Line
                    key={`sector-${sector}-${selectedDrivers.join(",")}`}
                    data={data}
                    options={{
                      ...baseLineOptions,
                      plugins: {
                        ...baseLineOptions.plugins,
                        legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } },
                      },
                      scales: {
                        x: { title: { display: true, text: "Lap" } },
                        y: { title: { display: true, text: "Seconds (s)" } },
                      },
                    }}
                  />
                </div>
              </section>
            );
          })}
        </div>

        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold">Overall Lap Pace</h5>
              <div className="text-xs opacity-60">Fastest lap highlighted</div>
            </div>
            <div style={{ height: PACE_GRAPH_HEIGHT, position: "relative" }}>
              <Line
                key={`pace-${selectedDrivers.join(",")}`}
                data={paceGraphData}
                options={{
                  ...baseLineOptions,
                  plugins: {
                    ...baseLineOptions.plugins,
                    legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
                  },
                  scales: {
                    x: { title: { display: true, text: "Lap" } },
                    y: { title: { display: true, text: "Lap time (s)" } },
                  },
                }}
              />
            </div>
          </section>

          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold">Driver Δ (A − B)</h5>
              <div className="text-xs opacity-60">Shown when exactly 2 drivers selected</div>
            </div>
            <div style={{ height: DELTA_GRAPH_HEIGHT, position: "relative" }}>
              {deltaGraphData ? (
                <Line
                  key={`delta-${selectedDrivers.join(",")}`}
                  data={deltaGraphData}
                  options={{
                    ...baseLineOptions,
                    plugins: {
                      ...baseLineOptions.plugins,
                      legend: { position: "top" },
                    },
                    scales: {
                      x: { title: { display: true, text: "Lap" } },
                      y: { title: { display: true, text: "Δ seconds (A - B)" } },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm opacity-60">
                  Select exactly 2 drivers for delta
                </div>
              )}
            </div>
          </section>

          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold">Speed Trap Telemetry</h5>
              <div className="text-xs opacity-60">Top speed by lap (km/h)</div>
            </div>
            <div style={{ height: SPEED_GRAPH_HEIGHT, position: "relative" }}>
              <Line
                key={`speed-${selectedDrivers.join(",")}`}
                data={speedGraphData}
                options={{
                  ...baseLineOptions,
                  plugins: {
                    ...baseLineOptions.plugins,
                    legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
                  },
                  scales: {
                    x: { title: { display: true, text: "Lap" } },
                    y: { title: { display: true, text: "Speed (km/h)" } },
                  },
                }}
              />
            </div>
          </section>
        </div>
      </div>

      <div
        ref={overlayRef}
        onClick={onOverlayClick}
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-[60] transition-opacity duration-250 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <aside
          id="driver-drawer"
          role="dialog"
          aria-label="Driver selector"
          className={`absolute left-0 top-0 bottom-0 w-[84%] max-w-[420px] bg-[var(--panel-color)] shadow-xl transform transition-transform duration-250 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close driver selector"
              className="btn btn-ghost !px-2"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h4 className="font-semibold">Drivers</h4>
              <div className="text-xs opacity-60">Tap to toggle selection</div>
            </div>
            <button type="button" onClick={clearAll} className="btn btn-ghost">
              Reset
            </button>
          </div>

          <div className="p-3 overflow-y-auto" style={{ height: "calc(100vh - 72px)" }}>
            {Object.keys(driversMap).length === 0 ? (
              <p className="text-sm opacity-70">No drivers found.</p>
            ) : (
              Object.entries(driversMap).map(([numStr, name]) => {
                const num = Number(numStr);
                const selected = selectedDrivers.includes(num);
                return (
                  <div
                    key={num}
                    onClick={() => toggleDriver(num)}
                    className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition ${
                      selected ? "bg-[var(--primary-color)] text-white" : "hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium truncate">{name}</div>
                      <div className="text-xs opacity-60">#{num}</div>
                    </div>
                    <div className="text-xs opacity-80">{selected ? "Selected" : "Tap"}</div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
