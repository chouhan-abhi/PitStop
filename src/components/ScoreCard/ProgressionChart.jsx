import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Decimation,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { getChartTheme } from "../../common/utils/chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Decimation,
  Tooltip,
  Legend
);

const normalizeSeries = (values, length) => {
  if (!Array.isArray(values)) return Array(length).fill(0);
  const out = Array.from({ length }, (_, i) => values[i] ?? null);
  let last = 0;
  return out.map((v) => {
    if (v === null || Number.isNaN(Number(v))) return last;
    last = Number(v);
    return last;
  });
};

const ProgressionChart = ({ title, rounds, series, collapsible = false }) => {
  const chartRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => getChartTheme());
  const height = 220;
  const pointCount = rounds?.length || 0;
  const normalizedSeries = series.map((line) => ({
    ...line,
    points: normalizeSeries(line.points, pointCount),
  }));
  const labels = rounds.map((round) => round.label);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: normalizedSeries.map((line, idx) => ({
        id: line.id,
        label: line.name,
        data: line.points,
        borderColor: line.color || "#ff4d4d",
        backgroundColor: idx === 0 ? "rgba(255,77,77,0.2)" : "transparent",
        borderWidth: idx === 0 ? 3 : 2,
        pointRadius: 0,
        pointHoverRadius: 2,
        tension: 0.35,
        fill: idx === 0,
      })),
    }),
    [labels, normalizedSeries]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        decimation: {
          enabled: true,
          algorithm: "lttb",
          samples: 80,
        },
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.grid,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: theme.text, font: { size: 10 } },
          grid: { color: theme.grid },
        },
        y: {
          ticks: { color: theme.text, font: { size: 10 } },
          grid: { color: theme.grid },
        },
      },
    }),
    [theme]
  );

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getChartTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  }, []);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--panel-color)]/90 p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Progression
          </span>
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="text-[10px] uppercase tracking-wider text-[var(--accent-red)]"
            >
              {collapsed ? "Show" : "Hide"}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="w-full">
            <div style={{ width: "100%", height }}>
              <Line
                ref={chartRef}
                data={chartData}
                options={options}
                height={height}
                datasetIdKey="id"
                redraw
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {normalizedSeries.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-full)] border border-[var(--border-color)] bg-[var(--surface-2)]/40"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
                <span className="text-[var(--text-secondary)]">{line.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressionChart;
