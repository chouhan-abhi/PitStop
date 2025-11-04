// src/views/driver/DriverProfile.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useDrivers } from "../driver/useDrivers";
import { useDriverLaps } from "./useDriverLaps";
import { useDriverStints } from "./useDriverStints";
import {
  useEventSummary,
  useTelemetry,
  usePositionTrend,
  usePitStops,
  useRaceControl,
} from "./useDriverExtras";

import AppLoader from "../../helperComponents/AppLoader";
import AppError from "../../helperComponents/AppError";

// UI Components
import DriverHeader from "./components/DriverHeader";
import DriverInfoCard from "./components/DriverInfoCard";
import DriverEventSummary from "./components/DriverEventSummary";
import DriverLapPerformance from "./components/DriverLapPerformance";
import DriverTelemetryOverview from "./components/DriverTelemetryOverview";
import DriverPositionTrend from "./components/DriverPositionTrend";
import DriverPitStopSummary from "./components/DriverPitStopSummary";
import DriverRaceControl from "./components/DriverRaceControl";
import DriverTyreStints from "./components/DriverTyreStints";

export default function DriverProfile() {
  const { driverNumber } = useParams();
  const sessionKey = "latest";

  // --- Fetch driver and related data ---
  const { data: allDrivers = [], isLoading, isError } = useDrivers(null, sessionKey);
  const driver = allDrivers.find((d) => String(d.driver_number) === String(driverNumber));

  const { data: laps = [], isFetching: lapsLoading } = useDriverLaps(sessionKey, driverNumber);
  const { data: stints = [], isFetching: stintsLoading } = useDriverStints(sessionKey, driverNumber);
  const { data: eventInfo } = useEventSummary(sessionKey);
  const { data: telemetry = [] } = useTelemetry(sessionKey, driverNumber);
  const { data: positions = [] } = usePositionTrend(sessionKey, driverNumber);
  const { data: pitStops = [] } = usePitStops(sessionKey, driverNumber);
  const { data: raceMessages = [] } = useRaceControl(sessionKey, driverNumber);

  // --- Loading / Error States ---
  if (isLoading) return <AppLoader />;
  if (isError || !driver) return <AppError message="Driver not found." />;

  const teamColor = `#${driver.team_colour || "e10600"}`;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <DriverHeader driver={driver} />

      {/* Event Summary */}
      {eventInfo && <DriverEventSummary event={eventInfo} color={teamColor} />}

      <div
        className="
          mx-auto w-full px-6 py-10
          grid grid-cols-1 lg:grid-cols-[350px_1fr]
          xl:grid-cols-[350px_repeat(2,minmax(0,1fr))]
          2xl:grid-cols-[400px_repeat(3,minmax(0,1fr))]
          gap-10
          transition-all duration-300
        "
      >
        {/* Sidebar */}
        <div className="flex flex-col gap-6 col-span-1">
          <DriverInfoCard driver={driver} color={teamColor} />
        </div>

        {/* Analytics Grid */}
        <div className="col-span-full xl:col-span-2 2xl:col-span-3 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 auto-rows-fr">
          <DriverLapPerformance laps={laps} loading={lapsLoading} color={teamColor} />
          <DriverTelemetryOverview data={telemetry} color={teamColor} />
          <DriverPositionTrend data={positions} color={teamColor} />
          <DriverPitStopSummary pitStops={pitStops} color={teamColor} />
          <DriverRaceControl messages={raceMessages} color={teamColor} />
          <DriverTyreStints stints={stints} loading={stintsLoading} color={teamColor} />
        </div>
      </div>
    </div>
  );
}
