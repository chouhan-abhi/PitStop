/**
 * Read chart theming values from CSS variables.
 */
export const getChartTheme = () => {
  if (typeof document === "undefined") {
    return {
      grid: "rgba(255,255,255,0.08)",
      tooltipBg: "rgba(10,14,25,0.95)",
      tooltipText: "#f4f7ff",
      text: "#a7b0c5",
      accent: "#ff2d2d",
    };
  }

  const style = getComputedStyle(document.documentElement);
  const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;

  return {
    grid: read("--chart-grid", "rgba(255,255,255,0.08)"),
    tooltipBg: read("--chart-tooltip-bg", "rgba(10,14,25,0.95)"),
    tooltipText: read("--chart-tooltip-text", "#f4f7ff"),
    text: read("--text-secondary", "#a7b0c5"),
    accent: read("--accent-red", "#ff2d2d"),
  };
};
