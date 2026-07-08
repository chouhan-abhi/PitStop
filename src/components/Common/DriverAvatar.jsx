import React, { useEffect, useMemo, useState } from "react";

const getInitials = (driver) => {
  const first = driver?.first_name?.[0] || "";
  const last = driver?.last_name?.[0] || "";
  const fromNames = `${first}${last}`.trim();
  if (fromNames) return fromNames.toUpperCase();
  const fallback = driver?.name_acronym || driver?.broadcast_name || driver?.full_name || "?";
  return fallback.slice(0, 2).toUpperCase();
};

const normalizeColor = (teamColour) => {
  if (!teamColour) return null;
  return teamColour.startsWith("#") ? teamColour : `#${teamColour}`;
};

const SIZE_MAP = {
  sm: { box: "w-10 h-10", text: "text-xs", portrait: "w-16 aspect-[3/4]" },
  md: { box: "w-14 h-14", text: "text-sm", portrait: "w-24 aspect-[3/4]" },
  lg: { box: "w-20 h-20", text: "text-base", portrait: "w-32 aspect-[3/4]" },
  xl: { box: "w-28 h-28", text: "text-xl", portrait: "w-full aspect-[3/4]" },
};

const DriverAvatar = ({
  driver,
  size = "md",
  variant = "circle",
  sizeClass,
  roundedClass,
  className = "",
  textClass,
  priority = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const src = driver?.headshot_url || "";
  const preset = SIZE_MAP[size] || SIZE_MAP.md;

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = useMemo(() => getInitials(driver), [driver]);
  const teamColor = normalizeColor(driver?.team_colour) || "var(--md-primary)";
  const showImage = Boolean(src) && !imageFailed;

  const isPortrait = variant === "portrait";
  const dimensionClass = sizeClass || (isPortrait ? preset.portrait : preset.box);
  const radiusClass =
    roundedClass || (isPortrait ? "rounded-[var(--shape-lg)]" : "rounded-[var(--shape-full)]");
  const labelClass = textClass || preset.text;

  const tonalBg = teamColor.startsWith("#")
    ? `color-mix(in srgb, ${teamColor} 28%, var(--md-surface-container-high))`
    : "var(--md-primary-container)";

  return (
    <div
      className={`${dimensionClass} ${radiusClass} ${className} relative flex items-center justify-center overflow-hidden shrink-0`}
      style={{
        backgroundColor: showImage ? "var(--md-surface-container-highest)" : tonalBg,
        color: teamColor.startsWith("#") ? teamColor : "var(--md-on-primary-container)",
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={driver?.full_name || "Driver"}
          className="absolute inset-0 w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={`${labelClass} font-bold tracking-wide md3-headline-md`}>{initials}</span>
      )}
      {!isPortrait && (
        <span
          className="absolute inset-0 rounded-[inherit] ring-2 ring-inset"
          style={{ boxShadow: `inset 0 0 0 2px ${teamColor}` }}
          aria-hidden
        />
      )}
    </div>
  );
};

export default DriverAvatar;
