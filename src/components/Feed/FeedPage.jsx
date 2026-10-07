import React, { useState, Suspense } from "react";
import { Newspaper, Sparkles, Filter } from "lucide-react";
import Surface from "../ui/Surface";
import { usePersonalization, F1_TEAMS } from "../../common/storage/personalizationStore";
import ShimmerLoader from "../Common/ShimmerLoader";

const News = React.lazy(() => import("../News/News"));

export const FeedPage = () => {
  const { favoriteTeam, favoriteTeamObj } = usePersonalization();
  const [selectedTeamFilter, setSelectedTeamFilter] = useState(favoriteTeam || "all");

  return (
    <div className="app-shell py-5 lg:py-8 space-y-5">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide uppercase text-white flex items-center gap-2.5">
            <Newspaper size={24} className="text-[var(--md-primary)]" />
            F1 Newsroom & Feed
          </h1>
          <p className="text-xs font-mono text-[var(--md-on-surface-variant)] mt-1">
            Real-time paddock reporting, race debriefs, and technical analysis
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTeamFilter("all")}
            className={`px-3 py-1.5 rounded-[var(--shape-sm)] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedTeamFilter === "all"
                ? "bg-[var(--md-primary)] text-black shadow-sm"
                : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] border border-[var(--md-outline-variant)] hover:text-white"
            }`}
          >
            All Stories
          </button>

          {favoriteTeamObj && (
            <button
              onClick={() => setSelectedTeamFilter(favoriteTeamObj.id)}
              className={`px-3 py-1.5 rounded-[var(--shape-sm)] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTeamFilter === favoriteTeamObj.id
                  ? "bg-white text-black shadow-sm"
                  : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] border border-[var(--md-outline-variant)] hover:text-white"
              }`}
              style={{
                borderLeftColor: favoriteTeamObj.color,
                borderLeftWidth: "3px",
              }}
            >
              ★ {favoriteTeamObj.shortName}
            </button>
          )}
        </div>
      </div>

      {/* Main Newsroom Grid */}
      <Suspense fallback={<ShimmerLoader />}>
        <News layout="grid" showHeader={false} />
      </Suspense>
    </div>
  );
};

export default FeedPage;
