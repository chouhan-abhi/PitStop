import React from "react";

const StandingsTable = ({ title, columns, rows }) => (
  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--panel-color)]/90 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--border-color)] bg-gradient-to-r from-red-600/25 via-transparent to-transparent">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-color)]">
          {title}
        </h3>
        <p className="text-[11px] opacity-60">Season standings</p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              backgroundColor: "var(--header-bg)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2 px-3 text-left text-xs font-semibold ${col.align || ""}`}
                style={{ color: "var(--text-color)" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="transition-colors duration-150 hover:opacity-80"
              style={{
                backgroundColor:
                  idx % 2 === 0 ? "transparent" : "var(--bg-color)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-2 px-3 ${col.align || ""}`}
                  style={{ color: "var(--text-color)" }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StandingsTable;
