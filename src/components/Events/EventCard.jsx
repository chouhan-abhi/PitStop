import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopDriversCard } from './TopDriversCard';
import { useLatestSessionDrivers } from '../Drivers/useLatestSessionDrivers';
import { usePositions } from '../Drivers/usePositions';
import CircuitSVG from '../Common/CircuitSVG';
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
    { enabled: isLatest && Boolean(event.meeting_key && latestSessionKeyForDrivers) }
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
    <div className="flex flex-col">
      <div className="flex-1">
        {/* Circuit SVG and Event Info - Side by Side */}
        <div className={`flex ${isLatest ? 'flex-row gap-4' : 'flex-row gap-3'} items-start mb-3`}>
          {/* Circuit SVG */}
          <div className="flex-shrink-0">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--panel-color)', opacity: 0.6 }}>
              <CircuitSVG 
                circuitName={event.circuit_short_name}
                location={event.location}
                size={isLatest ? 100 : 70}
                className="transition-opacity hover:opacity-100"
              />
            </div>
          </div>
          
          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <p 
              className={`font-semibold mb-1 ${isLatest ? 'text-xl' : 'text-base'}`}
              style={{ color: 'var(--primary-color)' }}
            >
              {event.meeting_name}
            </p>
            <p 
              className={`mb-0.5 ${isLatest ? 'text-sm' : 'text-xs'}`}
              style={{ color: 'var(--text-color)', opacity: 0.7 }}
            >
              {event.circuit_short_name}
            </p>
            <p 
              className={`mb-0.5 ${isLatest ? 'text-sm' : 'text-xs'}`}
              style={{ color: 'var(--text-color)', opacity: 0.7 }}
            >
              {event.location}, {event.country_name}
            </p>
            <p 
              className={isLatest ? 'text-xs' : 'text-xs'}
              style={{ color: 'var(--text-color)', opacity: 0.5 }}
            >
              {formatDate(event.date_start)}
            </p>
          </div>
        </div>
      </div>
      {isLatest && (
        <div className="mt-4">
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
        className="mt-3 text-sm self-start transition-opacity duration-200 hover:opacity-70"
        style={{ color: 'var(--primary-color)' }}
      >
        View Details →
      </button>
    </div>
  );
};

export default EventCard;
