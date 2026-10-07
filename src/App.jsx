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
  Home,
  Archive,
  Users,
  Trophy,
  Activity,
  Wifi,
  Shield,
  Clock,
  ChevronRight,
  Radio,
  Newspaper,
  Sliders,
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
const FeedPage = lazy(() => import("./components/Feed/FeedPage"));
const ProfilePage = lazy(() => import("./components/Profile/ProfilePage"));

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
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/score-card", label: "Standings", icon: Trophy, end: false },
  { to: "/feed", label: "Feed", icon: Newspaper, end: false },
  { to: "/profile", label: "Profile", icon: Sliders, end: false },
];

const ROUTE_META = {
  "/": { title: "OVERVIEW", subtitle: "Race control dashboard" },
  "/archives": { title: "ARCHIVES", subtitle: "Season timeline" },
  "/drivers": { title: "DRIVERS", subtitle: "Driver personnel" },
  "/score-card": { title: "STANDINGS", subtitle: "Championship tables" },
  "/event": { title: "WEEKEND", subtitle: "Session telemetry" },
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
    if (pathname.startsWith("/drivers")) setActiveSubApp("drivers");
    else if (pathname.startsWith("/archives")) setActiveSubApp("archives");
    else if (pathname.startsWith("/score-card") || pathname.startsWith("/standings")) setActiveSubApp("score-card");
    else if (pathname.startsWith("/feed")) setActiveSubApp("feed");
    else if (pathname.startsWith("/profile")) setActiveSubApp("profile");
    else if (pathname.startsWith("/event")) setActiveSubApp("event-details");
    else if (pathname.startsWith("/")) setActiveSubApp("dashboard");
  }, [pathname]);
  return null;
};

const PageFallback = () => (
  <div className="app-shell py-10">
    <div
      className="flex items-center justify-center h-[50vh]"
      style={{ color: "var(--md-on-surface-variant)" }}
    >
      <Loader2 className="animate-spin w-6 h-6 mr-2 opacity-60" />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Loading telemetry data...
      </span>
    </div>
  </div>
);



/* ── Theme icon ──────────────────────────────────────────── */
const ThemeIcon = ({ themeMode }) => {
  if (themeMode === "system") return <Laptop className="w-3.5 h-3.5" />;
  if (themeMode === "dark") return <Moon className="w-3.5 h-3.5" />;
  if (themeMode === "light") return <Sun className="w-3.5 h-3.5" />;
  return <Sparkles className="w-3.5 h-3.5" />;
};

/* ── Sidebar ─────────────────────────────────────────────── */
const Sidebar = ({ seasonYear, setSeasonYear, themeMode, cycleTheme, isRefreshing, handleRefresh }) => {
  const { pathname } = useLocation();
  const routeMeta = routeMetaForPath(pathname);

  return (
    <aside className="app-sidebar">
      {/* ── Brand ── */}
      <div
        style={{
          padding: "1rem 1rem 0.75rem",
          borderBottom: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.625rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, var(--md-primary), color-mix(in srgb, var(--md-primary) 60%, #0099aa))",
              borderRadius: "var(--shape-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 16px rgba(0, 229, 200, 0.2)",
            }}
          >
            <Radio size={16} color="#000" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.1em",
                color: "var(--md-on-surface)",
                lineHeight: 1,
              }}
            >
              PIT<span style={{ color: "var(--md-primary)" }}>STOP</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "var(--md-on-surface-variant)",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              MISSION CONTROL
            </div>
          </div>
        </div>

      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--md-on-surface-variant)",
            padding: "0 0.375rem",
            marginBottom: "0.375rem",
          }}
        >
          NAVIGATION
        </div>
        {APP_ROUTES.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={15} strokeWidth={1.75} />
            <span style={{ flex: 1 }}>{item.label}</span>
            <ChevronRight
              size={11}
              style={{
                opacity: 0.3,
                flexShrink: 0,
              }}
            />
          </NavLink>
        ))}

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--md-on-surface-variant)",
            padding: "0 0.375rem",
            marginTop: "1rem",
            marginBottom: "0.375rem",
          }}
        >
          EXPLORE
        </div>
        <NavLink
          to="/drivers"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
        >
          <Users size={15} strokeWidth={1.75} />
          <span style={{ flex: 1 }}>Drivers</span>
          <ChevronRight size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
        </NavLink>
        <NavLink
          to="/archives"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
        >
          <Archive size={15} strokeWidth={1.75} />
          <span style={{ flex: 1 }}>Archives</span>
          <ChevronRight size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
        </NavLink>
      </nav>

      {/* ── Controls ── */}
      <div
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          padding: "0.75rem 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {/* Season Selector */}
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--md-on-surface-variant)",
              marginBottom: "0.3rem",
            }}
          >
            SEASON
          </label>
          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
            style={{
              width: "100%",
              background: "var(--md-surface-container)",
              border: "1px solid var(--md-outline)",
              borderRadius: "var(--shape-sm)",
              color: "var(--md-on-surface)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.4rem 0.5rem",
              cursor: "pointer",
            }}
            aria-label="Select season year"
          >
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Action row */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh telemetry cache"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              padding: "0.4rem",
              background: "var(--md-surface-container)",
              border: "1px solid var(--md-outline)",
              borderRadius: "var(--shape-sm)",
              color: isRefreshing ? "var(--md-primary)" : "var(--md-on-surface-variant)",
              cursor: isRefreshing ? "not-allowed" : "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all 120ms ease",
            }}
          >
            <RefreshCw
              size={12}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>{isRefreshing ? "SYNC" : "REFRESH"}</span>
          </button>

          <button
            type="button"
            onClick={cycleTheme}
            title="Cycle theme"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.4rem 0.6rem",
              background: "var(--md-surface-container)",
              border: "1px solid var(--md-outline)",
              borderRadius: "var(--shape-sm)",
              color: "var(--md-on-surface-variant)",
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
            aria-label="Switch Theme"
          >
            <ThemeIcon themeMode={themeMode} />
          </button>
        </div>
      </div>
    </aside>
  );
};



