// src/components/EventHeader.jsx
import React from "react";

const EventHeader = ({ event, formatDate }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--primary-color)" }}>
        {event.meeting_name}
      </h1>
      <div className="text-sm text-[var(--text-color)] opacity-70">
        <div>{event.location}, {event.country_name}</div>
        <div className="text-xs opacity-60">{formatDate(event.date_start)}</div>
      </div>
    </div>
  );
};

export default React.memo(EventHeader);
