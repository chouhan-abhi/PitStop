import React from "react";
import EventCard from "./Events/EventCard";

export const EventDashboard = ({
  eventsLoading,
  eventsIsError,
  eventsError,
  latestEvent,
  olderEvents,
}) => {
  /* -------------------- Loading State --------------------- */
  if (eventsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-[var(--text-color)] opacity-60">
          Loading events...
        </p>
      </div>
    );
  }

  /* -------------------- Error State --------------------- */
  if (eventsIsError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-red-500">
          {eventsError?.message || "Failed to load events"}
        </p>
      </div>
    );
  }

  /* ======================= MAIN UI ======================== */
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">

      {/* ---------------------- LATEST EVENT -------------------------- */}
      <div className="lg:col-span-2 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-color)] opacity-90 tracking-tight">
          Latest Event
        </h2>

        <div className="rounded-2xl p-4 bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[var(--border-color)] transition-all">
          {latestEvent ? (
            <EventCard event={latestEvent} isLatest={true} />
          ) : (
            <p className="text-[var(--text-color)] opacity-60">
              No latest event available.
            </p>
          )}
        </div>
      </div>

      {/* ---------------------- SIDEBAR (OLDER EVENTS) -------------------------- */}
      <div className="lg:col-span-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-color)] opacity-90 tracking-tight">
          Older Events
        </h3>

        <div
          className="
            flex-1 
            rounded-2xl 
            p-4 
            bg-[var(--card-bg)] 
            shadow-[0_4px_12px_rgba(0,0,0,0.08)] 
            border 
            border-[var(--border-color)]
            overflow-y-auto 
            relative
          "
          style={{ maxHeight: "calc(100vh - 260px)" }}
        >
          {/* Fade overlay for better UX */}
          <div className="pointer-events-none absolute top-0 left-0 h-6 w-full bg-gradient-to-b from-[var(--card-bg)] to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-full bg-gradient-to-t from-[var(--card-bg)] to-transparent" />

          {olderEvents && olderEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 pb-6">
              {olderEvents.map((event) => (
                <div
                  key={event.meeting_key}
                  className="
                    p-2 rounded-xl
                    transition-all 
                    duration-200 
                    hover:scale-[1.015]
                    hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]
                    bg-[var(--surface-bg)]
                    border 
                    border-[var(--border-color)]
                  "
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-color)] opacity-60">
              No older events available.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
