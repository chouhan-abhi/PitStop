import React from "react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

export default function TelemetryChart({ data, color }) {
  if (!data?.length) return <p className="text-gray-400 text-sm">No telemetry data.</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data.slice(0, 300)}>
        <Tooltip />
        <Line type="monotone" dataKey="speed" stroke={color} dot={false} />
        <Line type="monotone" dataKey="rpm" stroke="#8884d8" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
