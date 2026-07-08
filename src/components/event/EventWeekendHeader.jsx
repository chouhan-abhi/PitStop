import React from "react";
import { CalendarDays, Flag, MapPin } from "lucide-react";

import { formatDate } from "../../common/utils/dataProcessing";
import CircuitPreview from "../ui/CircuitPreview";
import DriverCard from "../ui/DriverCard";

const EventWeekendHeader = ({ event, winner }) => {
  if (!event) return null;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--panel-color)] p-4 sm:p-6 lg:p-8 shadow-[var(--shadow-sm)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-red-subtle)] via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row items-start justify-between gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)] mb-2">
            Weekend
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-red)]" />
          </div>
          <h1 className="display-title text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            {event.meeting_name}
            <Flag size={22} className="opacity-70" />
          </h1>
          <p className="text-base text-[var(--text-secondary)] flex items-center gap-2 mt-2">
            <MapPin size={16} />
            {event.location}, {event.country_name}
          </p>
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-2 mt-1">
            <CalendarDays size={16} />
            {formatDate(event.date_start)}
          </p>
        </div>
        <CircuitPreview
          circuitName={event.circuit_short_name}
          location={event.location}
          width={360}
          height={180}
          use3D
          className="hidden md:block"
        />
      </div>
      {winner && (
        <div className="relative mt-5 max-w-md">
          <DriverCard driver={winner} position={1} compact />
        </div>
      )}
    </div>
  );
};

export default EventWeekendHeader;
