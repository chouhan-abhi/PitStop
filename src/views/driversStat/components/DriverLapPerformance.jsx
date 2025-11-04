// src/views/driver/components/DriverLapPerformance.jsx
import React from "react";
import DataSection from "./shared/DataSection";
import LapChart from "../charts/LapChart";
import AppLoader from "../../../helperComponents/AppLoader";

export default function DriverLapPerformance({ laps, loading, color }) {
  return (
    <DataSection title="Lap Performance" color={color}>
      {loading ? <AppLoader /> : <LapChart laps={laps} color={color} />}
    </DataSection>
  );
}
