import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function PitStopChart({ pitStops, color }) {
  if (!pitStops?.length) return <p className="text-gray-400 text-sm">No pit stop data.</p>;

  const formatted = pitStops.map((p) => ({
    lap: p.lap_number,
    duration: p.pit_duration || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted}>
        <XAxis dataKey="lap" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip />
        <Bar dataKey="duration" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}
