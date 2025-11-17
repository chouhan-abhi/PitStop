import React, { useEffect, useState, useMemo, useCallback } from "react";
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_BASE = "https://api.openf1.org/v1";

// deterministic color per driver number
const colorForDriver = (num) => `hsl(${(num * 57) % 360} 68% 50%)`;

// fixed heights
const SECTOR_GRAPH_HEIGHT = 140;
const PACE_GRAPH_HEIGHT = 360;
const DELTA_GRAPH_HEIGHT = 180;

export default function SessionPaceAnalytics({ meetingKey, sessionKey }) {
  const [lapsData, setLapsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [expandedLayout, setExpandedLayout] = useState(false);

  // driver metadata for names
  const { data: latestDrivers = [], isLoading: driversLoading } = useLatestSessionDrivers(
    meetingKey,
    sessionKey,
    { enabled: Boolean(meetingKey || sessionKey) }
  );

  // fetch laps for session
  useEffect(() => {
    if (!sessionKey) {
      setLapsData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    fetch(`${API_BASE}/laps?session_key=${sessionKey}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
      })
      .then((data) => {
        setLapsData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("laps fetch error", err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [sessionKey]);

  // map driver number => display name
  const driversMap = useMemo(() => {
    const map = {};
    if (Array.isArray(latestDrivers)) {
      latestDrivers.forEach((d) => {
        const num = Number(d.driver_number);
        // prefer broadcast_name, fallback to common fields
        map[num] = d.broadcast_name || d.driver_name || d.full_name || `#${num}`;
      });
    }
    return map;
  }, [latestDrivers]);

  // preselect first 5 drivers once driversMap loads (do not override user selection)
  useEffect(() => {
    const keys = Object.keys(driversMap);
    if (keys.length && selectedDrivers.length === 0) {
      const firstFive = keys.slice(0, 5).map((s) => Number(s));
      setSelectedDrivers(firstFive);
    }
    // intentionally only run when driversMap changes
  }, [driversMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // group laps by driver_number
  const lapsByDriver = useMemo(() => {
    const map = {};
    for (const lap of lapsData) {
      const num = Number(lap.driver_number);
      if (!map[num]) map[num] = [];
      map[num].push(lap);
    }
    // sort per driver
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.lap_number || 0) - (b.lap_number || 0)));
    return map;
  }, [lapsData]);

  // sorted unique lap labels
  const lapLabels = useMemo(() => {
    const set = new Set();
    for (const l of lapsData) {
      if (l.lap_number != null) set.add(Number(l.lap_number));
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [lapsData]);

  // helper parse numeric safely
  const parseN = (v) => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // fastest lap per driver (lap_duration)
  const fastestLapByDriver = useMemo(() => {
    const out = {};
    Object.entries(lapsByDriver).forEach(([num, laps]) => {
      let best = null;
      laps.forEach((l) => {
        const val = parseN(l.lap_duration);
        if (val == null) return;
        if (!best || val < best.duration) best = { lap_number: l.lap_number, duration: val };
      });
      out[num] = best;
    });
    return out;
  }, [lapsByDriver]);

  // fastest sector lap per driver (per sector)
  const fastestSectorByDriver = useMemo(() => {
    const out = {}; // out[num] = { s1: {lap,duration}, s2:..., s3:... }
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

  // toggle driver selection
  const toggleDriver = useCallback((num) => {
    setSelectedDrivers((prev) => (prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]));
  }, []);

  const clearAll = useCallback(() => {
    const firstFive = Object.keys(driversMap).slice(0, 5).map((s) => Number(s));
    setSelectedDrivers(firstFive);
  }, [driversMap]);

  // ----------------------
  // Build sector graph dataset (for S1,S2,S3)
  // ----------------------
  // We create per-sector datasets containing per-driver lines.
  // Also compute an average per-lap across selected drivers and create a muted dashed line.
  const buildSectorData = useCallback(
    (sectorKey) => {
      if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };
      const datasets = [];

      // average per lap (across selected drivers)
      const avgPerLap = lapLabels.map((lap) => {
        let sum = 0,
          count = 0;
        for (const num of selectedDrivers) {
          const rows = lapsByDriver[num] ?? [];
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
        return count ? sum / count : null;
      });

      // per-driver lines
      for (const num of selectedDrivers) {
        const rows = lapsByDriver[num] ?? [];
        const color = colorForDriver(Number(num));
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

        // fastest marker index (point radius array) for this sector
        const fastest = fastestSectorByDriver[num]?.[`s${sectorKey}`];
        const pointRadius = rows.map((r) => (fastest && r.lap_number === fastest.lap_number ? 4 : 0));
        const pointBg = rows.map((r) => (fastest && r.lap_number === fastest.lap_number ? "#fff" : color));

        datasets.push({
          label: `${driversMap[num] || `#${num}`}`,
          data,
          borderColor: color,
          backgroundColor: color,
          pointRadius,
          pointBackgroundColor: pointBg,
          tension: 0.25,
        });
      }

      // average dashed muted line (style A: muted dashed)
      datasets.push({
        label: "Average (selected drivers)",
        data: avgPerLap,
        borderColor: "rgba(200,200,200,0.9)",
        borderDash: [6, 6],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.2,
      });

      return { labels: lapLabels, datasets };
    },
    [selectedDrivers, lapLabels, lapsByDriver, fastestSectorByDriver, driversMap]
  );

  // ----------------------
  // Pace graph (lap_duration) with fastest lap markers per driver
  // ----------------------
  const paceGraphData = useMemo(() => {
    if (!selectedDrivers.length) return { labels: lapLabels, datasets: [] };

    const datasets = selectedDrivers.map((num) => {
      const rows = lapsByDriver[num] ?? [];
      const color = colorForDriver(Number(num));
      // data aligned by lapLabels
      const data = lapLabels.map((lap) => {
        const rec = rows.find((r) => Number(r.lap_number) === lap);
        return rec ? parseN(rec.lap_duration) : null;
      });

      // point radius marker where fastest lap occurs
      const fastest = fastestLapByDriver[num];
      const pointRadius = rows.map((r) => (fastest && r.lap_number === fastest.lap_number ? 4 : 0));
      const pointBg = rows.map((r) => (fastest && r.lap_number === fastest.lap_number ? "#fff" : color));

      return {
        label: driversMap[num] || `#${num}`,
        data,
        borderColor: color,
        tension: 0.25,
        pointRadius,
        pointBackgroundColor: pointBg,
      };
    });

    return { labels: lapLabels, datasets };
  }, [selectedDrivers, lapLabels, lapsByDriver, fastestLapByDriver, driversMap]);

  // ----------------------
  // Delta graph (only when exactly 2 drivers selected): A - B lap_time difference
  // ----------------------
  const deltaGraphData = useMemo(() => {
    if (selectedDrivers.length !== 2) return null;
    const [A, B] = selectedDrivers;
    const mapA = (lapsByDriver[A] || []).reduce((acc, l) => ({ ...acc, [l.lap_number]: parseN(l.lap_duration) }), {});
    const mapB = (lapsByDriver[B] || []).reduce((acc, l) => ({ ...acc, [l.lap_number]: parseN(l.lap_duration) }), {});
    const data = lapLabels.map((lap) => {
      const a = mapA[lap];
      const b = mapB[lap];
      if (a == null || b == null) return null;
      return a - b; // positive => A slower
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

  const overallLoading = loading || driversLoading;

  // UI: loading / no data
  if (overallLoading) return <p className="text-sm opacity-70">Loading session analytics…</p>;
  if (!lapsData.length) return <p className="text-sm opacity-60">No lap data available for this session.</p>;

  return (
    <div className="w-full flex gap-4 mt-6 border rounded-lg border-[var(--border-color)] bg-[var(--panel-bg)] p-3">
      {/* LEFT: driver selector */}
      <aside className="w-64 flex-shrink-0 bg-[var(--panel-color)] rounded-lg p-3 max-h-[120vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Drivers</h4>
          <button
            onClick={clearAll}
            className="text-xs px-2 py-1 rounded border border-[var(--border-color)] hover:bg-white/5"
            title="Reset to first 5"
          >
            Clear All
          </button>
        </div>

        <p className="text-xs opacity-70 mb-3">Click to toggle drivers (first 5 preselected)</p>

        {Object.keys(driversMap).length === 0 ? (
          <p className="text-xs opacity-50">No drivers found.</p>
        ) : (
          Object.entries(driversMap).map(([numStr, name]) => {
            const num = Number(numStr);
            const selected = selectedDrivers.includes(num);
            return (
              <div
                key={num}
                onClick={() => toggleDriver(num)}
                className={`flex items-center justify-between p-2 mb-2 rounded-lg cursor-pointer transition ${
                  selected ? "bg-[var(--primary-color)] text-white" : "hover:bg-white/5 bg-transparent"
                }`}
              >
                <div className="text-sm truncate">{name}</div>
                <div className="text-xs opacity-80">({num})</div>
              </div>
            );
          })
        )}
      </aside>

      {/* RIGHT: charts */}
      <main className="flex-1 flex flex-col gap-4">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {selectedDrivers.length === 0 ? (
              <div className="text-sm opacity-60">No drivers selected.</div>
            ) : (
              selectedDrivers.map((num) => (
                <div key={num} className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-xs">
                  {driversMap[num] || `#${num}`} <span className="opacity-80">({num})</span>
                  <button onClick={() => toggleDriver(num)} className="ml-1 text-white/80">✕</button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedLayout((p) => !p)}
              className="text-xs px-3 py-1 rounded border border-[var(--border-color)] hover:bg-white/5"
            >
              {expandedLayout ? "Compact view" : "Enlarge graphs"}
            </button>
          </div>
        </div>

        {/* stacked mini sector graphs */}
        <section className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((s) => {
            const sectorData = buildSectorData(s);
            return (
              <div key={`sector-${s}`} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold">Sector {s} — Sector time (s)</h5>
                  <div className="text-xs opacity-70">Avg = dashed</div>
                </div>
                <div style={{ height: SECTOR_GRAPH_HEIGHT, position: "relative" }}>
                  <Line
                    key={`sector-${s}-${selectedDrivers.join(",")}`}
                    data={sectorData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 11 } } },
                        tooltip: { mode: "index", intersect: false },
                      },
                      scales: {
                        x: { title: { display: true, text: "Lap" } },
                        y: { title: { display: true, text: "Seconds (s)" } },
                      },
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* pace + delta area */}
        <div className={expandedLayout ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-4"}>
          {/* Pace */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold">Overall Lap Pace</h5>
              <div className="text-xs opacity-70">Fastest lap marked</div>
            </div>
            <div style={{ height: PACE_GRAPH_HEIGHT, position: "relative" }}>
              <Line
                key={`pace-${selectedDrivers.join(",")}`}
                data={paceGraphData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: { mode: "index", intersect: false },
                  },
                  scales: {
                    x: { title: { display: true, text: "Lap" } },
                    y: { title: { display: true, text: "Lap time (s)" } },
                  },
                }}
              />
            </div>
          </div>

          {/* Delta */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold">Driver Δ (A − B)</h5>
              <div className="text-xs opacity-70">Shown when exactly 2 drivers selected</div>
            </div>
            <div style={{ height: DELTA_GRAPH_HEIGHT, position: "relative" }}>
              {deltaGraphData ? (
                <Line
                  key={`delta-${selectedDrivers.join(",")}`}
                  data={deltaGraphData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: "top" } },
                    scales: {
                      x: { title: { display: true, text: "Lap" } },
                      y: { title: { display: true, text: "Δ seconds (A - B)" } },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm opacity-60">
                  Select exactly 2 drivers to show delta.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
