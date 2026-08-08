import React, { useEffect, useState } from "react";
import { Sparkles, BrainCircuit } from "lucide-react";

const CIRCUIT_SPECS = {
  bahrain: { length: "5.412 KM", laps: "57 LAPS" },
  jeddah: { length: "6.174 KM", laps: "50 LAPS" },
  albert: { length: "5.278 KM", laps: "58 LAPS" },
  suzuka: { length: "5.807 KM", laps: "53 LAPS" },
  shanghai: { length: "5.451 KM", laps: "56 LAPS" },
  miami: { length: "5.412 KM", laps: "57 LAPS" },
  imola: { length: "4.909 KM", laps: "63 LAPS" },
  monaco: { length: "3.337 KM", laps: "78 LAPS" },
  gilles: { length: "4.361 KM", laps: "70 LAPS" },
  catalunya: { length: "4.657 KM", laps: "66 LAPS" },
  red_bull: { length: "4.318 KM", laps: "71 LAPS" },
  silverstone: { length: "5.891 KM", laps: "52 LAPS" },
  hungaroring: { length: "4.381 KM", laps: "70 LAPS" },
  spa: { length: "7.004 KM", laps: "44 LAPS" },
  zandvoort: { length: "4.259 KM", laps: "72 LAPS" },
  monza: { length: "5.793 KM", laps: "53 LAPS" },
  baku: { length: "6.003 KM", laps: "51 LAPS" },
  marina_bay: { length: "4.940 KM", laps: "62 LAPS" },
  americas: { length: "5.513 KM", laps: "56 LAPS" },
  hermanos: { length: "4.304 KM", laps: "71 LAPS" },
  interlagos: { length: "4.309 KM", laps: "71 LAPS" },
  vegas: { length: "6.201 KM", laps: "50 LAPS" },
  lusail: { length: "5.419 KM", laps: "57 LAPS" },
  yas_marina: { length: "5.281 KM", laps: "58 LAPS" },
};

const getSpecs = (eventName = "", circuitName = "") => {
  const str = `${eventName} ${circuitName}`.toLowerCase();
  if (str.includes("bahrain")) return CIRCUIT_SPECS.bahrain;
  if (str.includes("jeddah") || str.includes("saudi")) return CIRCUIT_SPECS.jeddah;
  if (str.includes("albert") || str.includes("melbourne") || str.includes("australia")) return CIRCUIT_SPECS.albert;
  if (str.includes("suzuka") || str.includes("japan")) return CIRCUIT_SPECS.suzuka;
  if (str.includes("shanghai") || str.includes("china")) return CIRCUIT_SPECS.shanghai;
  if (str.includes("miami")) return CIRCUIT_SPECS.miami;
  if (str.includes("imola") || str.includes("romagna")) return CIRCUIT_SPECS.imola;
  if (str.includes("monaco")) return CIRCUIT_SPECS.monaco;
  if (str.includes("gilles") || str.includes("villeneuve") || str.includes("canada") || str.includes("montreal")) return CIRCUIT_SPECS.gilles;
  if (str.includes("catalunya") || str.includes("barcelona") || str.includes("spain")) return CIRCUIT_SPECS.catalunya;
  if (str.includes("red bull") || str.includes("spielberg") || str.includes("austria")) return CIRCUIT_SPECS.red_bull;
  if (str.includes("silverstone") || str.includes("british") || str.includes("uk")) return CIRCUIT_SPECS.silverstone;
  if (str.includes("hungaroring") || str.includes("budapest") || str.includes("hungary")) return CIRCUIT_SPECS.hungaroring;
  if (str.includes("spa-francorchamps") || str.includes("spa") || str.includes("belgium")) return CIRCUIT_SPECS.spa;
  if (str.includes("zandvoort") || str.includes("dutch") || str.includes("netherlands")) return CIRCUIT_SPECS.zandvoort;
  if (str.includes("monza") || str.includes("italy")) return CIRCUIT_SPECS.monza;
  if (str.includes("baku") || str.includes("azerbaijan")) return CIRCUIT_SPECS.baku;
  if (str.includes("marina bay") || str.includes("singapore")) return CIRCUIT_SPECS.marina_bay;
  if (str.includes("americas") || str.includes("austin") || str.includes("united states") || str.includes("usa")) return CIRCUIT_SPECS.americas;
  if (str.includes("rodríguez") || str.includes("hermanos") || str.includes("mexico")) return CIRCUIT_SPECS.hermanos;
  if (str.includes("interlagos") || str.includes("são paulo") || str.includes("brazil")) return CIRCUIT_SPECS.interlagos;
  if (str.includes("las vegas") || str.includes("vegas")) return CIRCUIT_SPECS.vegas;
  if (str.includes("lusail") || str.includes("qatar")) return CIRCUIT_SPECS.lusail;
  if (str.includes("yas marina") || str.includes("abu dhabi")) return CIRCUIT_SPECS.yas_marina;

  return { length: "—", laps: "—" };
};

