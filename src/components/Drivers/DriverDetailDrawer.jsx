import React from "react";
import { X } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "../ui/CountryFlag";
import Button from "../ui/Button";
import Surface from "../ui/Surface";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";

const formatAvg = (value) => (value == null ? "-" : value.toFixed(2));

const DriverDetailDrawer = ({ driver, onClose }) => {
  const animatedPoints = useAnimatedNumber(driver?.season?.points ?? 0);

  if (!driver) return null;

  const season = driver.season || {};

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <Surface
        tier="container-highest"
        className="relative w-full max-w-md h-full overflow-y-auto rounded-none p-0"
      >
        <DriverAvatar
          driver={driver}
          variant="portrait"
          size="xl"
          className="w-full rounded-none rounded-t-[var(--shape-xl)] aspect-[16/10]"
          priority
        />
        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="md3-headline-md">{driver.full_name}</p>
                <CountryFlag countryCode={driver.country_code} size="lg" />
              </div>
              <p className="md3-body-md text-[var(--md-on-surface-variant)]">{driver.team_name}</p>
              <p className="md3-title-lg font-mono tabular-nums mt-2">{animatedPoints} pts</p>
            </div>
            <Button variant="text" size="sm" onClick={onClose} aria-label="Close">
              <X size={18} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Position" value={season.position || "—"} />
            <Stat label="Wins" value={season.wins || 0} />
            <Stat label="Podiums" value={season.podiums || 0} />
            <Stat label="Races" value={season.races || 0} />
            <Stat label="Best" value={season.bestFinish ? `P${season.bestFinish}` : "—"} />
            <Stat label="Avg" value={formatAvg(season.averageFinish)} />
          </div>

          {(season.lastFive || []).length > 0 && (
            <div>
              <p className="md3-label-md text-[var(--md-on-surface-variant)] mb-3">Recent Results</p>
              <div className="space-y-2">
                {season.lastFive.slice().reverse().map((r) => (
                  <div
                    key={`${driver.driver_number}-${r.round}`}
                    className="flex justify-between md3-body-md rounded-[var(--shape-md)] bg-[var(--md-surface-container-high)] px-3 py-2"
                  >
                    <span className="truncate">{r.raceName}</span>
                    <span className="font-mono tabular-nums shrink-0 ml-2">
                      P{r.position} · {r.points}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Surface>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-[var(--shape-md)] bg-[var(--md-surface-container-high)] p-3">
    <p className="md3-label-md text-[var(--md-on-surface-variant)]">{label}</p>
    <p className="md3-title-lg font-mono tabular-nums mt-1">{value}</p>
  </div>
);

export default DriverDetailDrawer;
