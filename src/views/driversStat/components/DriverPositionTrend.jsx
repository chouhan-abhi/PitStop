// src/views/driver/components/DriverPositionTrend.jsx
import React from "react";
import DataSection from "./shared/DataSection";
import PositionChart from "../charts/PositionChart";

export default function DriverPositionTrend({ data, color }) {
  return (
    <DataSection title="Position Trend" color={color}>
      <PositionChart data={data} color={color} />
    </DataSection>
  );
}
