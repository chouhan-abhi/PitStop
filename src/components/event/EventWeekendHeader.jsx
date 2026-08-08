import React from "react";
import { CalendarDays, Flag, MapPin } from "lucide-react";

import { formatDate } from "../../common/utils/dataProcessing";
import HeroSurface from "../ui/HeroSurface";
import DriverCard from "../ui/DriverCard";

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

const EventWeekendHeader = ({ event, winner }) => {
  if (!event) return null;
  const specs = getSpecs(event.meeting_name, event.circuit_short_name);

  return (
    <div className="space-y-5">
      <HeroSurface
        circuitName={event.circuit_short_name}
        location={event.location}
        eager3D={false}
        minHeight="min-h-[320px] sm:min-h-[380px]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[var(--md-primary)] bg-[var(--md-primary)]/10 px-2.5 py-0.5 border border-[var(--md-primary)]/30 font-bold uppercase" style={{ borderRadius: "var(--shape-xs)" }}>
            DIST: {specs.length} · LAPS: {specs.laps}
          </span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl mt-3 flex items-center gap-3 max-w-3xl text-white uppercase tracking-wide">
          {event.meeting_name}
          <Flag size={28} className="text-[var(--md-primary)] shrink-0" />
        </h1>

        <p className="text-sm text-[var(--md-on-surface-variant)] flex items-center gap-2 mt-2 font-medium">
          <MapPin size={16} className="text-[var(--md-primary)]" />
          {event.location}, {event.country_name}
        </p>

        <p className="font-mono text-xs text-[var(--md-on-surface-variant)] flex items-center gap-2 mt-1 inline-flex" style={{ borderRadius: "var(--shape-xs)" }}>
          <CalendarDays size={14} className="text-[var(--md-primary)]" />
          EVENT DATE: {formatDate(event.date_start)}
        </p>
      </HeroSurface>

      {winner && (
        <div className="max-w-md p-4 bg-[var(--md-surface-container-high)] border border-amber-500/40 shadow-lg shadow-amber-900/20" style={{ borderRadius: "var(--shape-md)" }}>
          <p className="text-xs font-mono font-bold text-amber-400 uppercase mb-2 flex items-center gap-1.5">
            🏆 RACE WINNER (P1)
          </p>
          <DriverCard driver={winner} position={1} featured />
        </div>
      )}
    </div>
  );
};

export default EventWeekendHeader;
