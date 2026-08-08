import React, { useMemo, useState, useRef, useEffect } from "react";
import { Users, Flag, Trophy, Search, SlidersHorizontal, Globe } from "lucide-react";

import { useEvents } from "../Events/useEvents";
import { useDriverRegistry } from "../../common/drivers/useDriverRegistry";
import { usePositions } from "./usePositions";
import { getLatestSessionFromPositions } from "../../common/utils/dataProcessing";
import PageShell from "../ui/PageShell";
import DataStatusBanner from "../ui/DataStatusBanner";
import DriversGridView from "./DriversGridView";
import DriverDetailDrawer from "./DriverDetailDrawer";

// 2-letter ISO to 3-letter IOC country codes (needed for nation filter matching)
const COUNTRY_CODE_TO_3LETTER = {
  GB: "GBR",
  NL: "NED",
  ES: "ESP",
  MC: "MON",
  AU: "AUS",
  FR: "FRA",
  DE: "GER",
  TH: "THA",
  CA: "CAN",
  JP: "JPN",
  CN: "CHN",
  MX: "MEX",
  DK: "DEN",
  FI: "FIN",
  US: "USA",
  AR: "ARG",
  NZ: "NZL",
  BR: "BRA",
  IT: "ITA",
};

const CHUNK_SIZE = 8;

