// src/views/driver/components/DriverTyreStints.jsx
import React from "react";
import DataSection from "./shared/DataSection";
import AppLoader from "../../../helperComponents/AppLoader";

export default function DriverTyreStints({ stints, loading, color }) {
  return (
    <DataSection title="Tyre Stint Summary" color={color}>
      {loading ? (
        <AppLoader />
      ) : stints.length === 0 ? (
        <p className="text-gray-400 text-sm">No stint data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/30">
          <table className="w-full text-sm">
            <thead className="text-gray-300 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Stint #</th>
                <th className="px-4 py-3 text-left">Compound</th>
                <th className="px-4 py-3 text-left">Lap Start</th>
                <th className="px-4 py-3 text-left">Lap End</th>
                <th className="px-4 py-3 text-left">Tyre Age</th>
              </tr>
            </thead>
            <tbody>
              {stints.map((s, i) => (
                <tr key={i} className="border-t border-gray-800">
                  <td className="px-4 py-2 text-gray-100">{s.stint_number}</td>
                  <td
                    className={`px-4 py-2 font-bold ${
                      s.compound === "SOFT"
                        ? "text-red-400"
                        : s.compound === "MEDIUM"
                        ? "text-yellow-400"
                        : s.compound === "HARD"
                        ? "text-gray-300"
                        : "text-blue-300"
                    }`}
                  >
                    {s.compound}
                  </td>
                  <td className="px-4 py-2 text-gray-300">{s.lap_start}</td>
                  <td className="px-4 py-2 text-gray-300">{s.lap_end}</td>
                  <td className="px-4 py-2 text-gray-400">
                    {s.tyre_age_at_start ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataSection>
  );
}
