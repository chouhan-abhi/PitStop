import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useRaceResults } from "./useRaceResults";
import AppLoader from "../../helperComponents/AppLoader";
import LocalStorageManager from "../../common/utils/LocalStorageManager";
import AppError from "../../helperComponents/AppError";

const Results = () => {
    const [params] = useSearchParams();
    const sessionKey = params.get("session_key") || "latest";
    const { data, isLoading, isError } = useRaceResults(sessionKey);
    const storage = new LocalStorageManager();
    const driversData = storage.get("drivers") || [];
    const getDriver = useMemo(
        () => (num) =>
            (driversData || []).find((d) => String(d?.driver_number) === String(num)) || {},
        [driversData]
    );

    // ✅ Memoized clean data
    const raceResults = useMemo(() => {
        if (!Array.isArray(data)) return [];

        // Remove duplicates by driver number (keep best/first position)
        const unique = new Map();
        for (const entry of data) {
            const key = String(entry.driver_number);
            if (!unique.has(key)) unique.set(key, entry);
        }

        // Sort by position
        return Array.from(unique.values()).sort((a, b) => a.position - b.position);
    }, [data]);

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-[calc(100vh-40px)] bg-gradient-to-b from-black to-red-900">
                <AppLoader />
            </div>
        );

    if (isError)
        return (
            <AppError message="Failed to load race results. Please try again." />
        );

    if (!raceResults.length)
        return (
            <div className="flex items-center justify-center h-[calc(100vh-40px)] bg-gradient-to-b from-black to-red-900 text-gray-400">
                No race results available.
            </div>
        );

    const podium = raceResults.slice(0, 3);
    const rest = raceResults.slice(3);
    const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

    return (
        <div
            key={sessionKey}
            className="min-h-[calc(100vh-40px)] bg-gradient-to-b from-black via-gray-950 to-red-900 text-white flex flex-col items-center p-6 overflow-y-auto"
        >
            <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
                🏁 Race Results
            </h1>

            {/* 🏆 Podium */}
            <div className="w-full max-w-5xl mb-16 flex justify-center items-end gap-8 relative">
                {podiumOrder.map((driver) => {
                    const info = getDriver(driver.driver_number);
                    const color = info.team_colour ? `#${info.team_colour}` : "#666";
                    const headshot =
                        info.headshot_url;

                    const heightClass =
                        driver.position === 1
                            ? "h-48"
                            : driver.position === 2
                                ? "h-40"
                                : "h-36";

                    const trophyColor =
                        driver.position === 1
                            ? "text-yellow-300"
                            : driver.position === 2
                                ? "text-gray-300"
                                : "text-amber-700";

                    return (
                        <div
                            key={driver.driver_number}
                            className="flex flex-col items-center justify-end relative w-32"
                        >
                            <img
                                src={headshot}
                                alt={info.full_name || `Driver #${driver.driver_number}`}
                                className="w-20 h-20 rounded-full border-4 border-gray-900 object-cover z-10 shadow-xl mb-[-1rem]"
                            />
                            <div
                                className={`${heightClass} w-full rounded-t-xl flex flex-col justify-end items-center border border-gray-700 shadow-xl relative`}
                                style={{ backgroundColor: color }}
                            >
                                <div className="w-full h-2 bg-gray-900/40 rounded-t-xl absolute top-0" />
                                <div className="text-center px-2 pb-2 mt-10 flex flex-col items-center gap-1">
                                    <div className={`text-2xl ${trophyColor}`}>🏆</div>
                                    <div className="text-sm font-bold text-gray-900 leading-tight">
                                        {info.full_name || `Driver #${driver.driver_number}`}
                                    </div>
                                    <div className="text-xs text-gray-900 font-semibold opacity-90">
                                        {info.team_name || "Unknown Team"}
                                    </div>
                                    <div className="text-xs font-bold text-gray-800/80">
                                        #{driver.driver_number}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 📊 Race Table */}
            {rest.length > 0 && (
                <div className="w-full max-w-4xl bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md">
                    <table className="w-full text-sm text-gray-300">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">Pos</th>
                                <th className="px-4 py-3 text-left">Driver</th>
                                <th className="px-4 py-3 text-left">Team</th>
                                <th className="px-4 py-3 text-left">Laps</th>
                                <th className="px-4 py-3 text-left">Time (s)</th>
                                <th className="px-4 py-3 text-left">Gap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rest.map((driver) => {
                                const info = getDriver(driver.driver_number);
                                const color = info.team_colour ? `#${info.team_colour}` : "#666";
                                const headshot =
                                    info.headshot_url;

                                return (
                                    <tr
                                        key={`${sessionKey}_${driver.driver_number}`}
                                        className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-bold text-gray-100">
                                            {driver.position}
                                        </td>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <img
                                                src={headshot}
                                                alt={info.full_name || ""}
                                                className="w-10 h-10 rounded-full border border-gray-700"
                                            />
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {info.full_name || `#${driver.driver_number}`}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    #{driver.driver_number}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" style={{ color }}>
                                            {info.team_name || "—"}
                                        </td>
                                        <td className="px-4 py-3">{driver.number_of_laps}</td>
                                        <td className="px-4 py-3">
                                            {driver.duration ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {driver.gap_to_leader ? `+${driver.gap_to_leader}` : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Results;
