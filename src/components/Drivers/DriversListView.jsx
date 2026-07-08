import React from "react";

import DataTable from "../ui/DataTable";
import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "../ui/CountryFlag";
import LoadingState from "../ui/LoadingState";
import { getTeamColorBorder } from "../../common/utils/colors";

const DriversListView = ({ drivers, loading, onSelect }) => {
  if (loading) return <LoadingState message="Loading driver list..." />;

  const columns = [
    {
      key: "pos",
      label: "#",
      render: (row) => row.season?.position || "—",
    },
    {
      key: "driver",
      label: "Driver",
      render: (row) => (
        <button
          type="button"
          onClick={() => onSelect(row)}
          className="md3-state-layer flex items-center gap-3 text-left rounded-[var(--shape-md)] -mx-2 px-2 py-1"
        >
          <DriverAvatar driver={row} size="md" variant="portrait" />
          <span className="md3-title-md">{row.full_name}</span>
          <CountryFlag countryCode={row.country_code} size="lg" />
        </button>
      ),
    },
    {
      key: "team",
      label: "Team",
      render: (row) => (
        <span style={{ color: getTeamColorBorder(row.team_colour) }}>{row.team_name}</span>
      ),
    },
    {
      key: "pts",
      label: "Pts",
      align: "text-right",
      render: (row) => <span className="font-mono tabular-nums">{row.season?.points ?? 0}</span>,
    },
    {
      key: "wins",
      label: "Wins",
      align: "text-right",
      render: (row) => row.season?.wins ?? 0,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={drivers}
      getRowKey={(row) => row.driverId || row.driver_number}
      emptyMessage="No drivers available"
      className="md3-content-auto"
    />
  );
};

export default DriversListView;
