import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useLatestSessionDrivers } from "../Drivers/useLatestSessionDrivers";
import { ArrowLeft } from "lucide-react";
import { getTeamColorBorder } from "../../common/utils/colors";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_BASE = "https://api.openf1.org/v1";

// fallback color if team color not available
const fallbackColorForDriver = (num) => `hsl(${(num * 57) % 360} 68% 50%)`;

// fixed container sizes to avoid "growing" charts
const SECTOR_GRAPH_HEIGHT = 160;
const PACE_GRAPH_HEIGHT = 320;
const DELTA_GRAPH_HEIGHT = 180;

export default function SessionPaceAnalytics({ meetingKey, sessionKey }) {
  // ----- local state -----
  const [lapsData, setLapsData] = useState([]);
  const [loadingLaps, setLoadingLaps] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedLayout, setExpandedLayout] = useState(false);

  const overlayRef = useRef();

  // ----- driver metadata (names) via provided hook -----
  const { data: latestDrivers = [], isLoading: driversLoading } = useLatestSessionDrivers(
    meetingKey,
    sessionKey,
    { enabled: Boolean(meetingKey || sessionKey) }
  );

  // ----- fetch laps for sessionKey with AbortController -----
  useEffect(() => {
    if (!sessionKey) {
      setLapsData([]);
      setLoadingLaps(false);
      return;
    }
    setLoadingLaps(true);
    const controller = new AbortController();
    const url = `${API_BASE}/laps?session_key=${sessionKey}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
      })
      .then((payload) => {
        setLapsData(Array.isArray(payload) ? payload : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("laps fetch error", err);
        setLapsData([]);
      })
      .finally(() => setLoadingLaps(false));

    return () => controller.abort();
  }, [sessionKey]);

  // ----- map driver number -> display name (prefer broadcast_name) -----
  const driversMap = useMemo(() => {
    const map = {};
    if (Array.isArray(latestDrivers)) {
      latestDrivers.forEach((d) => {
        const num = Number(d.driver_number);
        map[num] = d.broadcast_name || d.driver_name || d.full_name || `#${num}`;
      });
    }
    return map;
  }, [latestDrivers]);

  // ----- map driver number -> team color and team name -----
  const driversTeamMap = useMemo(() => {
    const map = {};
    if (Array.isArray(latestDrivers)) {
      latestDrivers.forEach((d) => {
        const num = Number(d.driver_number);
        map[num] = {
          teamColor: d.team_colour ? getTeamColorBorder(d.team_colour) : null,
          teamName: d.team_name || null,
        };
      });
    }
    return map;
  }, [latestDrivers]);

  // ----- group laps by driver number -----
  const lapsByDriver = useMemo(() => {
    const map = {};
    for (const lap of lapsData) {
      const num = Number(lap.driver_number);
      if (!map[num]) map[num] = [];
      map[num].push(lap);
    }
    // sort each driver by lap_number ascending
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (Number(a.lap_number || 0) - Number(b.lap_number || 0)))
    );
    return map;
  }, [lapsData]);

  // ----- unique sorted lapLabels -----
  const lapLabels = useMemo(() => {
    const set = new Set();
    for (const l of lapsData) {
      if (l.lap_number != null) set.add(Number(l.lap_number));
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [lapsData]);

  // ----- ensure first 2 drivers preselected (once driversMap loaded) -----
  useEffect(() => {
    const keys = Object.keys(driversMap);
    if (keys.length && selectedDrivers.length === 0) {
      const firstTwo = keys.slice(0, 2).map((s) => Number(s));
      setSelectedDrivers(firstTwo);
    }
    // intentionally only respond to driversMap changes
  }, [driversMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- helpers -----
  const parseN = (v) => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // toggle driver selection
  const toggleDriver = useCallback((num) => {
    setSelectedDrivers((prev) => (prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]));
  }, []);

  // clear all resets to first 2
  const clearAll = useCallback(() => {
    const firstTwo = Object.keys(driversMap).slice(0, 2).map((s) => Number(s));
    setSelectedDrivers(firstTwo);
  }, [driversMap]);

  // compute fastest lap per driver
  const fastestLapByDriver = useMemo(() => {
    const out = {};
    Object.entries(lapsByDriver).forEach(([num, laps]) => {
      let best = null;
      laps.forEach((l) => {
        const dur = parseN(l.lap_duration);
        if (dur == null) return;
        if (!best || dur < best.duration) best = { lap_number: l.lap_number, duration: dur };
      });
      out[num] = best;
    });
    return out;
  }, [lapsByDriver]);

  // compute fastest sector per driver (s1, s2, s3)
  const fastestSectorByDriver = useMemo(() => {
    const out = {};
    Object.entries(lapsByDriver).forEach(([num, laps]) => {
      const best = { s1: null, s2: null, s3: null };
      laps.forEach((l) => {
        const s1 = parseN(l.duration_sector_1 ?? l.lap_duration_sector_1 ?? l.sector1_time);
        const s2 = parseN(l.duration_sector_2 ?? l.lap_duration_sector_2 ?? l.sector2_time);
        const s3 = parseN(l.duration_sector_3 ?? l.lap_duration_sector_3 ?? l.sector3_time);
        if (s1 != null && (!best.s1 || s1 < best.s1.duration)) best.s1 = { lap_number: l.lap_number, duration: s1 };
        if (s2 != null && (!best.s2 || s2 < best.s2.duration)) best.s2 = { lap_number: l.lap_number, duration: s2 };
        if (s3 != null && (!best.s3 || s3 < best.s3.duration)) best.s3 = { lap_number: l.lap_number, duration: s3 };
      });
      out[num] = best;
    });
    return out;
  }, [lapsByDriver]);

  // compute average sector times for selected drivers (per driver summary)
  const perDriverSectorStats = useMemo(() => {
    const out = {};
    for (const num of selectedDrivers) {
      const rows = lapsByDriver[num] || [];
      let sumS1 = 0, sumS2 = 0, sumS3 = 0, cnt1 = 0, cnt2 = 0, cnt3 = 0;
      let lowestS1 = null, lowestS2 = null, lowestS3 = null;
      rows.forEach((r) => {
        const s1 = parseN(r.duration_sector_1 ?? r.lap_duration_sector_1 ?? r.sector1_time);
        const s2 = parseN(r.duration_sector_2 ?? r.lap_duration_sector_2 ?? r.sector2_time);
        const s3 = parseN(r.duration_sector_3 ?? r.lap_duration_sector_3 ?? r.sector3_time);
        if (s1 != null) { sumS1 += s1; cnt1++; if (lowestS1 == null || s1 < lowestS1) lowestS1 = s1; }
        if (s2 != null) { sumS2 += s2; cnt2++; if (lowestS2 == null || s2 < lowestS2) lowestS2 = s2; }
        if (s3 != null) { sumS3 += s3; cnt3++; if (lowestS3 == null || s3 < lowestS3) lowestS3 = s3; }
      });
      out[num] = {
        avgS1: cnt1 ? +(sumS1 / cnt1).toFixed(3) : null,
        avgS2: cnt2 ? +(sumS2 / cnt2).toFixed(3) : null,
        avgS3: cnt3 ? +(sumS3 / cnt3).toFixed(3) : null,
        lowestS1: lowestS1 ?? null,
        lowestS2: lowestS2 ?? null,
        lowestS3: lowestS3 ?? null,
        fastestLap: fastestLapByDriver[num] ? { ...fastestLapByDriver[num] } : null,
      };
    }
    return out;
  }, [selectedDrivers, lapsByDriver, fastestLapByDriver]);

  // build sector chart (single sector at a time) - we'll render S1,S2,S3 stacked vertically
  const buildSectorData = useCallback((sectorKey) => {
    if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };
    const datasets = [];

    // average per lap across selected drivers
    const avgPerLap = lapLabels.map((lap) => {
      let sum = 0, count = 0;
      for (const num of selectedDrivers) {
        const rows = lapsByDriver[num] || [];
        const rec = rows.find((r) => Number(r.lap_number) === lap);
        const val =
          sectorKey === 1
            ? parseN(rec?.duration_sector_1 ?? rec?.lap_duration_sector_1 ?? rec?.sector1_time)
            : sectorKey === 2
            ? parseN(rec?.duration_sector_2 ?? rec?.lap_duration_sector_2 ?? rec?.sector2_time)
            : parseN(rec?.duration_sector_3 ?? rec?.lap_duration_sector_3 ?? rec?.sector3_time);
        if (val != null) {
          sum += val;
          count += 1;
        }
      }
      return count ? +(sum / count).toFixed(3) : null;
    });

    // Group drivers by team to detect same team
    const teamGroups = {};
    selectedDrivers.forEach((num) => {
      const teamName = driversTeamMap[num]?.teamName;
      if (teamName) {
        if (!teamGroups[teamName]) teamGroups[teamName] = [];
        teamGroups[teamName].push(num);
      }
    });

    // per-driver lines
    for (const num of selectedDrivers) {
      const rows = lapsByDriver[num] || [];
      const teamInfo = driversTeamMap[num];
      const color = teamInfo?.teamColor || fallbackColorForDriver(Number(num));
      
      // Check if this driver is part of a team with multiple selected drivers
      const teamName = teamInfo?.teamName;
      const sameTeamCount = teamName && teamGroups[teamName] ? teamGroups[teamName].length : 0;
      const isSameTeam = sameTeamCount > 1;

      const data = lapLabels.map((lap) => {
        const rec = rows.find((r) => Number(r.lap_number) === lap);
        const val =
          sectorKey === 1
            ? parseN(rec?.duration_sector_1 ?? rec?.lap_duration_sector_1 ?? rec?.sector1_time)
            : sectorKey === 2
            ? parseN(rec?.duration_sector_2 ?? rec?.lap_duration_sector_2 ?? rec?.sector2_time)
            : parseN(rec?.duration_sector_3 ?? rec?.lap_duration_sector_3 ?? rec?.sector3_time);
        return val != null ? val : null;
      });

      // fastest marker for this sector
      const fastest = fastestSectorByDriver[num]?.[`s${sectorKey}`];
      const pointRadius = (rows || []).map((r) => (fastest && r.lap_number === fastest.lap_number ? 4 : 0));
      const pointBg = (rows || []).map((r) => (fastest && r.lap_number === fastest.lap_number ? "#fff" : color));

      datasets.push({
        label: driversMap[num] || `#${num}`,
        data,
        borderColor: color,
        borderDash: isSameTeam ? [5, 5] : [],
        tension: 0.2,
        pointRadius,
        pointBackgroundColor: pointBg,
      });
    }

    // average dashed line
    datasets.push({
      label: "Average (selected)",
      data: avgPerLap,
      borderColor: "rgba(200,200,200,0.9)",
      borderDash: [6, 6],
      pointRadius: 0,
      tension: 0.2,
    });

    return { labels: lapLabels, datasets };
  }, [selectedDrivers, lapsByDriver, lapLabels, fastestSectorByDriver, driversMap, driversTeamMap]);

  // pace graph (lap_duration) with fastest-lap markers
  const paceGraphData = useMemo(() => {
    if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };
    
    // Group drivers by team to detect same team
    const teamGroups = {};
    selectedDrivers.forEach((num) => {
      const teamName = driversTeamMap[num]?.teamName;
      if (teamName) {
        if (!teamGroups[teamName]) teamGroups[teamName] = [];
        teamGroups[teamName].push(num);
      }
    });

    const datasets = selectedDrivers.map((num) => {
      const rows = lapsByDriver[num] || [];
      const teamInfo = driversTeamMap[num];
      const color = teamInfo?.teamColor || fallbackColorForDriver(Number(num));
      
      // Check if this driver is part of a team with multiple selected drivers
      const teamName = teamInfo?.teamName;
      const sameTeamCount = teamName && teamGroups[teamName] ? teamGroups[teamName].length : 0;
      const isSameTeam = sameTeamCount > 1;

      const data = lapLabels.map((lap) => {
        const rec = rows.find((r) => Number(r.lap_number) === lap);
        return rec ? parseN(rec.lap_duration) : null;
      });
      const fastest = fastestLapByDriver[num];
      const pointRadius = (rows || []).map((r) => (fastest && r.lap_number === fastest.lap_number ? 4 : 0));
      const pointBg = (rows || []).map((r) => (fastest && r.lap_number === fastest.lap_number ? "#fff" : color));

      return {
        label: driversMap[num] || `#${num}`,
        data,
        borderColor: color,
        borderDash: isSameTeam ? [5, 5] : [],
        tension: 0.25,
        pointRadius,
        pointBackgroundColor: pointBg,
      };
    });
    return { labels: lapLabels, datasets };
  }, [selectedDrivers, lapsByDriver, lapLabels, fastestLapByDriver, driversMap, driversTeamMap]);

  // delta graph (A - B) when exactly 2 drivers selected
  const deltaGraphData = useMemo(() => {
    if (selectedDrivers.length !== 2) return null;
    const [A, B] = selectedDrivers;
    const mapA = (lapsByDriver[A] || []).reduce((acc, l) => ({ ...acc, [l.lap_number]: parseN(l.lap_duration) }), {});
    const mapB = (lapsByDriver[B] || []).reduce((acc, l) => ({ ...acc, [l.lap_number]: parseN(l.lap_duration) }), {});
    const data = lapLabels.map((lap) => {
      const a = mapA[lap];
      const b = mapB[lap];
      if (a == null || b == null) return null;
      return +(a - b).toFixed(3); // positive => A slower than B
    });
    return {
      labels: lapLabels,
      datasets: [
        {
          label: `${driversMap[A] || `#${A}`} − ${driversMap[B] || `#${B}`} (Δs)`,
          data,
          borderColor: "#ffb86b",
          tension: 0.25,
          pointRadius: 0,
        },
      ],
    };
  }, [selectedDrivers, lapsByDriver, lapLabels, driversMap]);

  // overall loading state
  const overallLoading = loadingLaps || driversLoading;

  // ----- UX: close drawer on overlay click / Escape -----
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // overlay click: if clicked the overlay (not the drawer) -> close
  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      setDrawerOpen(false);
    }
  };

  // ----- render -----
  if (overallLoading) return <p className="p-3 text-sm opacity-70">Loading session analytics…</p>;
  if (!lapsData.length) return <p className="p-3 text-sm opacity-60">No lap data available for this session.</p>;

  return (
    <div className="w-full">
      {/* top bar: open drawer button + layout toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-3 py-1 rounded border border-[var(--border-color)] hover:bg-white/5"
            aria-expanded={drawerOpen}
            aria-controls="driver-drawer"
          >
            Select drivers
          </button>

          <button
            onClick={() => setExpandedLayout((p) => !p)}
            className="px-3 py-1 rounded border border-[var(--border-color)] hover:bg-white/5"
          >
            {expandedLayout ? "Compact" : "Enlarge"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs opacity-70">Selected: {selectedDrivers.length}</div>
          <button onClick={clearAll} className="text-xs px-2 py-1 rounded border border-[var(--border-color)] hover:bg-white/5">Clear All</button>
        </div>
      </div>

      {/* small per-driver stats (avg / best sectors) */}
      <div 
        className="grid gap-3 mb-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {selectedDrivers.map((num) => {
          const s = perDriverSectorStats[num] || {};
          const teamInfo = driversTeamMap[num];
          const teamColor = teamInfo?.teamColor || fallbackColorForDriver(Number(num));
          
          // Calculate total lap time from sectors
          const totalTime = s.avgS1 && s.avgS2 && s.avgS3 
            ? s.avgS1 + s.avgS2 + s.avgS3 
            : s.fastestLap?.duration || null;
          
          // Calculate percentages for each sector
          const s1Percent = totalTime && s.avgS1 ? (s.avgS1 / totalTime) * 100 : 0;
          const s2Percent = totalTime && s.avgS2 ? (s.avgS2 / totalTime) * 100 : 0;
          const s3Percent = totalTime && s.avgS3 ? (s.avgS3 / totalTime) * 100 : 0;
          
          // Format time to minutes:seconds.milliseconds
          const formatTime = (seconds) => {
            if (!seconds) return "-";
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const wholeSecs = Math.floor(secs);
            const milliseconds = Math.floor((secs - wholeSecs) * 1000);
            
            if (mins > 0) {
              return `${mins}:${wholeSecs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
            } else {
              return `${wholeSecs}.${milliseconds.toString().padStart(3, '0')}`;
            }
          };
          
          // Sector colors (using team color with distinct variations)
          const getSectorColor = (sectorNum) => {
            if (!teamInfo?.teamColor) {
              // Fallback colors for sectors
              const fallbackColors = {
                1: '#3b82f6', // Blue for S1
                2: '#10b981', // Green for S2
                3: '#f59e0b', // Orange for S3
              };
              return fallbackColors[sectorNum] || fallbackColorForDriver(Number(num));
            }
            
            // Use team color with different opacity/brightness for each sector
            const baseColor = teamColor.replace('#', '');
            const r = parseInt(baseColor.substring(0, 2), 16);
            const g = parseInt(baseColor.substring(2, 4), 16);
            const b = parseInt(baseColor.substring(4, 6), 16);
            
            // Brightness factors: S1 brightest, S2 medium, S3 darkest
            const brightnessFactors = { 1: 1.0, 2: 0.85, 3: 0.7 };
            const factor = brightnessFactors[sectorNum];
            
            const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
            const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
            const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
            
            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
          };
          
          const s1Color = getSectorColor(1);
          const s2Color = getSectorColor(2);
          const s3Color = getSectorColor(3);

          return (
            <div key={num} className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">{driversMap[num] || `#${num}`}</div>
                <div className="text-xs opacity-70">({num})</div>
              </div>
              
              {/* Graphical Sector Representation */}
              {totalTime && s.avgS1 && s.avgS2 && s.avgS3 ? (
                <div className="mb-3">
                  <div className="relative h-12 rounded-md overflow-hidden border border-[var(--border-color)] flex">
                    {/* Sector 1 */}
                    {s1Percent > 0 && (
                      <div
                        className="flex items-center justify-center text-[9px] font-semibold text-white relative overflow-hidden"
                        style={{
                          width: `${s1Percent}%`,
                          backgroundColor: s1Color,
                          minWidth: s1Percent > 5 ? 'auto' : '0',
                        }}
                        title={`S1: ${s.avgS1.toFixed(3)}s`}
                      >
                        {s1Percent > 8 && (
                          <span className="px-1 truncate">S1: {s.avgS1.toFixed(3)}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Sector 2 */}
                    {s2Percent > 0 && (
                      <div
                        className="flex items-center justify-center text-[9px] font-semibold text-white relative overflow-hidden border-l border-white/20"
                        style={{
                          width: `${s2Percent}%`,
                          backgroundColor: s2Color,
                          minWidth: s2Percent > 5 ? 'auto' : '0',
                        }}
                        title={`S2: ${s.avgS2.toFixed(3)}s`}
                      >
                        {s2Percent > 8 && (
                          <span className="px-1 truncate">S2: {s.avgS2.toFixed(3)}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Sector 3 */}
                    {s3Percent > 0 && (
                      <div
                        className="flex items-center justify-center text-[9px] font-semibold text-white relative overflow-hidden border-l border-white/20"
                        style={{
                          width: `${s3Percent}%`,
                          backgroundColor: s3Color,
                          minWidth: s3Percent > 5 ? 'auto' : '0',
                        }}
                        title={`S3: ${s.avgS3.toFixed(3)}s`}
                      >
                        {s3Percent > 8 && (
                          <span className="px-1 truncate">S3: {s.avgS3.toFixed(3)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Total Time Display */}
                  <div className="text-center mt-2">
                    <div className="text-xs font-semibold opacity-90">
                      Avg Total: {formatTime(totalTime)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-3 text-xs opacity-60 text-center py-4">
                  No sector data available
                </div>
              )}
              
              {/* Best Sectors */}
              <div className="space-y-1 mt-3 pt-3 border-t border-[var(--border-color)]">
                <div className="text-xs opacity-70">Best Sectors:</div>
                <div className="text-xs opacity-80">S1: {s.lowestS1 ? `${s.lowestS1.toFixed(3)}s` : "-"}</div>
                <div className="text-xs opacity-80">S2: {s.lowestS2 ? `${s.lowestS2.toFixed(3)}s` : "-"}</div>
                <div className="text-xs opacity-80">S3: {s.lowestS3 ? `${s.lowestS3.toFixed(3)}s` : "-"}</div>
                {s.fastestLap && (
                  <div className="text-xs opacity-70 mt-2 text-(--primary-color) font-bold">
                    Fastest: Lap no. {s.fastestLap.lap_number} : {formatTime(s.fastestLap.duration)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* charts */}
      <div className={expandedLayout ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-4"}>
        {/* Sector charts stacked (S1,S2,S3) */}
        <div className="space-y-4">
          {[1, 2, 3].map((s) => {
            const data = buildSectorData(s);
            return (
              <section key={s} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold">Sector {s} — time (s)</h5>
                  <div className="text-xs opacity-60">Average (dashed)</div>
                </div>
                <div style={{ height: SECTOR_GRAPH_HEIGHT, position: "relative" }}>
                  <Line
                    key={`sector-${s}-${selectedDrivers.join(",")}`}
                    data={data}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } },
                        tooltip: { mode: "index", intersect: false },
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

        {/* Pace + Delta */}
        <div className="space-y-4">
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
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: { mode: "index", intersect: false },
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
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      x: { title: { display: true, text: "Lap" } },
                      y: { title: { display: true, text: "Δ seconds (A - B)" } },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm opacity-60">Select exactly 2 drivers for delta</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ===== Slide-over Drawer (Left) ===== */}
      <div
        ref={overlayRef}
        onClick={onOverlayClick}
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-[60] transition-opacity duration-250 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <aside
          id="driver-drawer"
          role="dialog"
          aria-label="Driver selector"
          className={`absolute left-0 top-0 bottom-0 w-[84%] max-w-[420px] bg-[var(--panel-color)] shadow-xl transform transition-transform duration-250 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()} // keep clicks inside drawer from closing
        >
          {/* header */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close driver selector"
              className="p-2 rounded hover:bg-white/5"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h4 className="font-semibold">Drivers</h4>
              <div className="text-xs opacity-60">Tap to toggle selection</div>
            </div>
            <button onClick={clearAll} className="text-xs px-2 py-1 rounded border border-[var(--border-color)] hover:bg-white/5">Reset</button>
          </div>

          {/* body */}
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
                    className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition ${selected ? "bg-[var(--primary-color)] text-white" : "hover:bg-white/5"}`}
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
