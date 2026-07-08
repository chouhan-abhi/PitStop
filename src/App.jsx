import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  NavLink,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Sun,
  Moon,
  Sparkles,
  Laptop,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";

import "./App.css";
import { AppConfig } from "./common/AppConfig";
import { getBucket, setActiveSubApp } from "./common/storage";
import { queryPrefixesByRoute } from "./common/api/queryKeys";

const Dashboard = lazy(() =>
  import("./components/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const EventDetails = lazy(() =>
  import("./components/EventDetails").then((module) => ({ default: module.EventDetails }))
);
const ArchivesPage = lazy(() => import("./components/ArchivesPage"));
const DriversPage = lazy(() => import("./components/Drivers/DriversPage"));
const ScoreCardPage = lazy(() => import("./components/ScoreCard/ScoreCardPage"));

const prefsBucket = getBucket("app", "prefs", "prefs");
const THEME_ORDER = ["system", "dark", "light", "saint"];
const CURRENT_YEAR = String(new Date().getFullYear());
const MIN_YEAR = 2020;
const YEAR_OPTIONS = Array.from(
  { length: Number(CURRENT_YEAR) - MIN_YEAR + 1 },
  (_, idx) => String(Number(CURRENT_YEAR) - idx)
);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const APP_ROUTES = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/archives", label: "Archives", icon: "archives" },
  { to: "/drivers", label: "Drivers", icon: "drivers" },
  { to: "/score-card", label: "Standings", icon: "standings" },
];

const ROUTE_META = {
  "/": { title: "Home", subtitle: "Next session, championship, and latest race" },
  "/archives": { title: "Archives", subtitle: "Season timeline and past weekends" },
  "/drivers": { title: "Drivers", subtitle: "Roster, form, and season stats" },
  "/score-card": { title: "Standings", subtitle: "Championship tables and points flow" },
  "/event": { title: "Weekend", subtitle: "Session results and telemetry" },
};

const routeRefreshPrefixes = (pathname = "/") => {
  if (pathname.startsWith("/event")) return queryPrefixesByRoute["/event"];
  if (pathname.startsWith("/score-card")) return queryPrefixesByRoute["/score-card"];
  if (pathname.startsWith("/drivers")) return queryPrefixesByRoute["/drivers"];
  if (pathname.startsWith("/archives")) return queryPrefixesByRoute["/archives"];
  return queryPrefixesByRoute["/"];
};

const routeMetaForPath = (pathname = "/") => {
  if (pathname.startsWith("/event")) return ROUTE_META["/event"];
  if (pathname.startsWith("/score-card")) return ROUTE_META["/score-card"];
  if (pathname.startsWith("/drivers")) return ROUTE_META["/drivers"];
  if (pathname.startsWith("/archives")) return ROUTE_META["/archives"];
  return ROUTE_META["/"];
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const RouteStorageSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/drivers")) {
      setActiveSubApp("drivers");
    } else if (pathname.startsWith("/archives")) {
      setActiveSubApp("archives");
    } else if (pathname.startsWith("/score-card")) {
      setActiveSubApp("score-card");
    } else if (pathname.startsWith("/event")) {
      setActiveSubApp("event-details");
    } else if (pathname.startsWith("/")) {
      setActiveSubApp("dashboard");
    }
  }, [pathname]);

  return null;
};

const PageFallback = () => (
  <div className="app-shell py-10">
    <div className="md3-surface-container h-[52vh] flex items-center justify-center rounded-[var(--shape-xl)]">
      <Loader2 className="animate-spin w-8 h-8 opacity-60" />
    </div>
  </div>
);

const ThemeButton = ({ themeMode, cycleTheme }) => (
  <button
    type="button"
    onClick={cycleTheme}
    className="md3-state-layer inline-flex h-10 w-10 items-center justify-center rounded-[var(--shape-full)] text-[var(--md-on-surface-variant)]"
    aria-label="Switch Theme"
  >
    {themeMode === "system" && <Laptop className="w-4 h-4" />}
    {themeMode === "dark" && <Moon className="w-4 h-4" />}
    {themeMode === "light" && <Sun className="w-4 h-4" />}
    {themeMode === "saint" && <Sparkles className="w-4 h-4" />}
  </button>
);

