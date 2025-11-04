import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import PageSwitcher from "./PageSwitcher";

const AppHeader = () => (
  <header className="fixed top-0 left-0 w-full z-20 bg-black/90 backdrop-blur-md border-b border-red-600/40 shadow-[0_0_12px_rgba(255,0,0,0.3)]">
    <h1
      className="
        text-center
        text-5xl
        tracking-[0.15em]
        text-red-500
        py-4
        select-none
        animate-pulse-slow
      "
    >
      F1 PitStop
    </h1>
  </header>
);

export default function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen flex flex-col text-white font-[Rajdhani] relative">
        <AppHeader />
        {/* Spacer for fixed header */}
        <div className="h-24" />
        <main className="flex-1 px-4 sm:px-8">
          <PageSwitcher />
        </main>
      </div>
    </Router>
  );
}
