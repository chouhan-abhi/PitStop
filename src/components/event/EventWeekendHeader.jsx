import React from "react";
import { CalendarDays, Flag, MapPin } from "lucide-react";

import { formatDate } from "../../common/utils/dataProcessing";
import HeroSurface from "../ui/HeroSurface";
import DriverCard from "../ui/DriverCard";
import StatusPill from "../ui/StatusPill";

const EventWeekendHeader = ({ event, winner }) => {
  if (!event) return null;

  return (
    <div className="space-y-5">
      <HeroSurface
        circuitName={event.circuit_short_name}
        location={event.location}
        eager3D={false}
        minHeight="min-h-[300px] sm:min-h-[360px]"
      >
        <StatusPill tone="live">Race Weekend</StatusPill>
        <h1 className="md3-headline-lg mt-3 flex items-center gap-3 max-w-2xl">
          {event.meeting_name}
          <Flag size={24} className="opacity-80 shrink-0" />
        </h1>
        <p className="md3-body-md text-[var(--md-on-surface-variant)] flex items-center gap-2 mt-2">
          <MapPin size={16} />
          {event.location}, {event.country_name}
        </p>
        <p className="md3-label-md text-[var(--md-on-surface-variant)] flex items-center gap-2 mt-1">
          <CalendarDays size={16} />
          {formatDate(event.date_start)}
        </p>
      </HeroSurface>
      {winner && (
        <div className="max-w-sm">
          <DriverCard driver={winner} position={1} featured />
        </div>
      )}
    </div>
  );
};

export default EventWeekendHeader;
