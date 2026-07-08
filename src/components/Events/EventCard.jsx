import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useDriverRegistry } from "../../common/drivers/useDriverRegistry";
import { usePositions } from "../Drivers/usePositions";
import CircuitPreview from "../ui/CircuitPreview";
import {
  getLatestSessionFromPositions,
  getLatestPositionsForDrivers,
  mergeDriversWithPositions,
  formatDate,
} from "../../common/utils/dataProcessing";
import StatusPill from "../ui/StatusPill";
import Button from "../ui/Button";
import DriverCard from "../ui/DriverCard";
import SectionHeader from "../ui/SectionHeader";

const EventCard = ({ event, isLatest = false }) => {
  const navigate = useNavigate();
  const eventYear = event?.date_start ? new Date(event.date_start).getFullYear() : null;

  const { data: positionsData, isLoading: positionsLoading } = usePositions(
    isLatest && event?.meeting_key ? event.meeting_key : null,
    null,
    null,
    { enabled: isLatest && Boolean(event?.meeting_key), year: eventYear }
  );

  const latestSession = useMemo(() => {
    if (!isLatest || !event || !positionsData?.length) return null;
    return getLatestSessionFromPositions(positionsData, event.meeting_key);
  }, [isLatest, event, positionsData]);

  const { data: sessionDrivers, isLoading: driversLoading } = useDriverRegistry(
    isLatest && event?.meeting_key ? event.meeting_key : null,
    latestSession?.session_key,
    { enabled: isLatest && Boolean(latestSession?.session_key), year: eventYear }
  );

  const podium = useMemo(() => {
    if (!isLatest || !sessionDrivers?.length || !positionsData?.length || !latestSession) return [];
    const positions = getLatestPositionsForDrivers(positionsData, latestSession.session_key);
    return mergeDriversWithPositions(sessionDrivers, positions).slice(0, 3);
  }, [isLatest, sessionDrivers, positionsData, latestSession]);

  if (!event) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] border p-4 ${
        isLatest
          ? "border-l-2 border-l-[var(--accent-red)] bg-[var(--panel-color)]"
          : "border-[var(--border-color)] bg-[var(--panel-color)]/80"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <CircuitPreview
          circuitName={event.circuit_short_name || event.circuit_name}
          location={event.location}
          width={140}
          height={100}
          use3D={isLatest}
        />
        <div className="flex-1 min-w-0">
          <StatusPill tone={isLatest ? "live" : "neutral"}>
            {isLatest ? "Latest" : "Archived"}
          </StatusPill>
          <p className="display-title text-xl font-bold mt-2">{event.meeting_name}</p>
          <p className="text-sm text-[var(--text-secondary)]">{event.circuit_short_name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(event.date_start)}</p>
          <Button variant="accent" size="sm" className="mt-3" onClick={() => navigate(`/event/${event.meeting_key}`)}>
            View Weekend
          </Button>
        </div>
      </div>

      {isLatest && (
        <div className="mt-4">
          <SectionHeader title="Podium" subtitle="Latest classified order" compact />
          {positionsLoading || driversLoading ? (
            <p className="text-sm text-[var(--text-muted)] mt-2">Loading podium…</p>
          ) : podium.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              {podium.map((driver) => (
                <DriverCard key={driver.driver_number} driver={driver} position={driver.position} compact />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] mt-2">No podium data.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
