import React, { lazy, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { usePositions } from './Drivers/usePositions';
import { useEvents } from './Events/useEvents';
import { useLatestSessionDrivers } from './Drivers/useLatestSessionDrivers';
import { useStints } from './Drivers/useStints';

import {
  processSessionsData,
  formatDate
} from '../common/utils/dataProcessing';

import {
  getTeamColorBorder,
  getTeamColorWithOpacity
} from '../common/utils/colors';

import {
  ArrowLeft,
  Flag,
  MapPin,
  CalendarDays
} from "lucide-react";

import {
  getF1Points,
  SESSION_TITLE_MAP
} from '../common/utils/constants';
const StintsGraph = lazy(() => import('./Common/StintsGraph'));
const SessionPaceAnalytics = lazy(() => import('./Common/SessionPaceAnalytics'));

export const EventDetails = () => {

  const { meetingKey } = useParams();
  const navigate = useNavigate();

  // --- FETCH QUERIES ---------------------------------------------------------

  const {
    data: allDriversRaw,
    isLoading: driversLoading,
    isError: driversError,
    error: driversErrObj
  } = useLatestSessionDrivers(meetingKey, null);

  const {
    data: allPositionsRaw,
    isLoading: positionsLoading,
    isError: positionsError,
    error: positionsErrObj
  } = usePositions(meetingKey, null, null);

  const {
    data: eventDetailsData,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrObj
  } = useEvents("2025", null);


  // --- COMBINED LOADING / ERROR ---------------------------------------------

  const isLoading = driversLoading || positionsLoading || eventsLoading;

  const isError = driversError || positionsError || eventsError;
  const errorObj =
    driversErrObj || positionsErrObj || eventsErrObj;


  // --- SAFETY GUARDS ---------------------------------------------------------

  const eventList = Array.isArray(eventDetailsData)
    ? eventDetailsData
    : [];

  const positionsList = Array.isArray(allPositionsRaw)
    ? allPositionsRaw
    : [];


  // --- CURRENT EVENT DETAILS -------------------------------------------------

  const currentEvent = useMemo(() => {
    if (!eventList.length || !meetingKey) return null;
    const id = Number(meetingKey);
    return eventList.find(ev => ev.meeting_key === id) || null;
  }, [eventList, meetingKey]);


  // --- SESSION DATA PROCESSING ----------------------------------------------

  const sessionsData = useMemo(() => {
    return positionsList.length
      ? processSessionsData(positionsList)
      : {};
  }, [positionsList]);


  const sortedSessions = useMemo(() => {
    const arr = Object.values(sessionsData);
    if (!arr.length) return [];
    return arr.sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );
  }, [sessionsData]);


  // --- LATEST SESSION FOR STINTS --------------------------------------------

  const latestSessionKey = sortedSessions[0]?.session_key || null;

  const { data: stintsData, isLoading: stintsLoading } = useStints(
    latestSessionKey,
    { enabled: Boolean(latestSessionKey) }
  );


  // --- LOCAL STATE -----------------------------------------------------------

  const [openSessionKey, setOpenSessionKey] = useState(
    sortedSessions[0]?.session_key || null
  );

  const toggleSession = (key) => {
    setOpenSessionKey((prev) => (prev === key ? null : key));
  };


  // --- PROCESS STINT DATA ----------------------------------------------------

  const stintsByDriver = useMemo(() => {
    if (!Array.isArray(stintsData)) return {};

    const map = {};

    stintsData.forEach(stint => {
      if (!map[stint.driver_number]) {
        map[stint.driver_number] = [];
      }
      map[stint.driver_number].push(stint);
    });

    Object.keys(map).forEach(driverNum => {
      map[driverNum].sort(
        (a, b) => a.lap_start - b.lap_start
      );
    });

    return map;
  }, [stintsData]);


  // --- SESSION TITLE ---------------------------------------------------------

  const getSessionTitle = (index, totalSessions) => {
    const raceIndex = totalSessions - 1 - index;
    return SESSION_TITLE_MAP[raceIndex] || `Session ${raceIndex + 1}`;
  };


  // --- LOADING STATE ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <p className="text-lg" style={{ color: 'var(--text-color)' }}>
          Loading event details...
        </p>
      </div>
    );
  }

  // --- ERROR STATE -----------------------------------------------------------

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <p className="text-lg" style={{ color: 'var(--primary-color)' }}>
          Error: {errorObj?.message || 'Failed to load event details.'}
        </p>
      </div>
    );
  }


  // --- NO EVENT FOUND --------------------------------------------------------

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--text-color)' }}>
            Event not found.
          </p>

          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  // ---------------------------------------------------------------------------
  //                                RENDER
  // ---------------------------------------------------------------------------

  return (

    <div className="p-6 px-8 w-full" style={{ color: "var(--text-color)" }}>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--primary-color)" }}
      >
        <ArrowLeft size={16} />
        Back
      </button>


      {/* HEADER */}
      <div className="flex items-start justify-between w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3"
            style={{ color: "var(--primary-color)" }}>
            {currentEvent.meeting_name}
            <Flag size={24} className="opacity-80" />
          </h1>

          <div className="space-y-1">
            <p className="text-base flex items-center gap-2"
              style={{ color: "var(--text-color)", opacity: 0.7 }}>
              <MapPin size={16} />
              {currentEvent.location}, {currentEvent.country_name}
            </p>

            <p className="text-sm flex items-center gap-2"
              style={{ color: "var(--text-color)", opacity: 0.5 }}>
              <CalendarDays size={16} />
              {formatDate(currentEvent.date_start)}
            </p>
          </div>
        </div>
      </div>


      {/* SESSIONS AREA */}
      <h2 className="text-lg font-semibold mt-8 mb-4"
        style={{ color: 'var(--text-color)', opacity: 0.8 }}>
        Sessions
      </h2>

      {/* NO SESSIONS */}
      {!sortedSessions.length && (
        <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.5 }}>
          No session data available.
        </p>
      )}


      {/* MAIN CONTENT */}
      {sortedSessions.length > 0 && (
        <div className="space-y-4">

          {/* LATEST SESSION (FULL WIDTH) */}
          {sortedSessions[0] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* TABLE: POSITIONS */}
              <div>
                <h3 className="text-base font-semibold mb-3"
                  style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                  {getSessionTitle(0, sortedSessions.length)}
                  {' - '}
                  {sortedSessions[0].session_name}
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full rounded-md"
                    style={{ border: `1px solid var(--border-color)` }}>
                    <thead>
                      <tr>
                        <th className="py-2 px-4 text-left text-sm font-semibold"
                          style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                          Pos
                        </th>

                        <th className="py-2 px-4 text-left text-sm font-semibold"
                          style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                          Driver
                        </th>
                        <th className="py-2 px-4 text-left text-sm font-semibold"
                          style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                          Team
                        </th>
                        <th className="py-2 px-4 text-left text-sm font-semibold"
                          style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                          Start
                        </th>

                        {/* RACE ONLY COLUMN */}
                        {getSessionTitle(0, sortedSessions.length).toLowerCase() === "race day" && (
                          <th className="py-2 px-4 text-left text-sm font-semibold"
                            style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                            Pts
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>

                      {Object.values(sortedSessions[0].drivers || {})
                        .sort((a, b) =>
                          (a.finalPosition || a.position || 999) -
                          (b.finalPosition || b.position || 999)
                        )
                        .map(driverPos => {

                          const full = allDriversRaw?.find(
                            d => d.driver_number === driverPos.driver_number
                          );

                          const final = driverPos.finalPosition ?? driverPos.position;
                          const start = driverPos.startingPosition ?? driverPos.starting_grid_position;

                          return (
                            <tr key={driverPos.driver_number}
                              className="transition-opacity duration-150 hover:opacity-80"
                              style={{
                                borderBottom: `1px solid var(--border-color)`,
                                backgroundColor: full?.team_colour
                                  ? getTeamColorWithOpacity(full.team_colour, '15')
                                  : "transparent"
                              }}
                            >

                              <td className="py-2 px-4 text-base"
                                style={{ color: 'var(--text-color)' }}>
                                {final}
                              </td>

                              <td className="py-2 px-4">
                                <div className="flex items-center">
                                  {full?.headshot_url && (
                                    <img
                                      src={full.headshot_url}
                                      alt={full.full_name}
                                      className="w-8 h-8 rounded-full mr-3 border"
                                      style={{
                                        borderColor: getTeamColorBorder(
                                          full.team_colour
                                        )
                                      }}
                                    />
                                  )}
                                  <span className="text-base font-medium"
                                    style={{ color: 'var(--text-color)' }}>
                                    {full?.full_name || driverPos.full_name}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2 px-4 text-base"
                                style={{
                                  color: getTeamColorBorder(full?.team_colour || "ffffff")
                                }}>
                                {full?.team_name || driverPos.team_name}
                              </td>

                              <td className="py-2 px-4 text-base"
                                style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                                {start || "N/A"}
                              </td>

                              {/* RACE ONLY COLUMN */}
                              {getSessionTitle(0, sortedSessions.length).toLowerCase() === "race day" && (
                                <td className="py-2 px-4 text-base"
                                  style={{ color: 'var(--text-color)' }}>
                                  {getF1Points(final)}
                                </td>
                              )}
                            </tr>
                          );
                        })}

                    </tbody>
                  </table>
                </div>
              </div>


              {/* STINTS GRAPH */}
              <div>
                <h3 className="text-base font-semibold mb-3"
                  style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                  Stints
                </h3>

                {stintsLoading ? (
                  <p className="text-sm"
                    style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                    Loading stints…
                  </p>
                ) : (
                  Array.isArray(stintsData) && stintsData.length > 0 ? (
                    <StintsGraph
                      stintsByDriver={stintsByDriver}
                      allDrivers={allDriversRaw}
                      totalLaps={71}
                    />
                  ) : (
                    <p className="text-sm"
                      style={{ color: 'var(--text-color)', opacity: 0.5 }}>
                      No stints data available.
                    </p>
                  )
                )}
              </div>
            </div>
          )}
          
          <div className='w-full'>
            <SessionPaceAnalytics sessionKey={sortedSessions[0].session_key} meetingKey={meetingKey} />
          </div>


          {/* OTHER SESSIONS — COLLAPSIBLE */}
          {sortedSessions.length > 1 && (
            <div className="space-y-4 mt-6">

              {sortedSessions.slice(1).map((session, index) => {
                const actualIndex = index + 1;
                const isOpen = openSessionKey === session.session_key;

                return (
                  <div
                    key={session.session_key}
                    className="rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)]"
                  >

                    {/* HEADER */}
                    <div
                      onClick={() => toggleSession(session.session_key)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:shadow-lg cursor-pointer"
                    >

                      <div className="text-sm font-semibold flex gap-2"
                        style={{ color: "var(--text-color)", opacity: 0.9 }}>
                        <svg
                          width="18"
                          height="18"
                          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                          style={{ opacity: 0.6 }}
                        >
                          <path
                            d="M6 9l6 6 6-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>

                        {getSessionTitle(actualIndex, sortedSessions.length)}
                      </div>

                    </div>


                    {/* BODY */}
                    {isOpen && (
                      <div className="px-4 pb-4">

                        <div className="overflow-x-auto mt-2">
                          <table className="min-w-full"
                            style={{ border: `1px solid var(--border-color)` }}>
                            <thead>
                              <tr>
                                <th className="py-3 px-5 text-left text-sm font-semibold"
                                  style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                  Pos
                                </th>
                                <th className="py-3 px-5 text-left text-sm font-semibold"
                                  style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                  Driver
                                </th>
                                <th className="py-3 px-5 text-left text-sm font-semibold"
                                  style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                  Team
                                </th>
                                <th className="py-3 px-5 text-left text-sm font-semibold"
                                  style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                  Start
                                </th>
                              </tr>
                            </thead>

                            <tbody>

                              {Object.values(session.drivers || {})
                                .sort((a, b) =>
                                  (a.finalPosition || a.position || 999) -
                                  (b.finalPosition || b.position || 999)
                                )
                                .map(driverPos => {

                                  const full = allDriversRaw?.find(
                                    d => d.driver_number === driverPos.driver_number
                                  );

                                  const final = driverPos.finalPosition ?? driverPos.position;
                                  const start = driverPos.startingPosition ?? driverPos.starting_grid_position;

                                  return (
                                    <tr key={driverPos.driver_number}
                                      className="transition-opacity duration-150 hover:opacity-70"
                                      style={{
                                        borderBottom: `1px solid var(--border-color)`,
                                        backgroundColor: full?.team_colour
                                          ? getTeamColorWithOpacity(full.team_colour, "15")
                                          : "transparent"
                                      }}
                                    >

                                      <td className="py-3 px-5 text-base"
                                        style={{ color: "var(--text-color)" }}>
                                        {final}
                                      </td>

                                      <td className="py-3 px-5">
                                        <div className="flex items-center">
                                          {full?.headshot_url && (
                                            <img
                                              src={full.headshot_url}
                                              alt={full.full_name}
                                              className="w-8 h-8 rounded-full mr-3 border"
                                              style={{
                                                borderColor: getTeamColorBorder(full.team_colour)
                                              }}
                                            />
                                          )}
                                          <span className="text-base font-medium"
                                            style={{ color: "var(--text-color)" }}>
                                            {full?.full_name || driverPos.full_name}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-5 text-base"
                                        style={{
                                          color: getTeamColorBorder(full?.team_colour || "ffffff")
                                        }}>
                                        {full?.team_name || driverPos.team_name}
                                      </td>

                                      <td className="py-3 px-5 text-base"
                                        style={{ color: "var(--text-color)", opacity: 0.6 }}>
                                        {start || "N/A"}
                                      </td>

                                    </tr>
                                  );
                                })}

                            </tbody>
                          </table>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
