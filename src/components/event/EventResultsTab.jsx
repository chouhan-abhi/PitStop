import React, { useState } from "react";

import { getF1Points, SESSION_TITLE_MAP } from "../../common/utils/constants";
import DataTable from "../ui/DataTable";
import DriverRow from "../ui/DriverRow";
import Panel from "../ui/Panel";

const getSessionTitle = (index, totalSessions) => {
  const raceIndex = totalSessions - 1 - index;
  return SESSION_TITLE_MAP[raceIndex] || `Session ${raceIndex + 1}`;
};

const isRaceSession = (title) => title?.toLowerCase() === "race day";

const SessionResultsTable = ({ session, sessionIndex, totalSessions, driversByNumber }) => {
  const title = getSessionTitle(sessionIndex, totalSessions);
  const isRace = isRaceSession(title);
  const drivers = Object.values(session.drivers || {}).sort(
    (a, b) => (a.finalPosition || a.position || 999) - (b.finalPosition || b.position || 999)
  );

  const columns = [
    {
      key: "pos",
      label: "Pos",
      render: (row) => row.finalPosition ?? row.position,
    },
    {
      key: "driver",
      label: "Driver",
      render: (row) => {
        const full = driversByNumber.get(Number(row.driver_number));
        return (
          <DriverRow
            driver={full || row}
            position={row.finalPosition ?? row.position}
            startPosition={row.startingPosition ?? row.starting_grid_position}
          />
        );
      },
    },
    ...(isRace
      ? [
          {
            key: "pts",
            label: "Pts",
            align: "text-right",
            render: (row) => getF1Points(row.finalPosition ?? row.position),
          },
        ]
      : []),
  ];

  return (
    <Panel className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {title} — {session.session_name}
        </h3>
      </div>
      <DataTable
        columns={columns}
        rows={drivers}
        getRowKey={(row) => row.driver_number}
        emptyMessage="No results for this session"
        className="border-0 rounded-none"
      />
    </Panel>
  );
};

const EventResultsTab = ({ sortedSessions, driversByNumber }) => {
  const [openKey, setOpenKey] = useState(sortedSessions[0]?.session_key || null);

  if (!sortedSessions.length) {
    return <p className="text-sm text-[var(--text-muted)]">No session data available.</p>;
  }

  return (
    <div className="space-y-3">
      {sortedSessions.map((session, index) => {
        const isOpen = openKey === session.session_key || index === 0;
        const isFirst = index === 0;

        if (isFirst) {
          return (
            <SessionResultsTable
              key={session.session_key}
              session={session}
              sessionIndex={index}
              totalSessions={sortedSessions.length}
              driversByNumber={driversByNumber}
            />
          );
        }

        return (
          <Panel key={session.session_key} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : session.session_key)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-2)]/40 transition-colors"
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {getSessionTitle(index, sortedSessions.length)} — {session.session_name}
              </span>
              <svg
                width="18"
                height="18"
                className={`transition-transform text-[var(--text-muted)] ${isOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {isOpen && (
              <SessionResultsTable
                session={session}
                sessionIndex={index}
                totalSessions={sortedSessions.length}
                driversByNumber={driversByNumber}
              />
            )}
          </Panel>
        );
      })}
    </div>
  );
};

export default EventResultsTab;
