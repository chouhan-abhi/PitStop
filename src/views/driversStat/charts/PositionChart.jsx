import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function PositionChart({ data, color }) {
  if (!data?.length) return <p className="text-gray-400 text-sm">No position data.</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="lap_number" stroke="#666" />
        <YAxis reversed stroke="#666" />
        <Tooltip />
        <Line type="monotone" dataKey="position" stroke={color} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
