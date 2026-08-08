import DriverAvatar from "./DriverAvatar";

function WinnerDriverCard({ driver }) {
  const teamColor = driver?.team_colour
    ? (driver.team_colour.startsWith("#") ? driver.team_colour : `#${driver.team_colour}`)
    : "var(--primary-color)";
  const badgeStyle = teamColor.startsWith("#")
    ? { backgroundColor: `${teamColor}22`, color: teamColor }
    : {
        backgroundColor: "color-mix(in srgb, var(--primary-color) 20%, transparent)",
        color: "var(--primary-color)",
      };

  return (
    <div className="relative flex items-center gap-3 p-3 border border-[var(--border-color)] bg-[var(--panel-color)] w-full sm:w-[52%]" style={{ borderRadius: "var(--shape-md)" }}>
      <div
        className="absolute -right-2 -top-5 text-[90px] sm:text-[130px] display-title font-black tracking-tight text-white/10 select-none"
        aria-hidden="true"
      >
        {driver.driver_number}
      </div>

      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: teamColor, borderRadius: "var(--shape-md) 0 0 var(--shape-md)" }}
      />

      <DriverAvatar
        driver={driver}
        sizeClass="w-16 h-16 sm:w-24 sm:h-24"
        roundedClass="rounded-full"
        className="shadow-inner flex-shrink-0"
        textClass="text-base sm:text-xl"
      />

      <div className="flex flex-col gap-1 relative z-10">
        <span
          className="text-xs font-bold tracking-widest uppercase opacity-90"
          style={{
            color: teamColor,
          }}
        >
          {driver.name_acronym}
        </span>

        <span className="text-base sm:text-2xl font-extrabold leading-tight">{driver.full_name}</span>
        <span className="text-sm opacity-70 -mt-1">{driver.broadcast_name}</span>

        <span
          className="text-xs font-bold px-2 py-0.5 w-fit"
          style={{ ...badgeStyle, borderRadius: "var(--shape-xs)" }}
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
