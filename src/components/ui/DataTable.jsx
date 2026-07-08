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
      <p className="md3-body-md text-[var(--md-on-surface-variant)] py-6 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-[var(--shape-lg)] border border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] ${className}`}
    >
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-[var(--md-outline-variant)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2 px-3 text-left md3-label-md text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container-high)] first:rounded-tl-[var(--shape-lg)] last:rounded-tr-[var(--shape-lg)] ${col.align || ""}`}
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
              ? getTeamColorWithOpacity(teamColor, "08")
              : "transparent";

            return (
              <tr
                key={key}
                className={`md3-state-layer transition-colors hover:bg-[color-mix(in_srgb,var(--md-on-surface)_5%,transparent)] ${
                  idx < rows.length - 1 ? "border-b border-[var(--md-outline-variant)]/40" : ""
                }`}
                style={{ backgroundColor: bg }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-3 md3-body-md text-[var(--md-on-surface)] ${col.align || ""}`}
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
