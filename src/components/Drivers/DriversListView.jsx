import React from "react";

import DataTable from "../ui/DataTable";
import DriverAvatar from "../Common/DriverAvatar";
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
          className="flex items-center gap-3 text-left hover:opacity-80"
        >
          <DriverAvatar driver={row} sizeClass="w-8 h-8" textClass="text-[10px]" />
          <span className="font-semibold">{row.full_name}</span>
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
      render: (row) => <span className="font-mono">{row.season?.points ?? 0}</span>,
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
    />
  );
};

export default DriversListView;
