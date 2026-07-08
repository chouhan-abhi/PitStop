import React from "react";

import { getTeamColorWithOpacity } from "../../common/utils/colors";

const DataTable = ({
  columns = [],
  rows = [],
  getRowKey,
  emptyMessage = "No data available",
  className = "",
}) => {
  if (!rows.length) {
    return (
      <p className="md3-body-md text-[var(--md-on-surface-variant)] py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-[var(--shape-lg)] bg-[var(--md-surface-container)] md3-content-auto ${className}`}
    >
      <table className="min-w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-left md3-label-md text-[var(--md-on-surface-variant)] ${col.align || ""}`}
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
            const bg = teamColor
              ? getTeamColorWithOpacity(teamColor, "10")
              : idx % 2 === 0
                ? "transparent"
                : "color-mix(in srgb, var(--md-on-surface) 3%, transparent)";

            return (
              <tr
                key={key}
                className="md3-state-layer transition-colors hover:bg-[color-mix(in_srgb,var(--md-on-surface)_6%,transparent)]"
                style={{ backgroundColor: bg, minHeight: "56px" }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-4 px-4 md3-body-md text-[var(--md-on-surface)] ${col.align || ""}`}
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
