import React, { useState } from "react";
import { Trophy } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { getTeamColorBorder } from "../../common/utils/colors";

// Mapping to official F1 website high-res headshot URLs
const DRIVER_IMAGES = {
  VER: "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
  HAM: "https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
  LEC: "https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
  NOR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
  ALO: "https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
  PIA: "https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
  PER: "https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
  SAI: "https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
  RUS: "https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
  TSU: "https://www.formula1.com/content/dam/fom-website/drivers/Y/YAUTSU01_Yuki_Tsunoda/yautsu01.png",
  OCO: "https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
  GAS: "https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
  ALB: "https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
  HUL: "https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
  STR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
  MAG: "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png",
  RIC: "https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png",
  BOT: "https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png",
  ZHO: "https://www.formula1.com/content/dam/fom-website/drivers/Z/ZHOGUA01_Zhou_Guanyu/zhogua01.png",
  SAR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png",
  COL: "https://www.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png",
  LAW: "https://www.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png",
};

// 2-letter ISO to 3-letter IOC country codes
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

// Career stats mapping (Wins & Podiums as of 2024 season)
const CAREER_STATS = {
  VER: { wins: 61, podiums: 107 },
  HAM: { wins: 103, podiums: 197 },
  ALO: { wins: 32, podiums: 106 },
  PER: { wins: 6, podiums: 39 },
  LEC: { wins: 7, podiums: 37 },
  SAI: { wins: 3, podiums: 24 },
  NOR: { wins: 1, podiums: 22 },
  RUS: { wins: 2, podiums: 14 },
  PIA: { wins: 1, podiums: 7 },
  GAS: { wins: 1, podiums: 4 },
  OCO: { wins: 1, podiums: 3 },
  BOT: { wins: 10, podiums: 67 },
  RIC: { wins: 8, podiums: 32 },
  TSU: { wins: 0, podiums: 0 },
  STR: { wins: 0, podiums: 3 },
  ALB: { wins: 0, podiums: 2 },
  MAG: { wins: 0, podiums: 1 },
  HUL: { wins: 0, podiums: 0 },
  ZHO: { wins: 0, podiums: 0 },
  SAR: { wins: 0, podiums: 0 },
  BEA: { wins: 0, podiums: 0 },
  LAW: { wins: 0, podiums: 0 },
  COL: { wins: 0, podiums: 0 },
};

// Full team name mapping for premium display
const getFullTeamName = (teamName) => {
  const norm = (teamName || "").toLowerCase();
  if (norm.includes("mercedes")) return "Mercedes-AMG Petronas";
  if (norm.includes("red bull")) return "Oracle Red Bull Racing";
  if (norm.includes("ferrari")) return "Scuderia Ferrari";
  if (norm.includes("mclaren")) return "McLaren Formula 1 Team";
  if (norm.includes("aston martin")) return "Aston Martin F1 Team";
  if (norm.includes("alpine")) return "Alpine F1 Team";
  if (norm.includes("williams")) return "Williams Racing";
  if (norm.includes("haas")) return "MoneyGram Haas F1 Team";
  if (norm.includes("rb") || norm.includes("racing bulls") || norm.includes("visa")) return "Visa Cash App RB";
  if (norm.includes("sauber") || norm.includes("kick")) return "Stake F1 Team Kick Sauber";
  return teamName;
};

const POSITION_BADGE = {
  1: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)", icon: true },
  2: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.3)", icon: false },
  3: { bg: "rgba(180,83,9,0.15)", color: "#d97706", border: "1px solid rgba(180,83,9,0.3)", icon: false },
};

