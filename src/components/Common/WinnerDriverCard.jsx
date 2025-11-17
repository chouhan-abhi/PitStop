function WinnerDriverCard({ driver }) {
  return (
    <div
      className="
      relative flex items-center gap-6 p-6 rounded-2xl
    bg-[var(--panel-color)]
    boder border-[var(--border-color)]
    shadow-lg hover:shadow-xl transition-all

    /* Width rules */
    w-full              /* full width on small screens */
    sm:w-[50vw]         /* custom width on medium+ */
    "
    >
      <div
            className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
            style={{
              backgroundColor: driver.team_colour ? `#${driver.team_colour}` : "var(--primary-color)",
            }}
          />

      {/* Headshot Circle */}
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center shadow-inner"
        style={{
          background: driver.team_colour
            ? `conic-gradient(#${driver.team_colour} 0%, #${driver.team_colour}80 40%, transparent 40%)`
            : "conic-gradient(var(--primary-color) 0%, transparent 40%)",
        }}
      >
        <img
          src={driver.headshot_url}
          alt={driver.full_name}
          className="w-28 h-28 rounded-full object-cover shadow-lg"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1">

        {/* Driver Code */}
        <span
          className="text-sm font-bold tracking-widest uppercase opacity-80"
          style={{
            color: driver.team_colour
              ? `#${driver.team_colour}`
              : "var(--primary-color)",
          }}
        >
          {driver.name_acronym}
        </span>

        {/* Full Name */}
        <span className="text-3xl font-extrabold leading-tight">
          {driver.full_name}
        </span>

        {/* Broadcast Name */}
        <span className="text-base opacity-70 -mt-1">
          {driver.broadcast_name}
        </span>

        {/* Driver Number Badge */}
        <span
          className="
          text-sm font-bold px-3 py-1 rounded-full w-fit shadow
        "
          style={{
            backgroundColor: driver.team_colour
              ? `#${driver.team_colour}22`
              : "var(--primary-color)33",
            color: driver.team_colour
              ? `#${driver.team_colour}`
              : "var(--primary-color)",
          }}
        >
          🥇 #{driver.driver_number}
        </span>

        {/* Flag + Team */}
        <div className="flex items-center gap-2 mt-1 opacity-90">
          {driver.country_code && (
            <img
              src={`https://flagsapi.com/${driver.country_code}/flat/32.png`}
              className="w-6 h-4 rounded"
            />
          )}
          <span className="text-base">{driver.team_name}</span>
        </div>
      </div>
    </div>
  );
}

export default WinnerDriverCard;