import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { AppConfig } from "./common/AppConfig";

// Components
import { Dashboard } from "./components/Dashboard";
import { EventDetails } from "./components/EventDetails";

// Icons
import { Loader2 } from "lucide-react";

/* Scroll to top on route change */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

/* Shimmer fallback */
const PageFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <Loader2 className="animate-spin w-8 h-8 opacity-60" />
  </div>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      {/* App container */}
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        {/* Header */}
        <header
          className="
            sticky top-0 z-50 backdrop-blur-md shadow-md
          "
          style={{
            backgroundColor: "var(--header-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="mx-auto px-6 py-4 flex items-center gap-3">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--primary-color)" }}
            >
              {AppConfig.name}
            </h1>
          </div>
        </header>

        {/* Main content with transitions */}
        <main className="flex-1 w-full py-8">
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