const DriverCard = ({
  driver,
  position,
  compact = false,
  featured = false,
  onClick,
  className = "",
  year = 2024,
}) => {
  const [hovered, setHovered] = useState(false);
  const pos = position ?? driver?.position;
  const teamColor = getTeamColorBorder(driver?.team_colour);
  const posStyle = POSITION_BADGE[pos] || null;
  const Wrapper = onClick ? "button" : "div";

  const acronym = driver?.name_acronym || "";
  const threeLetterCountry = COUNTRY_CODE_TO_3LETTER[driver?.country_code] || driver?.country_code || "GBR";
  const headshotUrl = DRIVER_IMAGES[acronym] || driver?.headshot_url || "";
  const fullTeam = getFullTeamName(driver?.team_name);
  const careerWins = CAREER_STATS[acronym]?.wins ?? driver?.season?.wins ?? 0;
  const careerPodiums = CAREER_STATS[acronym]?.podiums ?? driver?.season?.podiums ?? 0;
  const yearSuffix = year ? String(year).slice(-2) : "24";

  if (compact) {
    return (
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={className}
        style={{
          width: "100%",
          textAlign: "left",
          overflow: "hidden",
          borderRadius: "var(--shape-sm)",
          background: "var(--md-surface-container-high)",
          border: "1px solid var(--md-outline-variant)",
          borderLeft: `3px solid ${teamColor}`,
          cursor: onClick ? "pointer" : "default",
          transition: "border-color 100ms ease, background 100ms ease",
          display: "block",
        }}
        onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = teamColor; e.currentTarget.style.background = "var(--md-surface-container-highest)"; } : undefined}
        onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = "var(--md-outline-variant)"; e.currentTarget.style.background = "var(--md-surface-container-high)"; } : undefined}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.75rem" }}>
          <DriverAvatar driver={driver} size="sm" variant="circle" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.1rem" }}>
              {pos && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--shape-xs)",
                  ...posStyle || { background: "var(--md-surface-container-highest)", color: "var(--md-on-surface-variant)", border: "1px solid var(--md-outline-variant)" },
                }}>
                  {posStyle?.icon && <Trophy size={9} />}
                  P{pos}
                </span>
              )}
              {driver?.driver_number && (
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  color: "var(--md-on-surface-variant)",
                  fontWeight: 500,
                }}>
                  #{driver.driver_number}
                </span>
              )}
              <CountryFlag countryCode={driver?.country_code} size="sm" />
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "var(--md-on-surface)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}>
              {driver?.full_name || "Driver"}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: teamColor,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {driver?.team_name}
            </div>
          </div>
          {driver?.season?.points != null && (
            <div style={{
              flexShrink: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--md-on-surface)",
              letterSpacing: "-0.01em",
              background: "var(--md-surface-container-highest)",
              border: "1px solid var(--md-outline-variant)",
              borderRadius: "var(--shape-xs)",
              padding: "0.25rem 0.5rem",
              lineHeight: 1,
            }}>
              {driver.season.points}
              <span style={{ fontSize: "0.5rem", color: "var(--md-on-surface-variant)", marginLeft: "0.2rem", fontWeight: 500 }}>PTS</span>
            </div>
          )}
        </div>
      </Wrapper>
    );
  }

  /* Redesigned Full Grid Card matching screenshot exactly */
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={className}
      style={{
        width: "100%",
        textAlign: "left",
        overflow: "hidden",
        borderRadius: "var(--shape-sm)",
        background: "var(--md-surface-container)",
        border: `1px solid ${hovered ? teamColor : "rgba(255, 255, 255, 0.08)"}`,
        borderTop: `3.5px solid ${teamColor}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 150ms ease",
        display: "block",
        position: "relative",
        padding: "1.25rem",
        boxShadow: hovered ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px ${teamColor}15` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Absolute large faded background number */}
      {driver?.driver_number && (
        <div style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.875rem",
          fontSize: "4.5rem",
          fontWeight: 900,
          fontFamily: "var(--font-mono)",
          color: "rgba(255, 255, 255, 0.03)",
          lineHeight: 1,
          pointerEvents: "none",
          zIndex: 0,
        }}>
          {driver.driver_number}
        </div>
      )}

      {/* Top Section with Avatar Container */}
      <div style={{ display: "flex", justifyContent: "flex-start", position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          {/* Avatar Container with solid team border */}
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "var(--shape-sm)",
            border: `2px solid ${teamColor}`,
            overflow: "hidden",
            background: "#0a0a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {headshotUrl ? (
              <img
                src={headshotUrl}
                alt={driver.full_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div style={{
              display: headshotUrl ? "none" : "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: teamColor,
            }}>
              {acronym || "??"}
            </div>
          </div>

          {/* Overlapping country flag badge */}
          <div style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            background: "#000",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "2px",
            padding: "1px",
            zIndex: 2,
            display: "flex",
          }}>
            <CountryFlag countryCode={driver?.country_code} size="sm" />
          </div>
        </div>
      </div>

      {/* Driver Info Section */}
      <div style={{ marginTop: "1rem", position: "relative", zIndex: 1 }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "#fff",
          textTransform: "uppercase",
          lineHeight: 1.25,
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}>
          {driver.full_name}
        </h3>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          fontWeight: 600,
          color: teamColor,
          marginTop: "0.2rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {fullTeam}
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "1.25rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        paddingTop: "1rem",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Wins */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {careerWins}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", fontWeight: 600, color: "var(--md-on-surface-variant)", marginTop: "0.3rem", letterSpacing: "0.05em" }}>
            WINS
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "rgba(255, 255, 255, 0.05)" }} />

        {/* Podiums */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {careerPodiums}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", fontWeight: 600, color: "var(--md-on-surface-variant)", marginTop: "0.3rem", letterSpacing: "0.05em" }}>
            PODIUMS
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "rgba(255, 255, 255, 0.05)" }} />

        {/* Points */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: "var(--md-primary)", lineHeight: 1 }}>
            {driver.season?.points ?? 0}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", fontWeight: 600, color: "var(--md-on-surface-variant)", marginTop: "0.3rem", letterSpacing: "0.05em" }}>
            PTS '{yearSuffix}
          </div>
        </div>
      </div>

      {/* Bottom view telemetry button text */}
      <div style={{
        marginTop: "1.25rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        paddingTop: "0.8rem",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "0.625rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: hovered ? "var(--md-primary)" : "var(--md-on-surface-variant)",
        textTransform: "uppercase",
        transition: "color 150ms ease",
        position: "relative",
        zIndex: 1,
      }}>
        VIEW TELEMETRY
      </div>
    </Wrapper>
  );
};

export default DriverCard;