/* ── Footer ──────────────────────────────────────────────── */
const Footer = () => (
  <footer
    style={{
      background: "var(--sidebar-bg)",
      borderTop: "1px solid var(--sidebar-border)",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      fontFamily: "var(--font-mono)",
      fontSize: "0.58rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--md-on-surface-variant)",
    }}
  >
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
      <span>© 2026 {AppConfig.name} — F1 TELEMETRY COMMAND CENTER</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.25rem" }}>
        <span>DATA: JOLPICA / ERGAST / OPENF1</span>
      </div>
    </div>
  </footer>
);

/* ── App Layout ──────────────────────────────────────────── */
const AppLayout = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [themeMode, setThemeMode] = useState(() => prefsBucket.getRecord("theme") || "system");
  const [seasonYear, setSeasonYear] = useState(() => prefsBucket.getRecord("seasonYear") || CURRENT_YEAR);

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
          queryClient.refetchQueries({ queryKey: [prefix], type: "active" })
        )
      );
      setLastRefreshAt(Date.now());
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <ScrollToTop />
      <RouteStorageSync />

      {/* Mobile Sticky Top Bar */}
      <div className="mobile-top-bar md:hidden">
        <span className="font-display font-black text-sm tracking-wider text-white">
          PIT<span style={{ color: "var(--md-primary)" }}>STOP</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`text-[var(--md-on-surface-variant)] p-1 hover:text-white transition-colors ${
              isRefreshing ? "animate-spin text-[var(--md-primary)]" : ""
            }`}
            aria-label="Refresh telemetry cache"
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={cycleTheme}
            className="text-[var(--md-on-surface-variant)] p-1 hover:text-white transition-colors"
            aria-label="Cycle theme"
          >
            <ThemeIcon themeMode={themeMode} />
          </button>
        </div>
      </div>

      {/* Sidebar + content */}
      <div className="app-layout">
        <Sidebar
          seasonYear={seasonYear}
          setSeasonYear={setSeasonYear}
          themeMode={themeMode}
          cycleTheme={cycleTheme}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
        />

        {/* Main content column */}
        <div className="app-content">
          <main style={{ flex: 1, position: "relative" }}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard year={seasonYear} />} />
                <Route path="/archives" element={<ArchivesPage year={seasonYear} />} />
                <Route path="/drivers" element={<DriversPage year={seasonYear} />} />
                <Route path="/score-card" element={<ScoreCardPage year={seasonYear} />} />
                <Route path="/standings" element={<ScoreCardPage year={seasonYear} />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProfilePage
                      seasonYear={seasonYear}
                      setSeasonYear={setSeasonYear}
                      themeMode={themeMode}
                      setThemeMode={setThemeMode}
                      isRefreshing={isRefreshing}
                      handleRefresh={handleRefresh}
                    />
                  }
                />
                <Route path="/event/:meetingKey" element={<EventDetails year={seasonYear} />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </div>

      {/* Bottom Nav Tab Bar for Mobile */}
      <nav className="ios-tab-bar md:hidden">
        {APP_ROUTES.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `ios-tab-item ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
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
