import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function LapChart({ laps, color }) {
  if (!laps?.length) return <p className="text-gray-400 text-sm">No lap data.</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={laps}>
        <XAxis dataKey="lap_number" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip />
        <Line type="monotone" dataKey="lap_duration" stroke={color} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
