import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopDriversCard } from './TopDriversCard';
import { useLatestSessionDrivers } from '../Drivers/useLatestSessionDrivers';
import { usePositions } from '../Drivers/usePositions';
import CircuitModel from '../Common/CircuitModel';
import {
  getLatestSessionFromPositions,
  getLatestPositionsForDrivers,
  mergeDriversWithPositions,
  formatDate
} from '../../common/utils/dataProcessing';

const EventCard = ({ event, isLatest = false }) => {
  const [latestSessionKeyForDrivers, setLatestSessionKeyForDrivers] = useState(null);
  const [latestSessionInfoForDrivers, setLatestSessionInfoForDrivers] = useState(null);
  const navigate = useNavigate();

  if (!event) {
    return null;
  }

  const eventYear = event?.date_start
    ? new Date(event.date_start).getFullYear()
    : null;

  const eventMeta = {
    title: event.meeting_name || "Grand Prix",
    circuit: event.circuit_short_name || event.circuit_name || "Circuit",
    location: event.location || event.country_name || "Location",
    country: event.country_name || "",
    date: formatDate(event.date_start),
  };

  const { data: positionsData, isLoading: positionsLoading, isError: positionsIsError, error: positionsError } = usePositions(
    isLatest ? event.meeting_key : null,
    null,
    null,
    { enabled: isLatest && Boolean(event.meeting_key) }
  );

  useEffect(() => {
    if (isLatest && event && positionsData?.length > 0) {
      const latestSession = getLatestSessionFromPositions(positionsData, event.meeting_key);
      if (latestSession) {
        setLatestSessionKeyForDrivers(latestSession.session_key);
        setLatestSessionInfoForDrivers({
          meeting_key: event.meeting_key,
          session_key: latestSession.session_key,
          session_name: latestSession.session_name,
          circuit_short_name: latestSession.circuit_short_name,
        });
      }
    }
  }, [isLatest, event, positionsData]);

  const { data: latestSessionDriversRaw, isLoading: latestSessionDriversLoading, isError: latestSessionDriversIsError, error: latestSessionDriversError } = useLatestSessionDrivers(
    isLatest ? event.meeting_key : null,
    latestSessionKeyForDrivers,
    {
      enabled: isLatest && Boolean(event.meeting_key && latestSessionKeyForDrivers),
      year: eventYear,
    }
  );

  const mergedDriversData = useMemo(() => {
    if (!isLatest || !latestSessionDriversRaw || !positionsData?.length || !latestSessionKeyForDrivers) {
      return [];
    }
    const latestPositions = getLatestPositionsForDrivers(positionsData, latestSessionKeyForDrivers);
    return mergeDriversWithPositions(latestSessionDriversRaw, latestPositions);
  }, [isLatest, latestSessionDriversRaw, positionsData, latestSessionKeyForDrivers]);

  const handleViewDetailsClick = () => {
    navigate(`/event/${event.meeting_key}`);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        isLatest ? "" : "border border-[var(--border-color)]  bg-[var(--panel-color)]/70"
      } p-3 sm:p-4`}
    >
      { isLatest ? null : <div className="absolute -right-6 -top-10 text-[120px] sm:text-[160px] font-black tracking-tight text-white/5 select-none">
        {event.country_name?.slice(0, 2) || "GP"}
      </div>}
      <div className="flex-1">
        <div
          className={`flex ${
            isLatest ? "flex-row gap-3 sm:gap-4 lg:gap-5" : "flex-row gap-2 sm:gap-3"
          } items-start mb-2 sm:mb-3`}
        >
          <div className="flex-shrink-0">
            <div className="p-2 rounded-xl bg-black/10">
              <CircuitModel
                circuitName={eventMeta.circuit}
                location={eventMeta.location}
                size={isLatest ? 150 : 120}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-300/80">
                {isLatest ? "Latest" : "Event"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            </div>
            <p
              className={`font-semibold mb-1 ${isLatest ? "text-xl" : "text-base"}`}
              style={{ color: "var(--primary-color)" }}
            >
              {eventMeta.title}
            </p>
            <p
              className={`mb-0.5 ${isLatest ? "text-sm" : "text-xs"}`}
              style={{ color: "var(--text-color)", opacity: 0.7 }}
            >
              {eventMeta.circuit}
            </p>
            <p
              className={`mb-0.5 ${isLatest ? "text-sm" : "text-xs"}`}
              style={{ color: "var(--text-color)", opacity: 0.7 }}
            >
              {eventMeta.location}
              {eventMeta.country ? `, ${eventMeta.country}` : ""}
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--text-color)", opacity: 0.5 }}
            >
              {eventMeta.date}
            </p>
          </div>
        </div>
      </div>
      {isLatest && (
        <div className="mt-2 sm:mt-3 lg:mt-4">
          <TopDriversCard
            driversData={mergedDriversData}
            sessionInfo={latestSessionInfoForDrivers}
            driversLoading={latestSessionDriversLoading || positionsLoading}
            driversIsError={latestSessionDriversIsError || positionsIsError}
            driversError={latestSessionDriversError || positionsError}
          />
        </div>
      )}
      <button
        onClick={handleViewDetailsClick}
        className="mt-2 sm:mt-3 text-sm self-start transition-opacity duration-200 hover:opacity-70"
        style={{ color: 'var(--primary-color)' }}
      >
        View Details →
      </button>
    </div>
  );
};

export default EventCard;