const DriversPage = ({ year }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("ALL");
  const [selectedNation, setSelectedNation] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [nationDropdownOpen, setNationDropdownOpen] = useState(false);

  const sentinelRef = useRef(null);

  const {
    data: eventsData,
    dataMeta: eventsMeta,
    isError: eventsIsError,
    error: eventsError,
  } = useEvents(year, null);

  const { latestEvent } = useMemo(() => {
    if (!Array.isArray(eventsData) || !eventsData.length) {
      return { latestEvent: null };
    }
    const now = new Date();
    const completed = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) <= now)
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
    if (completed.length > 0) return { latestEvent: completed[0] };
    const upcoming = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) > now)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    return { latestEvent: upcoming[0] || null };
  }, [eventsData]);

  const latestEventYear = latestEvent?.date_start
    ? new Date(latestEvent.date_start).getFullYear()
    : null;

  const { data: positionsData } = usePositions(
    latestEvent?.meeting_key,
    null,
    null,
    { enabled: Boolean(latestEvent?.meeting_key), year: latestEventYear }
  );

  const latestSessionKey = useMemo(() => {
    if (!positionsData?.length || !latestEvent?.meeting_key) return null;
    return getLatestSessionFromPositions(positionsData, latestEvent.meeting_key)?.session_key || null;
  }, [positionsData, latestEvent]);

  const {
    data: driversData,
    dataMeta: driversMeta,
    isLoading: driversLoading,
    isError: driversIsError,
    error: driversError,
  } = useDriverRegistry(latestEvent?.meeting_key || null, latestSessionKey, { year });

  const roster = useMemo(() => Array.isArray(driversData) ? driversData : [], [driversData]);

  const dataBannerMeta = useMemo(() => ({
    isStale: Boolean(driversMeta?.isStale || eventsMeta?.isStale),
    warning:
      driversMeta?.warning ||
      eventsMeta?.warning ||
      (driversIsError ? driversError?.message : null) ||
      (eventsIsError ? eventsError?.message : null),
    source: driversMeta?.source || eventsMeta?.source || null,
    fetchedAt: driversMeta?.fetchedAt || eventsMeta?.fetchedAt || null,
  }), [driversError, driversIsError, driversMeta, eventsError, eventsIsError, eventsMeta]);

  // Unique list of teams for dropdown
  const teamsList = useMemo(() => {
    const list = Array.from(new Set(roster.map((d) => d.team_name).filter(Boolean)));
    return ["ALL", ...list.sort()];
  }, [roster]);

  // Unique list of nations (3-letter codes) for dropdown
  const nationsList = useMemo(() => {
    const list = Array.from(new Set(
      roster.map((d) => COUNTRY_CODE_TO_3LETTER[d.country_code] || d.country_code || "GBR").filter(Boolean)
    ));
    return ["ALL", ...list.sort()];
  }, [roster]);

  // Filter roster based on query, team, and nation
  const filteredRoster = useMemo(() => {
    let list = roster;
    if (selectedTeam !== "ALL") {
      list = list.filter((d) => d.team_name === selectedTeam);
    }
    if (selectedNation !== "ALL") {
      list = list.filter((d) => {
        const code3 = COUNTRY_CODE_TO_3LETTER[d.country_code] || d.country_code || "GBR";
        return code3 === selectedNation;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.full_name?.toLowerCase().includes(q) ||
          d.team_name?.toLowerCase().includes(q) ||
          String(d.driver_number) === q ||
          (COUNTRY_CODE_TO_3LETTER[d.country_code] || d.country_code || "").toLowerCase().includes(q)
      );
    }
    // Sort by championship position first, then name
    return [...list].sort((a, b) => {
      const posA = Number(a.season?.position || 999);
      const posB = Number(b.season?.position || 999);
      return posA - posB;
    });
  }, [roster, selectedTeam, selectedNation, searchQuery]);

  // Paginate list using visibleCount state
  const visibleDrivers = useMemo(() => {
    return filteredRoster.slice(0, visibleCount);
  }, [filteredRoster, visibleCount]);

  // IntersectionObserver for autoloading more drivers on scroll to bottom
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && filteredRoster.length > visibleCount) {
        setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, filteredRoster.length));
      }
    }, {
      rootMargin: "150px", // pre-fetch next chunk slightly early
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [filteredRoster.length, visibleCount]);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setTeamDropdownOpen(false);
    setVisibleCount(CHUNK_SIZE);
  };

  const handleNationSelect = (nation) => {
    setSelectedNation(nation);
    setNationDropdownOpen(false);
    setVisibleCount(CHUNK_SIZE);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(CHUNK_SIZE);
  };

  return (
    <PageShell title={null} subtitle={null}>
      <DataStatusBanner meta={dataBannerMeta} />

      {/* Roster Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "2rem",
        marginTop: "0.5rem",
      }}>
        {/* Left column info */}
        <div style={{ flex: "1 1 300px" }}>
          {/* Slanted Active Roster Tag */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(0, 229, 200, 0.08)",
            borderLeft: "3px solid var(--md-primary)",
            padding: "0.25rem 1rem 0.25rem 0.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "var(--md-primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
            marginBottom: "0.6rem",
          }}>
            ACTIVE ROSTER {year}
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.25rem",
            fontWeight: 900,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "0.04em",
          }}>
            DRIVER PERSONNEL
          </h1>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--md-on-surface-variant)",
            marginTop: "0.5rem",
            lineHeight: 1.5,
            maxWidth: "520px",
          }}>
            Championship roster, career records, constructor history, and active performance telemetry.
          </p>
        </div>

        {/* Right column controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          position: "relative",
        }}>
          {/* Search Input with Icon */}
          <div style={{ position: "relative", width: 220 }}>
            <Search size={14} style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--md-on-surface-variant)",
              pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder="Search driver..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: "100%",
                height: 34,
                paddingLeft: "2.25rem",
                paddingRight: "0.75rem",
                background: "var(--md-surface-container-high)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--shape-xs)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                outline: "none",
              }}
            />
          </div>

          {/* TEAM Filter Button with Floating Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setTeamDropdownOpen(!teamDropdownOpen);
                setNationDropdownOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                height: 34,
                padding: "0 0.875rem",
                background: selectedTeam !== "ALL" ? "rgba(0, 229, 200, 0.08)" : "var(--md-surface-container-high)",
                border: `1px solid ${selectedTeam !== "ALL" ? "var(--md-primary)" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: "var(--shape-xs)",
                color: selectedTeam !== "ALL" ? "var(--md-primary)" : "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                outline: "none",
              }}
            >
              <SlidersHorizontal size={12} />
              {selectedTeam === "ALL" ? "TEAM" : selectedTeam}
            </button>

            {teamDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.35rem",
                background: "#0d0e12",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "var(--shape-sm)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                zIndex: 100,
                minWidth: "180px",
                maxHeight: "240px",
                overflowY: "auto",
              }}>
                {teamsList.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTeamSelect(t)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 0.875rem",
                      background: selectedTeam === t ? "rgba(0, 229, 200, 0.08)" : "transparent",
                      color: selectedTeam === t ? "var(--md-primary)" : "rgba(255, 255, 255, 0.8)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NATION Filter Button with Floating Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setNationDropdownOpen(!nationDropdownOpen);
                setTeamDropdownOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                height: 34,
                padding: "0 0.875rem",
                background: selectedNation !== "ALL" ? "rgba(0, 229, 200, 0.08)" : "var(--md-surface-container-high)",
                border: `1px solid ${selectedNation !== "ALL" ? "var(--md-primary)" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: "var(--shape-xs)",
                color: selectedNation !== "ALL" ? "var(--md-primary)" : "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                outline: "none",
              }}
            >
              <Globe size={12} />
              {selectedNation === "ALL" ? "NATION" : selectedNation}
            </button>

            {nationDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.35rem",
                background: "#0d0e12",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "var(--shape-sm)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                zIndex: 100,
                minWidth: "120px",
                maxHeight: "240px",
                overflowY: "auto",
              }}>
                {nationsList.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNationSelect(n)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 0.875rem",
                      background: selectedNation === n ? "rgba(0, 229, 200, 0.08)" : "transparent",
                      color: selectedNation === n ? "var(--md-primary)" : "rgba(255, 255, 255, 0.8)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Roster Grid */}
      {driversIsError && !filteredRoster.length ? (
        <div style={{
          padding: "3rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "var(--danger)",
          background: "rgba(239, 68, 68, 0.05)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "var(--shape-md)",
        }}>
          {driversError?.message || "UNABLE TO LOAD DRIVERS TELEMETRY."}
        </div>
      ) : (
        <DriversGridView
          drivers={visibleDrivers}
          loading={driversLoading}
          onSelect={setSelectedDriver}
          year={year}
        />
      )}

      {/* Sentinel indicator at list end for autoloading */}
      {filteredRoster.length > visibleCount && (
        <div
          ref={sentinelRef}
          style={{
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--md-primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          LOADING TELEMETRY CHUNK...
        </div>
      )}

      {/* List End Status Footer */}
      {!driversLoading && filteredRoster.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "2rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "1.25rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--md-on-surface-variant)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          <div>
            DISPLAYING {visibleDrivers.length} OF {filteredRoster.length} DRIVERS
          </div>
          <div style={{ fontSize: "0.55rem", opacity: 0.6 }}>
            {visibleDrivers.length === filteredRoster.length ? "CLASSIFICATION COMPLETED" : "SCROLL FOR DETAILED FEED"}
          </div>
        </div>
      )}

      {/* Driver Detail Drawer */}
      <DriverDetailDrawer driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </PageShell>
  );
};

export default DriversPage;
