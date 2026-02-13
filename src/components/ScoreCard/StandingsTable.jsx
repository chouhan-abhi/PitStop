import React from "react";

const StandingsTable = ({ title, columns, rows }) => (
  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--panel-color)]/90 shadow-[var(--shadow-sm)]">
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--border-color)] bg-gradient-to-r from-red-600/22 via-transparent to-transparent">
      <div>
        <h3 className="display-title text-sm tracking-[0.12em] font-semibold text-[var(--text-color)]">
          {title}
        </h3>
        <p className="text-[11px] text-[var(--text-secondary)]">Season standings</p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-black/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-3 text-left text-[11px] uppercase tracking-[0.12em] font-semibold ${col.align || ""}`}
                style={{ color: "var(--text-secondary)" }}
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
              className="transition-colors duration-150 hover:bg-white/5"
              style={{
                backgroundColor: idx % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--surface-2) 40%, transparent)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-2.5 px-3 ${col.align || ""}`}
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
