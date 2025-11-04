// src/views/driver/components/DriverRaceControl.jsx
import React from "react";
import DataSection from "./shared/DataSection";

export default function DriverRaceControl({ messages, color }) {
  return (
    <DataSection title="Race Control Messages" color={color}>
      {messages?.length ? (
        <ul className="text-sm text-gray-300 space-y-2 max-h-60 overflow-y-auto pr-2">
          {messages.map((msg, i) => (
            <li key={i} className="border-l-2 pl-3 border-gray-700">
              <span className="text-gray-400 text-xs">{msg.date}</span>
              <p>{msg.message || msg.category}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm">No race control messages.</p>
      )}
    </DataSection>
  );
}
