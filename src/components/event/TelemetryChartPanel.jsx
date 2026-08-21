import React, { useRef, useCallback, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Decimation,
} from "chart.js";

// Register once — subsequent calls are no-ops in Chart.js v4
ChartJS.register(LineElement, LinearScale, PointElement, Tooltip, Decimation);

// ── Constants ─────────────────────────────────────────────────────────────────

/** DRS value ≥ 10 → flap is physically open */
const isDrsOpen = (val) => Number(val) >= 10;

/** Convert ISO date string to ms-since-epoch safely */
const toMs = (dateStr) => {
  const t = new Date(dateStr).getTime();
  return Number.isFinite(t) ? t : null;
};

/**
 * Project raw car_data rows into chart-ready {x, y} points.
 * x = seconds elapsed since lap start.
 * Points with null y or non-finite x/y are dropped.
 */
const toChartPoints = (rows, lapStartMs, extractor) =>
  rows
    .map((row) => {
      const t = toMs(row.date);
      if (t === null) return null;
      const y = extractor(row);
      if (y == null || !Number.isFinite(y)) return null;
      const x = (t - lapStartMs) / 1000;
      return Number.isFinite(x) ? { x, y } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x); // LTTB requires sorted x

// ── Channel definitions ───────────────────────────────────────────────────────

const CHANNELS = [
  {
    key: "speed",
    label: "SPEED",
    unit: "km/h",
    height: 110,
    yMin: 0,
    yMax: 360,
    stepped: false,
    extractor: (r) => (r.speed != null ? Number(r.speed) : null),
    tickCb: (v) => v,
    tooltipCb: (v, acronym) => `${acronym}: ${v.toFixed(0)} km/h`,
  },
  {
    key: "throttle",
    label: "THROTTLE",
    unit: "%",
    height: 72,
    yMin: 0,
    yMax: 100,
    stepped: false,
    extractor: (r) => (r.throttle != null ? Number(r.throttle) : null),
    color: "#22c55e",
    tickCb: (v) => `${v}%`,
    tooltipCb: (v, acronym) => `${acronym}: ${v.toFixed(0)}%`,
  },
  {
    key: "brake",
    label: "BRAKE",
    unit: "",
    height: 52,
    yMin: 0,
    yMax: 1,
    stepped: "before",
    extractor: (r) => (r.brake > 0 ? 1 : 0),
    color: "#ef4444",
    tickCb: (v) => (v === 1 ? "ON" : ""),
    tooltipCb: (v, acronym) => `${acronym}: ${v > 0 ? "BRAKING" : "—"}`,
  },
  {
    key: "gear",
    label: "GEAR",
    unit: "",
    height: 65,
    yMin: 0,
    yMax: 9,
    stepped: "before",
    extractor: (r) => (r.n_gear != null ? Number(r.n_gear) : null),
    color: "#a855f7",
    tickCb: (v) => (Number.isInteger(v) ? v : ""),
    tooltipCb: (v, acronym) => `${acronym}: G${v}`,
  },
  {
    key: "rpm",
    label: "RPM",
    unit: "",
    height: 78,
    yMin: 0,
    yMax: 15_000,
    stepped: false,
    extractor: (r) => (r.rpm != null ? Number(r.rpm) : null),
    color: "#f97316",
    tickCb: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
    tooltipCb: (v, acronym) => `${acronym}: ${v.toFixed(0)} RPM`,
  },
  {
    key: "drs",
    label: "DRS",
    unit: "",
    height: 44,
    yMin: 0,
    yMax: 1,
    stepped: "before",
    extractor: (r) => (isDrsOpen(r.drs) ? 1 : 0),
    color: "#06b6d4",
    tickCb: (v) => (v === 1 ? "ON" : ""),
    tooltipCb: (v, acronym) => `${acronym}: DRS ${v > 0 ? "OPEN" : "CLOSED"}`,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolve driver color — driver's team color or channel default or fallback */
const resolveColor = (driver, channelColor) => {
  if (driver?.team_colour) return `#${driver.team_colour}`;
  return channelColor || "var(--md-primary)";
};

const GRID_COLOR     = "rgba(255,255,255,0.04)";
const BORDER_COLOR   = "rgba(255,255,255,0.07)";
const TICK_COLOR     = "rgba(255,255,255,0.28)";
const TOOLTIP_BG     = "rgba(5,5,8,0.92)";
const TOOLTIP_BORDER = "rgba(255,255,255,0.07)";

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * TelemetryChartPanel
 *
 * Renders 6 stacked, time-synchronised Chart.js charts covering:
 *   Speed · Throttle · Brake · Gear · RPM · DRS
 *
 * X-axis: seconds elapsed since lap start (shared across all charts).
 * Moving the cursor over any chart syncs the crosshair across all others.
 *
 * Props
 *   dataA     — array of raw car_data rows for driver A
 *   dataB     — array of raw car_data rows for driver B (empty [] to hide)
 *   driverA   — driver object { name_acronym, team_colour, ... } for A
 *   driverB   — driver object for B
 *   lapStartMs — unix ms timestamp of lap start (for X offset)
 */
const TelemetryChartPanel = ({ dataA = [], dataB = [], driverA, driverB, lapStartMs }) => {
  // One ref slot per channel chart (indexed by CHANNELS order)
  const chartRefs = useRef(CHANNELS.map(() => null));

  // Pre-compute {x,y} point arrays per channel per driver
  const pointsA = useMemo(() => {
    if (!dataA.length || !lapStartMs) return {};
    return Object.fromEntries(
      CHANNELS.map((ch) => [ch.key, toChartPoints(dataA, lapStartMs, ch.extractor)])
    );
  }, [dataA, lapStartMs]);

  const pointsB = useMemo(() => {
    if (!dataB.length || !lapStartMs) return {};
    return Object.fromEntries(
      CHANNELS.map((ch) => [ch.key, toChartPoints(dataB, lapStartMs, ch.extractor)])
    );
  }, [dataB, lapStartMs]);

  /** Propagate hover index to sibling charts */
  const syncCharts = useCallback((sourceIdx, hoverIndex) => {
    chartRefs.current.forEach((chart, i) => {
      if (i === sourceIdx || !chart) return;
      const dsCount = chart.data?.datasets?.length ?? 0;
      if (dsCount === 0) return;
      const activeElems = Array.from({ length: dsCount }, (_, di) => ({
        datasetIndex: di,
        index: hoverIndex,
      }));
      chart.tooltip?.setActiveElements(activeElems, { x: 0, y: 0 });
      chart.update("none");
    });
  }, []);

  const colorA = resolveColor(driverA, "var(--md-primary)");
  const colorB = resolveColor(driverB, "#fb923c");

  return (
    <div className="w-full">
      {CHANNELS.map((ch, idx) => {
        const ptA = pointsA[ch.key] ?? [];
        const ptB = pointsB[ch.key] ?? [];
        const isLast = idx === CHANNELS.length - 1;
        const acronymA = driverA?.name_acronym ?? "A";
        const acronymB = driverB?.name_acronym ?? "B";

        // Build datasets; only include non-empty arrays
        const datasets = [
          ptA.length > 0 && {
            label: acronymA,
            data: ptA,
            borderColor: ch.color ?? colorA,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: ch.stepped ? 0 : 0.08,
            stepped: ch.stepped || false,
            backgroundColor: "transparent",
          },
          ptB.length > 0 && {
            label: acronymB,
            data: ptB,
            borderColor: colorB,
            borderDash: [4, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: ch.stepped ? 0 : 0.08,
            stepped: ch.stepped || false,
            backgroundColor: "transparent",
          },
        ].filter(Boolean);

        if (datasets.length === 0) return null;

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          parsing: false,   // required for LTTB decimation with {x,y} data
          normalized: true,
          interaction: { mode: "index", intersect: false, axis: "x" },

          plugins: {
            decimation: {
              enabled: true,
              algorithm: "lttb",
              samples: 150,
            },
            legend: { display: false },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: TOOLTIP_BG,
              borderColor: TOOLTIP_BORDER,
              borderWidth: 1,
              titleFont: { family: "monospace", size: 9 },
              bodyFont:  { family: "monospace", size: 9 },
              padding: 6,
              callbacks: {
                title: ([item]) =>
                  item ? `+${Number(item.parsed?.x ?? 0).toFixed(2)}s` : "",
                label: (ctx) =>
                  ch.tooltipCb(ctx.parsed?.y ?? 0, ctx.dataset.label),
              },
            },
          },

          onHover: (_event, elements) => {
            if (elements.length > 0) {
              syncCharts(idx, elements[0].index);
            }
          },

          scales: {
            x: {
              type: "linear",
              display: isLast,  // only show X axis on the bottom chart
              grid: { color: GRID_COLOR },
              border: { color: BORDER_COLOR },
              ticks: {
                font: { family: "monospace", size: 9 },
                color: TICK_COLOR,
                maxTicksLimit: 8,
                callback: (v) => `+${v}s`,
              },
            },
            y: {
              display: true,
              min: ch.yMin,
              max: ch.yMax,
              grid: { color: GRID_COLOR },
              border: { color: BORDER_COLOR },
              ticks: {
                font: { family: "monospace", size: 9 },
                color: TICK_COLOR,
                maxTicksLimit: ch.key === "drs" || ch.key === "brake" ? 2 : 4,
                callback: ch.tickCb,
              },
            },
          },
        };

        return (
          <div
            key={ch.key}
            className="relative border-b border-white/[0.04] last:border-b-0"
            style={{ height: ch.height }}
          >
            {/* Channel label */}
            <span
              className="absolute top-0 left-0 z-10 font-mono text-[8px] font-black tracking-widest text-[var(--md-on-surface-variant)]/60 bg-black/40 px-1.5 py-0.5 pointer-events-none select-none"
              style={{ borderRadius: "0 0 2px 0" }}
            >
              {ch.label}
              {ch.unit ? ` (${ch.unit})` : ""}
            </span>

            <Line
              ref={(el) => { chartRefs.current[idx] = el; }}
              data={{ datasets }}
              options={options}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TelemetryChartPanel;
