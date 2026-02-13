import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TopDriversCard } from "./TopDriversCard";
import { useLatestSessionDrivers } from "../Drivers/useLatestSessionDrivers";
import { usePositions } from "../Drivers/usePositions";
import CircuitModel from "../Common/CircuitModel";
import CircuitSVG from "../Common/CircuitSVG";
import {
  getLatestSessionFromPositions,
  getLatestPositionsForDrivers,
  mergeDriversWithPositions,
  formatDate,
} from "../../common/utils/dataProcessing";
import StatusPill from "../ui/StatusPill";

const EventCard = ({ event, isLatest = false }) => {
  const [latestSessionKeyForDrivers, setLatestSessionKeyForDrivers] = useState(null);
  const [latestSessionInfoForDrivers, setLatestSessionInfoForDrivers] = useState(null);
  const navigate = useNavigate();

  if (!event) return null;

  const eventYear = event?.date_start ? new Date(event.date_start).getFullYear() : null;

  const eventMeta = {
    title: event.meeting_name || "Grand Prix",
    circuit: event.circuit_short_name || event.circuit_name || "Circuit",
    location: event.location || event.country_name || "Location",
    country: event.country_name || "",
    date: formatDate(event.date_start),
  };

  const {
    data: positionsData,
    isLoading: positionsLoading,
    isError: positionsIsError,
    error: positionsError,
  } = usePositions(isLatest ? event.meeting_key : null, null, null, {
    enabled: isLatest && Boolean(event.meeting_key),
    year: eventYear,
  });

  useEffect(() => {
    if (!isLatest || !event || positionsData?.length <= 0) return;
    const latestSession = getLatestSessionFromPositions(positionsData, event.meeting_key);
    if (!latestSession) return;

    setLatestSessionKeyForDrivers(latestSession.session_key);
    setLatestSessionInfoForDrivers({
      meeting_key: event.meeting_key,
      session_key: latestSession.session_key,
      session_name: latestSession.session_name,
      circuit_short_name: latestSession.circuit_short_name,
    });
  }, [isLatest, event, positionsData]);

  const {
    data: latestSessionDriversRaw,
    isLoading: latestSessionDriversLoading,
    isError: latestSessionDriversIsError,
    error: latestSessionDriversError,
  } = useLatestSessionDrivers(isLatest ? event.meeting_key : null, latestSessionKeyForDrivers, {
    enabled: isLatest && Boolean(event.meeting_key && latestSessionKeyForDrivers),
    year: eventYear,
  });

  const mergedDriversData = useMemo(() => {
    if (!isLatest || !latestSessionDriversRaw || !positionsData?.length || !latestSessionKeyForDrivers) {
      return [];
    }
    const latestPositions = getLatestPositionsForDrivers(positionsData, latestSessionKeyForDrivers);
    return mergeDriversWithPositions(latestSessionDriversRaw, latestPositions);
  }, [isLatest, latestSessionDriversRaw, positionsData, latestSessionKeyForDrivers]);

  return (
    <div
      className={`f1-card relative overflow-hidden rounded-lg border p-3 sm:p-4 ${
        isLatest
          ? "border-red-500/35 bg-gradient-to-br from-red-900/25 via-[var(--panel-color)] to-black/25 shadow-[var(--shadow-md)]"
          : "border-[var(--border-color)] bg-[var(--panel-color)]/80"
      }`}
    >
      <div className="absolute -right-6 -top-8 text-[120px] sm:text-[140px] display-title font-black tracking-tight text-white/5 select-none">
        {event.country_name?.slice(0, 2) || "GP"}
      </div>

      <div className="relative z-10">
        <div className={`flex ${isLatest ? "gap-4" : "gap-3"} items-start`}>
          <div className="flex-shrink-0 p-1 rounded-xl bg-black/20 border border-[var(--border-color)]/50">
            {isLatest ? (
              <CircuitModel
                circuitName={eventMeta.circuit}
                location={eventMeta.location}
                size={150}
                enabled
                defer={false}
              />
            ) : (
              <div className="w-[120px] h-[120px] flex items-center justify-center rounded-xl bg-[var(--panel-color)]/55">
                <CircuitSVG circuitName={eventMeta.circuit} location={eventMeta.location} size={98} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusPill tone={isLatest ? "live" : "neutral"}>
                {isLatest ? "Latest Event" : "Archived Event"}
              </StatusPill>
            </div>
            <p className={`display-title font-bold mb-1 ${isLatest ? "text-2xl" : "text-lg"}`}>
              {eventMeta.title}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">{eventMeta.circuit}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {eventMeta.location}
              {eventMeta.country ? `, ${eventMeta.country}` : ""}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{eventMeta.date}</p>

            <button
              type="button"
              onClick={() => navigate(`/event/${event.meeting_key}`)}
              className="btn btn-accent mt-3"
            >
              View Details
            </button>
          </div>
        </div>

        {isLatest && (
          <div className="mt-3 sm:mt-4">
            <TopDriversCard
              driversData={mergedDriversData}
              sessionInfo={latestSessionInfoForDrivers}
              driversLoading={latestSessionDriversLoading || positionsLoading}
              driversIsError={latestSessionDriversIsError || positionsIsError}
              driversError={latestSessionDriversError || positionsError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
