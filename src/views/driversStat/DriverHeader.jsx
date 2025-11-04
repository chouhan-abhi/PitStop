// src/views/driver/components/DriverHeader.jsx
import React, { useState } from "react";
import { ArrowLeft, Users } from "lucide-react";

export default function DriverHeader({ driver, onCompare }) {
  const [compareMode, setCompareMode] = useState(false);
  const [compareNumber, setCompareNumber] = useState("");

  return (
    <div className="sticky top-0 z-20 bg-black/70 backdrop-blur-lg border-b border-gray-800 px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-gray-300 hover:text-white">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold uppercase">{driver.full_name}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCompareMode(!compareMode)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition"
        >
          <Users size={16} /> Compare
        </button>

        {compareMode && (
          <input
            type="number"
            placeholder="Driver #"
            value={compareNumber}
            onChange={(e) => setCompareNumber(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm text-white rounded-lg px-2 py-1 w-24"
            onKeyDown={(e) => {
              if (e.key === "Enter" && compareNumber) onCompare(compareNumber);
            }}
          />
        )}
      </div>
    </div>
  );
}
