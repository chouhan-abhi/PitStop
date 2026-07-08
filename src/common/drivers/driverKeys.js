/**
 * Stable join keys for merging driver records across OpenF1 and Ergast.
 */

export const normalizeDriverName = (name = "") =>
  String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

export const buildNameKey = (driver) => {
  const full = normalizeDriverName(driver?.full_name || "");
  if (full) return full;

  const given = normalizeDriverName(driver?.first_name || driver?.givenName || "");
  const family = normalizeDriverName(driver?.last_name || driver?.familyName || "");
  return `${given} ${family}`.trim();
};

export const toDriverNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

export const toDriverId = (value) => {
  if (!value) return null;
  return String(value).trim() || null;
};
