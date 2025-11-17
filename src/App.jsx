import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "./App.css";
import { AppConfig } from "./common/AppConfig";
import LocalStorageManager from "./common/utils/LocalStorageManager";

import { Dashboard } from "./components/Dashboard";
import { EventDetails } from "./components/EventDetails";

import { Loader2, Sun, Moon, Sparkles, Laptop } from "lucide-react";

// Create storage instance
const storage = new LocalStorageManager("f1pitstop");

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
    storage.set("theme", themeMode);
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

  return (
    <Router>
      <ScrollToTop />

      <div
        className="min-h-screen flex flex-col transition-colors duration-300"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md shadow-md"
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
        </header>

        {/* Main content */}
        <main className="flex-1 w-full">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/event/:meetingKey" element={<EventDetails />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer
          className="border-t py-4 text-center text-sm"
          style={{
            backgroundColor: "var(--header-bg)",
            borderColor: "var(--border-color)",
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