const AppLayout = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [themeMode, setThemeMode] = useState(() => prefsBucket.getRecord("theme") || "system");
  const [seasonYear, setSeasonYear] = useState(() => prefsBucket.getRecord("seasonYear") || CURRENT_YEAR);
  const routeMeta = routeMetaForPath(pathname);

  useEffect(() => {
    const themeToApply = themeMode === "system" ? getSystemTheme() : themeMode;
    document.documentElement.setAttribute("data-theme", themeToApply);
    prefsBucket.setRecord("theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    prefsBucket.setRecord("seasonYear", seasonYear);
  }, [seasonYear]);

  useEffect(() => {
    if (themeMode !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      document.documentElement.setAttribute("data-theme", event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode]);

  useEffect(() => {
    setIsMobileControlsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileControlsOpen) return undefined;
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileControlsOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isMobileControlsOpen]);

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(themeMode);
    setThemeMode(THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const prefixes = routeRefreshPrefixes(pathname);

      await Promise.all(
        prefixes.map((prefix) => queryClient.invalidateQueries({ queryKey: [prefix] }))
      );
      await Promise.all(
        prefixes.map((prefix) =>
          queryClient.refetchQueries({
            queryKey: [prefix],
            type: "active",
          })
        )
      );
      setLastRefreshAt(Date.now());
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const closeMobileControls = () => setIsMobileControlsOpen(false);

  return (
    <>
      <ScrollToTop />
      <RouteStorageSync />

      <div className="app-chrome flex flex-col relative z-10">
        <header className="race-header sticky top-0 z-50">
          <div className="app-shell py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center sm:w-auto sm:flex sm:items-center sm:gap-6">
              <div className="sm:hidden" />

              <div className="text-center sm:text-left">
                <p className="md3-label-md text-[var(--md-on-surface-variant)]">
                  {routeMeta?.title || "Home"}
                </p>
                <h1 className="md3-headline-md mt-0.5">
                  <span className="text-[var(--md-on-surface)]">Pit</span>
                  <span className="text-[var(--md-primary)]">Stop</span>
                </h1>
                <p className="hidden sm:block md3-body-md text-[var(--md-on-surface-variant)] mt-0.5">
                  {routeMeta?.subtitle}
                </p>
              </div>

              <div className="flex justify-end sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileControlsOpen(true)}
                  className="md3-state-layer inline-flex h-10 w-10 items-center justify-center rounded-[var(--shape-full)] text-[var(--md-on-surface-variant)]"
                  aria-label="Open controls"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {APP_ROUTES.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `race-tab ${isActive ? "race-tab-active" : ""}`
                  }
                  end={item.to === "/"}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <label className="md3-label-md text-[var(--md-on-surface-variant)] sr-only sm:not-sr-only">
                Season
              </label>
              <select
                value={seasonYear}
                onChange={(event) => setSeasonYear(event.target.value)}
                className="h-10 rounded-[var(--shape-full)] border border-[var(--md-outline)] bg-[var(--md-surface-container-high)] px-4 md3-label-lg text-[var(--md-on-surface)]"
                aria-label="Select season year"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="md3-state-layer inline-flex h-10 w-10 items-center justify-center rounded-[var(--shape-full)] text-[var(--md-on-surface-variant)]"
                aria-label="Refresh Data"
                title="Refresh data cache"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>

              <div className="hidden lg:block md3-label-md text-[var(--md-on-surface-variant)] min-w-[120px] text-right">
                {isRefreshing
                  ? "Syncing..."
                  : lastRefreshAt
                    ? `Synced ${new Date(lastRefreshAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Not synced"}
              </div>

              <ThemeButton themeMode={themeMode} cycleTheme={cycleTheme} />
            </div>
          </div>
        </header>

        {isMobileControlsOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={closeMobileControls}
              aria-label="Close controls"
            />
            <div className="relative w-full rounded-t-[var(--shape-xl)] p-4 bg-[var(--md-surface-container-highest)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="md3-title-md">Quick Controls</h2>
                <button
                  type="button"
                  onClick={closeMobileControls}
                  className="md3-state-layer inline-flex h-10 w-10 items-center justify-center rounded-[var(--shape-full)] text-[var(--md-on-surface-variant)]"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="md3-label-md text-[var(--md-on-surface-variant)]">Season</span>
                  <select
                    value={seasonYear}
                    onChange={(event) => setSeasonYear(event.target.value)}
                    className="h-10 rounded-[var(--shape-full)] border border-[var(--md-outline)] bg-[var(--md-surface-container-high)] px-4 md3-label-lg text-[var(--md-on-surface)]"
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="md3-label-md text-[var(--md-on-surface-variant)]">Refresh</span>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="md3-state-layer inline-flex h-10 w-10 items-center justify-center rounded-[var(--shape-full)] text-[var(--md-on-surface-variant)]"
                    aria-label="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="md3-label-md text-[var(--md-on-surface-variant)]">Status</span>
                  <span className="md3-label-md text-[var(--md-on-surface-variant)]">
                    {isRefreshing
                      ? "Syncing..."
                      : lastRefreshAt
                        ? `Synced ${new Date(lastRefreshAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Not synced"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="md3-label-md text-[var(--md-on-surface-variant)]">Theme</span>
                  <ThemeButton themeMode={themeMode} cycleTheme={cycleTheme} />
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 w-full relative z-10 pb-16 md:pb-0">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard year={seasonYear} />} />
              <Route path="/archives" element={<ArchivesPage year={seasonYear} />} />
              <Route path="/drivers" element={<DriversPage year={seasonYear} />} />
              <Route path="/score-card" element={<ScoreCardPage year={seasonYear} />} />
              <Route path="/event/:meetingKey" element={<EventDetails year={seasonYear} />} />
            </Routes>
          </Suspense>
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--md-surface-container)]"
          aria-label="Mobile navigation"
        >
          <div className="app-shell py-2 flex items-center justify-around">
            {APP_ROUTES.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `md3-state-layer px-3 py-2 rounded-[var(--shape-md)] md3-label-md transition-colors ${
                    isActive
                      ? "text-[var(--md-primary)] bg-[var(--md-primary-container)]"
                      : "text-[var(--md-on-surface-variant)]"
                  }`
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <footer className="relative z-10 hidden md:block bg-[var(--md-surface-container)]">
          <div className="app-shell py-4 md3-label-md text-[var(--md-on-surface-variant)]">
            © 2026 {AppConfig.name} | data partner Jolpica (Ergast mirror)
          </div>
        </footer>
      </div>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
