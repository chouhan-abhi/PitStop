// src/components/DriverLapChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DriverLapChart = ({ laps }) => {
  if (!laps?.length) return <p className="text-gray-400 text-sm">No lap data available.</p>;

  const data = laps.map((lap) => ({
    lap: lap.lap_number,
    lapTime: lap.lap_duration,
    speedTrap: lap.st_speed,
    i1Speed: lap.i1_speed,
    i2Speed: lap.i2_speed,
  }));

  return (
    <div className="bg-black/60 border border-red-600/20 p-4 rounded-xl shadow-lg w-full max-w-3xl mx-auto mt-6">
      <h3 className="text-red-500 text-lg font-semibold mb-3 text-center uppercase tracking-widest">
        Lap Performance Overview
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="lap" stroke="#ccc" />
          <YAxis yAxisId="left" stroke="#f87171" label={{ value: "Lap Time (s)", angle: -90, position: "insideLeft", fill: "#f87171" }} />
          <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" label={{ value: "Speed (km/h)", angle: 90, position: "insideRight", fill: "#38bdf8" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111", border: "1px solid #333", color: "#fff" }}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="lapTime" stroke="#f87171" name="Lap Duration" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="speedTrap" stroke="#38bdf8" name="Speed Trap" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DriverLapChart;
