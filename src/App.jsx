import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import "./App.css";
import { AppConfig } from "./common/AppConfig";
import LocalStorageManager from "./common/utils/LocalStorageManager";

import { Dashboard } from "./components/Dashboard";
import { EventDetails } from "./components/EventDetails";

import { Loader2, Sun, Moon, Sparkles, Laptop, RefreshCw } from "lucide-react";

// Create storage instance
const storage = new LocalStorageManager("f1pitstop");
const queryStorage = new LocalStorageManager("f1pitstop-query");

/* Scroll to top on route change */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const PageFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <Loader2 className="animate-spin w-8 h-8 opacity-60" />
  </div>
);

// Theme order including system mode
const THEME_ORDER = ["system", "dark", "light", "saint"];

// Detect OS theme
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function App() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load theme from storage
  const [themeMode, setThemeMode] = useState(() => {
    return storage.get("theme") || "system";
  });

  // Active theme (actual applied theme)
  const [activeTheme, setActiveTheme] = useState(
    themeMode === "system" ? getSystemTheme() : themeMode
  );

  // Apply themeMode changes
  useEffect(() => {
    let themeToApply = themeMode;

    if (themeMode === "system") {
      themeToApply = getSystemTheme();
      setActiveTheme(themeToApply);
    } else {
      setActiveTheme(themeMode);
    }

    document.documentElement.setAttribute("data-theme", themeToApply);
    // Theme is a user preference, not cache data, so it should never expire
    storage.set("theme", themeMode, Number.POSITIVE_INFINITY);
  }, [themeMode]);

  // Auto-update when OS theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      setActiveTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Cycle theme
  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(themeMode);
    const next = (currentIndex + 1) % THEME_ORDER.length;
    setThemeMode(THEME_ORDER[next]);
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear expired cache entries
      queryStorage.clearExpired();
      // Invalidate all queries to force refetch
      await queryClient.invalidateQueries();
      // Refetch all active queries
      await queryClient.refetchQueries();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Router>
      <ScrollToTop />

      <div
        className="min-h-screen flex flex-col transition-colors duration-300 relative z-10 grid-background"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md shadow-md relative"
          style={{
            backgroundColor: "var(--header-bg)",
          }}
        >
          <div className="mx-auto px-6 py-4 flex items-center justify-between">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--primary-color)" }}
            >
              {AppConfig.name}
            </h1>

            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh Data"
                title="Refresh data cache"
              >
                <RefreshCw
                  className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>

              {/* Theme Mode Button */}
              <button
                onClick={cycleTheme}
                className="p-1 rounded-full hover:scale-110 transition-transform"
                aria-label="Switch Theme"
              >
                {themeMode === "system" && <Laptop className="w-6 h-6" />}
                {themeMode === "dark" && <Moon className="w-6 h-6 text-slate-300" />}
                {themeMode === "light" && <Sun className="w-6 h-6 text-yellow-500" />}
                {themeMode === "saint" && (
                  <Sparkles className="w-6 h-6 text-purple-300" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full relative z-10">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/event/:meetingKey" element={<EventDetails />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer
          className="py-4 text-center text-sm relative z-10"
          style={{
            backgroundColor: "var(--header-bg)",
            color: "var(--text-color)",
            opacity: 0.75,
          }}
        >
          © 2025 {AppConfig.name} — All data © Formula 1
        </footer>
      </div>
    </Router>
  );
}
