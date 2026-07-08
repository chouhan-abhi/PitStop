import React, { useEffect, useMemo, useState } from "react";

const getInitials = (driver) => {
  const first = driver?.first_name?.[0] || "";
  const last = driver?.last_name?.[0] || "";
  const fromNames = `${first}${last}`.trim();

  if (fromNames) {
    return fromNames.toUpperCase();
  }

  const fallback = driver?.name_acronym || driver?.broadcast_name || driver?.full_name || "?";
  return fallback.slice(0, 2).toUpperCase();
};

const normalizeColor = (teamColour) => {
  if (!teamColour) return null;
  return teamColour.startsWith("#") ? teamColour : `#${teamColour}`;
};

const DriverAvatar = ({
  driver,
  sizeClass = "w-12 h-12",
  roundedClass = "rounded-full",
  className = "",
  textClass = "text-sm",
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const src = driver?.headshot_url || "";

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = useMemo(() => getInitials(driver), [driver]);
  const teamColor = normalizeColor(driver?.team_colour) || "var(--primary-color)";
  const showImage = Boolean(src) && !imageFailed;
  const background = teamColor.startsWith("#")
    ? `linear-gradient(135deg, ${teamColor}33, ${teamColor}15)`
    : "linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 30%, transparent), color-mix(in srgb, var(--primary-color) 8%, transparent))";

  return (
    <div
      className={`${sizeClass} ${roundedClass} ${className} flex items-center justify-center overflow-hidden font-bold uppercase ring-2 ring-offset-1 ring-offset-[var(--panel-color)]`}
      style={{
        background,
        color: teamColor,
        boxShadow: `0 0 0 2px ${teamColor}`,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={driver?.full_name || "Driver"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={`${textClass} tracking-wide`}>{initials}</span>
      )}
    </div>
  );
};

export default DriverAvatar;
