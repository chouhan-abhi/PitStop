// src/views/driver/components/shared/DataSection.jsx
import React from "react";

export default function DataSection({ title, color, children }) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-3" style={{ color }}>
        {title}
      </h3>
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
        {children}
      </div>
    </section>
  );
}
