import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { usePositions } from "./Drivers/usePositions";
import { useEvents } from "./Events/useEvents";
import { useDriverRegistry } from "../common/drivers/useDriverRegistry";
import { useStints } from "./Drivers/useStints";
import { buildDriversByNumber, enrichDriversWithPositions } from "../common/drivers/driverRegistry";
import { processSessionsData } from "../common/utils/dataProcessing";
import { getLatestPositionsForDrivers } from "../common/utils/dataProcessing";

import DataStatusBanner from "./ui/DataStatusBanner";
import Button from "./ui/Button";
import Tabs from "./ui/Tabs";
import LoadingState from "./ui/LoadingState";

import EventWeekendHeader from "./event/EventWeekendHeader";
import WeekendSummary from "./Common/WeekendSummary";
import EventResultsTab from "./event/EventResultsTab";
import EventPaceTab from "./event/EventPaceTab";
import EventStintsTab from "./event/EventStintsTab";
import EventCompareTab from "./event/EventCompareTab";

const EVENT_TABS = [
  { key: "results", label: "Results" },
  { key: "pace", label: "Pace" },
  { key: "stints", label: "Stints" },
  { key: "compare", label: "Compare" },
];

export const EventDetails = ({ year }) => {
  const { meetingKey } = useParams();
  const navigate = useNavigate();
  const meetingKeyNumber = Number(meetingKey);
  const hasValidMeetingKey = Number.isFinite(meetingKeyNumber);
  const [activeTab, setActiveTab] = useState("results");

  const {
    data: allPositionsRaw,
    dataMeta: positionsMeta,
    isLoading: positionsLoading,
    isError: positionsError,
    error: positionsErrObj,
  } = usePositions(meetingKey, null, null, { year });

  const {
    data: eventDetailsData,
    dataMeta: eventsMeta,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrObj,
  } = useEvents(year, null);

  const eventList = Array.isArray(eventDetailsData) ? eventDetailsData : [];
  const positionsList = Array.isArray(allPositionsRaw) ? allPositionsRaw : [];

  const currentEvent = useMemo(() => {
    if (!eventList.length || !hasValidMeetingKey) return null;
    return eventList.find((ev) => Number(ev.meeting_key) === Number(meetingKeyNumber)) || null;
  }, [eventList, hasValidMeetingKey, meetingKeyNumber]);

  const currentEventYear = currentEvent?.date_start
    ? new Date(currentEvent.date_start).getFullYear()
    : null;

  const sessionsData = useMemo(
    () => (positionsList.length ? processSessionsData(positionsList) : {}),
    [positionsList]
  );

  const sortedSessions = useMemo(() => {
    const arr = Object.values(sessionsData);
    if (!arr.length) return [];
    return arr.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [sessionsData]);

  const latestSessionKey = sortedSessions[0]?.session_key || null;

  const {
    data: allDriversRaw,
    dataMeta: driversMeta,
    isError: driversError,
    error: driversErrObj,
  } = useDriverRegistry(meetingKey, latestSessionKey, {
    year: currentEventYear,
    enabled: Boolean(currentEventYear),
  });

  const driversList = Array.isArray(allDriversRaw) ? allDriversRaw : [];
  const driversByNumber = useMemo(() => buildDriversByNumber(driversList), [driversList]);

  const driversWithPositions = useMemo(() => {
    if (!latestSessionKey || !positionsList.length) return driversList;
    const latestPositions = getLatestPositionsForDrivers(positionsList, latestSessionKey);
    return enrichDriversWithPositions(driversList, latestPositions);
  }, [driversList, latestSessionKey, positionsList]);

  const raceWinner = useMemo(() => {
    const raceSession = sortedSessions.find((s) =>
      (s.session_name || "").toLowerCase().includes("race")
    ) || sortedSessions[0];
    if (!raceSession) return null;
    const p1 = Object.values(raceSession.drivers || {}).find(
      (d) => (d.finalPosition ?? d.position) === 1
    );
    if (!p1) return null;
    return driversByNumber.get(Number(p1.driver_number)) || p1;
  }, [sortedSessions, driversByNumber]);

  const { data: stintsData, isLoading: stintsLoading } = useStints(latestSessionKey, {
    enabled: Boolean(latestSessionKey),
  });

  const stintsByDriver = useMemo(() => {
    if (!Array.isArray(stintsData)) return {};
    const map = {};
    stintsData.forEach((stint) => {
      if (!map[stint.driver_number]) map[stint.driver_number] = [];
      map[stint.driver_number].push(stint);
    });
    Object.keys(map).forEach((driverNum) => {
      map[driverNum].sort((a, b) => a.lap_start - b.lap_start);
    });
    return map;
  }, [stintsData]);

  const isLoading = positionsLoading || eventsLoading;
  const isError = driversError || positionsError || eventsError;
  const errorObj = driversErrObj || positionsErrObj || eventsErrObj;
  const hasSomeData = eventList.length > 0 || positionsList.length > 0 || driversList.length > 0;

  const combinedMeta = useMemo(() => {
    const metas = [eventsMeta, positionsMeta, driversMeta].filter(Boolean);
    if (!metas.length) return null;
    return {
      isStale: metas.some((m) => m?.isStale),
      warning:
        metas.map((m) => m?.warning).find(Boolean) ||
        (isError ? errorObj?.message || "Some data failed to load." : null),
      source: metas.map((m) => m?.source).find(Boolean) || null,
      fetchedAt: metas.map((m) => m?.fetchedAt).find(Boolean) || null,
    };
  }, [driversMeta, errorObj?.message, eventsMeta, isError, positionsMeta]);

  if (isLoading) {
    return <LoadingState message="Loading event details..." className="min-h-[50vh]" />;
  }

  if (isError && !hasSomeData) {
    return (
      <div className="app-shell py-10 text-center text-[var(--danger)]">
        Error: {errorObj?.message || "Failed to load event details."}
      </div>
    );
  }

  if (!hasValidMeetingKey) {
    return (
      <div className="app-shell py-10 text-center space-y-4">
        <p className="text-[var(--text-primary)]">Invalid event identifier.</p>
        <Button variant="filled" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="app-shell py-10 text-center space-y-4">
        <p className="text-[var(--text-primary)]">Event not found.</p>
        <Button variant="filled" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="app-shell py-4 lg:py-8 space-y-5">
      <DataStatusBanner meta={combinedMeta} />

      <Button variant="text" onClick={() => navigate("/")}>
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <EventWeekendHeader event={currentEvent} winner={raceWinner} />

      <WeekendSummary event={currentEvent} positions={driversWithPositions} />

      <Tabs tabs={EVENT_TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === "results" && (
        <EventResultsTab sortedSessions={sortedSessions} driversByNumber={driversByNumber} />
      )}
      {activeTab === "pace" && (
        <EventPaceTab sessionKey={latestSessionKey} meetingKey={meetingKey} year={year} />
      )}
      {activeTab === "stints" && (
        <EventStintsTab
          stintsByDriver={stintsByDriver}
          driversWithPositions={driversWithPositions}
          stintsLoading={stintsLoading}
        />
      )}
      {activeTab === "compare" && (
        <EventCompareTab sessionKey={latestSessionKey} meetingKey={meetingKey} year={year} />
      )}
    </div>
  );
};
