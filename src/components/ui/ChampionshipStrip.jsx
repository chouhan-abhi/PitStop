import React from "react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { getTeamColorBorder } from "../../common/utils/colors";

const POSITION_BADGE = {
  "1": { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  "2": { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "rgba(148,163,184,0.25)" },
  "3": { bg: "rgba(180,83,9,0.12)", color: "#d97706", border: "rgba(180,83,9,0.25)" },
};

const ChampionshipStrip = ({ leaders = [], title = "DRIVER STANDINGS TOP 3", className = "" }) => {
  if (!leaders.length) return null;

  return (
    <div
      className={className}
      style={{
        background: "var(--md-surface-container-high)",
        border: "1px solid var(--md-outline-variant)",
        borderRadius: "var(--shape-md)",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.75rem",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid var(--md-outline-variant)",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--md-primary)",
          boxShadow: "0 0 6px var(--md-primary)",
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--md-on-surface)",
        }}>
          {title}
        </span>
      </div>

      {/* Leader rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {leaders.slice(0, 3).map((driver) => (
          <LeaderRow key={driver.driverId || driver.driver_number} driver={driver} />
        ))}
      </div>
    </div>
  );
};

const LeaderRow = ({ driver }) => {
  const animatedPoints = useAnimatedNumber(driver.season?.points ?? 0);
  const teamColor = getTeamColorBorder(driver.team_colour);
  const pos = String(driver.season?.position);
  const badge = POSITION_BADGE[pos];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.5rem 0.625rem",
        background: "var(--md-surface-container)",
        border: "1px solid var(--md-outline-variant)",
        borderRadius: "var(--shape-sm)",
        borderLeft: `3px solid ${teamColor}`,
        transition: "background 80ms ease",
      }}
    >
      {/* Position badge */}
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "var(--shape-xs)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          fontWeight: 800,
          flexShrink: 0,
          background: badge?.bg || "var(--md-surface-container-high)",
          color: badge?.color || "var(--md-on-surface-variant)",
          border: `1px solid ${badge?.border || "var(--md-outline-variant)"}`,
          letterSpacing: "0.02em",
        }}
      >
        P{pos}
      </span>

      <DriverAvatar driver={driver} size="sm" variant="circle" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.875rem",
            color: "var(--md-on-surface)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}>
            {driver.full_name}
          </span>
          <CountryFlag countryCode={driver.country_code} size="sm" />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: teamColor,
        }}>
          {driver.team_name}
        </span>
      </div>

      {/* Points */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1rem",
          fontWeight: 800,
          color: "var(--md-on-surface)",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          display: "block",
        }}>
          {animatedPoints}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          color: "var(--md-on-surface-variant)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          PTS
        </span>
      </div>
    </div>
  );
};

export default ChampionshipStrip;
