import React, { useEffect, useMemo, useState } from "react";

// Mapping to official F1 website high-res headshot URLs
const DRIVER_IMAGES = {
  VER: "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
  HAM: "https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
  LEC: "https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
  NOR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
  ALO: "https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
  PIA: "https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
  PER: "https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
  SAI: "https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
  RUS: "https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
  TSU: "https://www.formula1.com/content/dam/fom-website/drivers/Y/YAUTSU01_Yuki_Tsunoda/yautsu01.png",
  OCO: "https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
  GAS: "https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
  ALB: "https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
  HUL: "https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
  STR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
  MAG: "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png",
  RIC: "https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png",
  BOT: "https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png",
  ZHO: "https://www.formula1.com/content/dam/fom-website/drivers/Z/ZHOGUA01_Zhou_Guanyu/zhogua01.png",
  SAR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png",
  COL: "https://www.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png",
  LAW: "https://www.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png",
};

const getInitials = (driver) => {
  const first = driver?.first_name?.[0] || driver?.givenName?.[0] || "";
  const last = driver?.last_name?.[0] || driver?.familyName?.[0] || "";
  const fromNames = `${first}${last}`.trim();
  if (fromNames) return fromNames.toUpperCase();
  const fallback = driver?.name_acronym || driver?.code || driver?.broadcast_name || driver?.full_name || "?";
  return fallback.slice(0, 2).toUpperCase();
};

const normalizeColor = (teamColour) => {
  if (!teamColour) return null;
  return teamColour.startsWith("#") ? teamColour : `#${teamColour}`;
};

const SIZE_MAP = {
  sm: { box: "w-8 h-8", text: "text-[9px]", portrait: "w-12 aspect-[3/4]" },
  md: { box: "w-12 h-12", text: "text-xs", portrait: "w-20 aspect-[3/4]" },
  lg: { box: "w-16 h-16", text: "text-sm", portrait: "w-28 aspect-[3/4]" },
  xl: { box: "w-24 h-24", text: "text-lg", portrait: "w-full aspect-[3/4]" },
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

  const acronym = (
    driver?.name_acronym || 
    driver?.code || 
    driver?.familyName?.slice(0, 3) || 
    driver?.last_name?.slice(0, 3) || 
    ""
  ).toUpperCase();

  const src = DRIVER_IMAGES[acronym] || driver?.headshot_url || "";
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
        border: `1.5px solid ${showImage ? "rgba(255, 255, 255, 0.08)" : "transparent"}`,
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
        <span className={`${labelClass} font-bold tracking-wide font-mono`}>{initials}</span>
      )}
      {!isPortrait && (
        <span
          className="absolute inset-0 rounded-[inherit]"
          style={{ boxShadow: `inset 0 0 0 1px ${teamColor}30` }}
          aria-hidden
        />
      )}
    </div>
  );
};

export default DriverAvatar;
