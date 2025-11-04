// src/views/driver/components/DriverEventSummary.jsx
import React from "react";
import DataSection from "./shared/DataSection";

export default function DriverEventSummary({ event, color }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-8">
      <DataSection title="Event Summary" color={color}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-300">
          <p><span className="text-gray-400">Circuit:</span> {event.circuit_name || "—"}</p>
          <p><span className="text-gray-400">Country:</span> {event.country_name || "—"}</p>
          <p><span className="text-gray-400">Date:</span> {event.date_start?.split("T")[0] || "—"}</p>
          <p><span className="text-gray-400">Session:</span> {event.session_name || "—"}</p>
        </div>
      </DataSection>
    </div>
  );
}
