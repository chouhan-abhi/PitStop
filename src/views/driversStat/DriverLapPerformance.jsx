// src/views/driver/components/DriverLapPerformance.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DriverLapPerformance({ laps, compareLaps, color, compareColor }) {
  const data = laps.map((lap, i) => ({
    lap: lap.lap_number,
    timeA: lap.lap_duration,
    timeB: compareLaps?.[i]?.lap_duration,
  }));

  return (
    <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800">
      <h3 className="text-lg font-semibold mb-2">Lap Time Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="lap" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Line type="monotone" dataKey="timeA" stroke={color} dot={false} />
          {compareLaps && <Line type="monotone" dataKey="timeB" stroke={compareColor} dot={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
