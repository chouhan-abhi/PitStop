// src/views/driver/useDriverComparison.js
import {
  useDrivers,
  useDriverLaps,
  useDriverStints,
} from "./useDriverLaps"; // adjust imports as per your structure

export const useDriverComparison = (sessionKey, driverA, driverB) => {
  const driverAData = useDrivers(driverA, sessionKey);
  const driverBData = useDrivers(driverB, sessionKey);

  const lapsA = useDriverLaps(sessionKey, driverA);
  const lapsB = useDriverLaps(sessionKey, driverB);

  const stintsA = useDriverStints(sessionKey, driverA);
  const stintsB = useDriverStints(sessionKey, driverB);

  return {
    driverAData,
    driverBData,
    lapsA,
    lapsB,
    stintsA,
    stintsB,
  };
};
