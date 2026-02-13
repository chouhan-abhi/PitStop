import React, { useMemo } from "react";
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

const ProgressionChart = ({ title, rounds, series }) => {
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
          backgroundColor: "rgba(0,0,0,0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.6)", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          ticks: { color: "rgba(255,255,255,0.6)", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
    }),
    []
  );

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--panel-color)]/90 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-color)]">
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-red-400">
          Progression
        </span>
      </div>

      <div className="w-full">
        <div style={{ width: "100%", height }}>
          <Line data={chartData} options={options} height={height} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        {normalizedSeries.map((line) => (
          <div
            key={line.id}
            className="flex items-center gap-2 px-2 py-1 rounded-full border border-[var(--border-color)] bg-black/10"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <span className="opacity-80">{line.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[10px] opacity-50">
        Rounds: {rounds.map((r) => r.label).join(" · ")}
      </div>
    </div>
  );
};

export default ProgressionChart;
