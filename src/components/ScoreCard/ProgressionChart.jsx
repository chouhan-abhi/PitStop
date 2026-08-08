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
import Surface from "../ui/Surface";

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
        borderColor: line.color || "#00e5c8",
        backgroundColor: idx === 0 ? "rgba(0,229,200,0.12)" : "transparent",
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
    <Surface tier="container" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="md3-title-md text-[var(--md-on-surface)]">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="md3-label-md text-[var(--md-on-surface-variant)]">
            Progression
          </span>
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="md3-state-layer md3-label-md text-[var(--md-primary)] px-2 py-1 rounded-[var(--shape-sm)]"
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

          <div className="mt-3 flex flex-wrap gap-2 md3-label-md">
            {normalizedSeries.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--shape-full)] bg-[var(--md-surface-container-high)]"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
                <span className="text-[var(--md-on-surface-variant)]">{line.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Surface>
  );
};

export default ProgressionChart;