export const generateWeekendSummary = async (event, positions = []) => {
  if (!event) return "";

  const getPName = (p) => p ? (p.full_name || p.driver || p.name || p.driver_name || "Driver") : "";
  const getPTeam = (p) => p ? (p.team_name || p.constructor || p.constructor_name || "Team") : "";

  const name1 = getPName(p1);
  const team1 = getPTeam(p1);
  const name2 = getPName(p2);
  const team2 = getPTeam(p2);
  const name3 = getPName(p3);
  const team3 = getPTeam(p3);

  const eventName = event.meeting_name || "Grand Prix";
  const circuit = event.circuit_short_name || "Circuit";
  const location = event.location || event.country_name || "Location";
  const specs = getSpecs(eventName, circuit);

  const isComplete = event.status === "complete" || (event.date_start && new Date(event.date_start) <= new Date());

  const baseText = `Consolidated Summary for ${eventName} at ${circuit} (${location}). ` +
    `The race weekend was scheduled on ${event.date_start ? new Date(event.date_start).toLocaleDateString() : "TBD"}. ` +
    (p1 ? `The session concluded with ${name1} (${team1}) claiming P1 victory. ` : "") +
    (p2 ? `P2 position was secured by ${name2} (${team2}), followed by ` : "") +
    (p3 ? `${name3} (${team3}) in P3. ` : "") +
    `The circuit spans ${specs.length} over a total duration of ${specs.laps}.`;

  // Chrome's experimental client-side window.ai.summarizer (Gemini Nano)
  try {
    if (typeof window !== "undefined" && window.ai && window.ai.summarizer) {
      const summarizer = await window.ai.summarizer.create({
        type: "headline",
        format: "plain-text",
        length: "short",
      });
      const summary = await summarizer.summarize(baseText);
      if (summary && summary.trim()) return summary;
    }
  } catch (err) {
    console.warn("Chrome window.ai.summarizer is unavailable. Using template generator.", err);
  }

  // Fallback to high-quality template summaries
  if (isComplete && p1 && p2 && p3) {
    return `The ${eventName} at the ${circuit} circuit concluded with a commanding P1 victory for ${name1} (${team1}). The podium was completed by ${name2} (${team2}) in second place and ${name3} (${team3}) in third. Drivers tackled the ${specs.length} layout over ${specs.laps}.`;
  }

  if (isComplete && p1) {
    return `The ${eventName} weekend at ${circuit} ended with ${name1} (${team1}) leading the final race classification in P1. Telemetry logs recorded classifications across a scheduled ${specs.laps} race distance on the ${specs.length} track.`;
  }

  return `The ${eventName} weekend at the ${circuit} in ${location} is scheduled on the calendar. Drivers will compete across the ${specs.length} layout over a total race distance of ${specs.laps}. Session starting classifications and live telemetry feeds will stream directly.`;
};

const WeekendSummary = ({ event, positions = [], style = {} }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateWeekendSummary(event, positions)
      .then((res) => {
        if (active) {
          setSummary(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setSummary("Telemetry summary unavailable.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [event, positions]);

  if (!event) return null;

  return (
    <div
      style={{
        background: "rgba(0, 229, 200, 0.02)",
        border: "1px solid rgba(0, 229, 200, 0.12)",
        borderLeft: "3.5px solid var(--md-primary)",
        borderRadius: "var(--shape-sm)",
        padding: "0.875rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.875rem",
        ...style,
      }}
    >
      <div style={{ marginTop: "0.15rem", display: "flex", flexShrink: 0 }}>
        {typeof window !== "undefined" && window.ai?.summarizer ? (
          <BrainCircuit size={16} style={{ color: "var(--md-primary)" }} />
        ) : (
          <Sparkles size={16} style={{ color: "var(--md-primary)" }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          fontWeight: 700,
          color: "var(--md-primary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "0.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          Consolidated Weekend Summary
          {typeof window !== "undefined" && window.ai?.summarizer && (
            <span style={{ fontSize: "0.5rem", opacity: 0.6, background: "rgba(0, 229, 200, 0.08)", padding: "0.05rem 0.25rem", borderRadius: "1px" }}>
              CHROME AI
            </span>
          )}
        </div>

        {loading ? (
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--md-on-surface-variant)",
            margin: 0,
            animation: "pulse 1.5s infinite",
          }} className="animate-pulse">
            CONSOLIDATING WEEKEND TELEMETRY FEED...
          </p>
        ) : (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            color: "var(--md-on-surface-variant)",
            lineHeight: 1.45,
            margin: 0,
          }}>
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};

export default WeekendSummary;
