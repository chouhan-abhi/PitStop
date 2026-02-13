function WinnerDriverCard({ driver }) {
  return (
    <div className="relative flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--panel-color)] w-full sm:w-[52%]">
      <div
        className="absolute -right-2 -top-5 text-[90px] sm:text-[130px] display-title font-black tracking-tight text-white/10 select-none"
        aria-hidden="true"
      >
        {driver.driver_number}
      </div>

      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{
          backgroundColor: driver.team_colour ? `#${driver.team_colour}` : "var(--primary-color)",
        }}
      />

      <div
        className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0"
        style={{
          background: driver.team_colour
            ? `conic-gradient(#${driver.team_colour} 0%, #${driver.team_colour}20 100%, transparent 40%)`
            : "conic-gradient(var(--primary-color) 0%, transparent 60%)",
        }}
      >
        <img
          src={driver.headshot_url}
          alt={driver.full_name}
          className="w-full h-full rounded-full object-cover object-center"
          style={{ aspectRatio: "1 / 1" }}
          loading="lazy"
        />
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        <span
          className="text-xs font-bold tracking-widest uppercase opacity-90"
          style={{
            color: driver.team_colour ? `#${driver.team_colour}` : "var(--primary-color)",
          }}
        >
          {driver.name_acronym}
        </span>

        <span className="text-base sm:text-2xl font-extrabold leading-tight">{driver.full_name}</span>
        <span className="text-sm opacity-70 -mt-1">{driver.broadcast_name}</span>

        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full w-fit"
          style={{
            backgroundColor: driver.team_colour ? `#${driver.team_colour}22` : "var(--primary-color)33",
            color: driver.team_colour ? `#${driver.team_colour}` : "var(--primary-color)",
          }}
        >
          P1 #{driver.driver_number}
        </span>

        <div className="flex items-center gap-2 mt-1 opacity-90">
          {driver.country_code && (
            <img
              src={`https://flagsapi.com/${driver.country_code}/flat/32.png`}
              className="w-5 h-4 rounded"
              alt=""
              loading="lazy"
            />
          )}
          <span className="text-sm">{driver.team_name}</span>
        </div>
      </div>
    </div>
  );
}

export default WinnerDriverCard;
