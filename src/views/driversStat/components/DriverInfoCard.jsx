// src/views/driver/components/DriverInfoCard.jsx
import React from "react";

export default function DriverInfoCard({ driver, color }) {
  return (
    <div className="flex flex-col items-center text-center bg-gray-900/40 rounded-2xl p-6 border border-gray-800">
      <img
        src={driver.headshot_url}
        alt={driver.full_name}
        className="w-40 h-40 rounded-full object-cover border-2 border-gray-700"
        onError={(e) => (e.target.src = "/assets/default-driver.png")}
      />
      <h2 className="mt-4 text-2xl font-bold">{driver.last_name}</h2>
      <p className="text-gray-400 text-sm">{driver.first_name}</p>
      <span className="text-sm font-semibold text-gray-300 mt-1">
        #{driver.driver_number}
      </span>
      <div className="mt-4 text-sm">
        <p className="font-semibold" style={{ color }}>
          {driver.team_name}
        </p>
        <p className="text-gray-400 mt-1">Country: {driver.country_code || "N/A"}</p>
      </div>
    </div>
  );
}
