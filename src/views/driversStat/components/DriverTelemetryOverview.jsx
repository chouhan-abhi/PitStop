// src/views/driver/components/DriverTelemetryOverview.jsx
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import DataSection from "./shared/DataSection";

export default function DriverTelemetryOverview({ data, color }) {
  return (
    <DataSection title="Telemetry Overview" color={color}>
      {data?.length ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.slice(0, 300)}>
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="speed" stroke={color} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-sm">No telemetry data available.</p>
      )}
    </DataSection>
  );
}
