// src/views/driver/components/DriverPitStopSummary.jsx
import React from "react";
import DataSection from "./shared/DataSection";
import PitStopChart from "../charts/PitStopChart";

export default function DriverPitStopSummary({ pitStops, color }) {
  return (
    <DataSection title="Pit Stop Summary" color={color}>
      <PitStopChart pitStops={pitStops} color={color} />
    </DataSection>
  );
}
