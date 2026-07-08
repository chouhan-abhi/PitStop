import React from "react";

import { getTeamColorWithOpacity } from "../../common/utils/colors";

const DataTable = ({ columns = [], rows = [], getRowKey, emptyMessage = "No data available", className = "" }) => {
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-6 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--panel-color)]/80 ${className}`}>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] ${col.align || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const key = getRowKey ? getRowKey(row, idx) : row.id || idx;
            const teamColor = row.team_colour || row.teamColor;
            const bg = teamColor ? getTeamColorWithOpacity(teamColor, "12") : "transparent";

            return (
              <tr
                key={key}
                className="border-b border-[var(--border-color)]/60 transition-colors hover:bg-[var(--surface-2)]/40"
                style={{ backgroundColor: bg }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-4 text-sm text-[var(--text-primary)] ${col.align || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
