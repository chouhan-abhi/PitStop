import React from "react";

import { getTeamColorWithOpacity, getTeamColorBorder } from "../../common/utils/colors";

const DataTable = ({
  columns = [],
  rows = [],
  getRowKey,
  emptyMessage = "No data available",
  className = "",
}) => {
  if (!rows.length) {
    return (
      <div
        style={{
          padding: "2.5rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--md-on-surface-variant)",
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: "var(--shape-md)",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto ${className}`}
      style={{
        borderRadius: "var(--shape-md)",
        border: "1px solid var(--md-outline-variant)",
        background: "var(--md-surface-container)",
      }}
    >
      <table className="data-grid">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align || ""}
                style={{ textAlign: col.align === "text-right" ? "right" : "left" }}
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

            return (
              <tr key={key}>
                {/* Team color accent stripe on first cell */}
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    style={{
                      textAlign: col.align === "text-right" ? "right" : "left",
                      ...(colIdx === 0 && teamColor
                        ? {
                            borderLeft: `3px solid ${getTeamColorBorder(teamColor)}`,
                            paddingLeft: "0.875rem",
                          }
                        : {}),
                    }}
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
