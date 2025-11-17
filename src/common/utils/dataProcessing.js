/**
 * Utility functions for data processing and transformation
 */

/**
 * Sort events by date (newest first)
 */
export const sortEventsByDate = (events) => {
  if (!events || !Array.isArray(events)) return [];
  return [...events].sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
};

/**
 * Get latest event from sorted events
 */
export const getLatestEvent = (events) => {
  const sorted = sortEventsByDate(events);
  return sorted[0] || null;
};

/**
 * Get older events (excluding latest)
 */
export const getOlderEvents = (events) => {
  const sorted = sortEventsByDate(events);
  return sorted.slice(1);
};

/**
 * Get latest session from positions data for a meeting
 */
export const getLatestSessionFromPositions = (positionsData, meetingKey) => {
  if (!positionsData || !meetingKey) return null;

  const allSessionsInMeeting = positionsData.filter(pos => pos.meeting_key === meetingKey);
  
  const sessionsChronologically = Array.from(new Set(allSessionsInMeeting.map(pos => pos.session_key)))
    .map(sessionKey => { 
      const sessionPositions = allSessionsInMeeting.filter(pos => pos.session_key === sessionKey);
      return sessionPositions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return sessionsChronologically[0] || null;
};

/**
 * Filter positions to get latest position for each driver
 */
export const getLatestPositionsForDrivers = (positionsData, sessionKey) => {
  if (!positionsData || !sessionKey) return [];

  const sessionPositions = positionsData.filter(pos => pos.session_key === sessionKey);
  const filteredPositions = {};

  sessionPositions.forEach(pos => {
    if (!filteredPositions[pos.driver_number] || 
        new Date(pos.date) > new Date(filteredPositions[pos.driver_number].date)) {
      filteredPositions[pos.driver_number] = pos;
    }
  });

  return Object.values(filteredPositions);
};

/**
 * Merge driver data with position data
 */
export const mergeDriversWithPositions = (driversData, positionsData) => {
  if (!driversData || !positionsData) return [];

  return driversData
    .map(driver => {
      const positionInfo = positionsData.find(pos => pos.driver_number === driver.driver_number);
      return { ...driver, position: positionInfo?.position };
    })
    .filter(driver => driver.position !== undefined)
    .sort((a, b) => a.position - b.position);
};

/**
 * Process sessions data from positions
 * Stores both starting position (older date) and final position (newer date) for each driver
 */
export const processSessionsData = (positionsData) => {
  if (!positionsData || !Array.isArray(positionsData)) return {};

  const sessionsData = {};
  
  positionsData.forEach(pos => {
    if (!sessionsData[pos.session_key]) {
      sessionsData[pos.session_key] = { 
        session_key: pos.session_key,
        session_name: pos.session_name, 
        circuit_short_name: pos.circuit_short_name,
        date: pos.date,
        drivers: {}
      };
    }
    
    const driverKey = pos.driver_number;
    const currentDriver = sessionsData[pos.session_key].drivers[driverKey];
    const posDate = new Date(pos.date);
    
    if (!currentDriver) {
      // First position entry for this driver in this session
      sessionsData[pos.session_key].drivers[driverKey] = {
        ...pos,
        finalPosition: pos.position,
        startingPosition: pos.position,
        finalDate: pos.date,
        startingDate: pos.date
      };
    } else {
      const currentFinalDate = new Date(currentDriver.finalDate || currentDriver.date);
      const currentStartingDate = new Date(currentDriver.startingDate || currentDriver.date);
      
      // Update final position if this is a newer date
      if (posDate > currentFinalDate) {
        sessionsData[pos.session_key].drivers[driverKey] = {
          ...sessionsData[pos.session_key].drivers[driverKey],
          ...pos,
          finalPosition: pos.position,
          finalDate: pos.date
        };
      }
      
      // Update starting position if this is an older date
      if (posDate < currentStartingDate) {
        sessionsData[pos.session_key].drivers[driverKey] = {
          ...sessionsData[pos.session_key].drivers[driverKey],
          startingPosition: pos.position,
          startingDate: pos.date
        };
      }
    }
  });

  return sessionsData;
};

/**
 * Format date for display
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

