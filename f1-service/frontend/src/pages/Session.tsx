import { Header, Footer } from "../components/index";
import { fetchSchedule, fetchSessionInfo } from "../api/api.hub";
import { useState, useEffect } from "react";
import React from "react";
import { ScheduleEvent, DriverResult } from "../models/models";
import { parse } from "tinyduration";

// Map session names to session codes
function getSessionCode(sessionName: string): string {
    const mapping: { [key: string]: string } = {
        "Race": "R",
        "Qualifying": "Q",
        "Sprint": "S",
        "Sprint Qualifying": "SQ",
        "Sprint Shootout": "SS",
        "Practice 1": "FP1",
        "Practice 2": "FP2",
        "Practice 3": "FP3",
    };
    return mapping[sessionName] || sessionName;
}

// Format ISO 8601 duration to readable time format
function formatDuration(isoDuration: string | null | undefined): string {
    if (!isoDuration || typeof isoDuration !== 'string') {
        return "-";
    }

    // Check if it's already in a readable format (not ISO duration)
    if (!isoDuration.startsWith('P')) {
        return isoDuration;
    }

    try {
        // Parse ISO 8601 duration using tinyduration library
        const duration = parse(isoDuration);
        
        // Calculate total hours including days
        const totalHours = (duration.days || 0) * 24 + (duration.hours || 0);
        const minutes = duration.minutes || 0;
        const seconds = duration.seconds || 0;

        // Format based on what's present
        const parts: string[] = [];
        
        // Add hours if present
        if (totalHours > 0) {
            parts.push(`${totalHours}:`);
        }
        
        // Always add minutes (pad to 2 digits if hours are present)
        if (totalHours > 0) {
            parts.push(`${minutes.toString().padStart(2, '0')}:`);
        } else if (minutes > 0) {
            parts.push(`${minutes}:`);
        }
        
        // Format seconds
        if (totalHours > 0 || minutes > 0) {
            // If we have hours or minutes, pad seconds to 2 digits before decimal
            const secInt = Math.floor(seconds);
            const secDec = (seconds - secInt).toFixed(3).substring(1); // Get .565 part
            parts.push(`${secInt.toString().padStart(2, '0')}${secDec}`);
        } else {
            // Just seconds, show full precision
            parts.push(seconds.toFixed(3));
        }

        return parts.join('');
    } catch (error) {
        return isoDuration; // Return original if parsing fails
    }
}

// Get available sessions for an event
function getAvailableSessions(event: ScheduleEvent): Array<{ name: string; code: string }> {
    const sessions: Array<{ name: string; code: string }> = [];
    if (event.Session1 && event.Session1 !== "None") sessions.push({ name: event.Session1, code: getSessionCode(event.Session1) });
    if (event.Session2 && event.Session2 !== "None") sessions.push({ name: event.Session2, code: getSessionCode(event.Session2) });
    if (event.Session3 && event.Session3 !== "None") sessions.push({ name: event.Session3, code: getSessionCode(event.Session3) });
    if (event.Session4 && event.Session4 !== "None") sessions.push({ name: event.Session4, code: getSessionCode(event.Session4) });
    if (event.Session5 && event.Session5 !== "None") sessions.push({ name: event.Session5, code: getSessionCode(event.Session5) });
    return sessions;
}

export function SessionPage() {
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [year, setYear] = useState<number>(2024);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [selectedSessionCode, setSelectedSessionCode] = useState<string>("");
    const [sessionInfo, setSessionInfo] = useState<DriverResult[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Load schedule when year changes
    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            setError(null);
            try {
                const events = await fetchSchedule(year);
                setSchedule(events);
                // Reset selections when year changes
                setSelectedEvent(null);
                setSelectedSessionCode("");
                setSessionInfo(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load schedule");
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, [year]);

    // Load session info when event and session are selected
    useEffect(() => {
        if (selectedEvent && selectedSessionCode) {
            const event = selectedEvent; // Store in local variable for TypeScript
            async function loadSessionData() {
                setLoading(true);
                setError(null);
                try {
                    const round = event.RoundNumber.toString();
                    const data = await fetchSessionInfo(year, round, selectedSessionCode);
                    setSessionInfo(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to load session info");
                    setSessionInfo(null);
                } finally {
                    setLoading(false);
                }
            }
            loadSessionData();
        }
    }, [selectedEvent, selectedSessionCode, year]);

    // Reset session selection when event changes
    useEffect(() => {
        setSelectedSessionCode("");
        setSessionInfo(null);
    }, [selectedEvent]);

    const availableSessions = selectedEvent ? getAvailableSessions(selectedEvent) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <Header />

            <div className="container mx-auto px-4 py-6">
                {/* Year Selector */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <label htmlFor="year" className="text-lg font-semibold">Select Year:</label>
                        <select 
                            id="year" 
                            value={year} 
                            onChange={(e) => setYear(Number(e.target.value))} 
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Event Selector */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <label htmlFor="event" className="text-lg font-semibold">Select Event:</label>
                        <select 
                            id="event" 
                            value={selectedEvent?.EventName || ""} 
                            onChange={(e) => {
                                const event = schedule.find(ev => ev.EventName === e.target.value);
                                setSelectedEvent(event || null);
                            }}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[300px]"
                            disabled={loading || schedule.length === 0}
                        >
                            <option value="">-- Select an event --</option>
                            {schedule.map((event) => (
                                <option key={event.RoundNumber} value={event.EventName}>
                                    Round {event.RoundNumber}: {event.EventName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Session Selector */}
                {selectedEvent && (
                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <label htmlFor="session" className="text-lg font-semibold">Select Session:</label>
                            <select 
                                id="session" 
                                value={selectedSessionCode} 
                                onChange={(e) => setSelectedSessionCode(e.target.value)}
                                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[250px]"
                                disabled={loading}
                            >
                                <option value="">-- Select a session --</option>
                                {availableSessions.map((session) => (
                                    <option key={session.code} value={session.code}>
                                        {session.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
                        <p className="font-semibold">Error: {error}</p>
                    </div>
                )}

                {/* Session Results Display */}
                {!loading && sessionInfo && sessionInfo.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4 text-red-400">
                            {selectedEvent?.EventName} - {availableSessions.find(s => s.code === selectedSessionCode)?.name}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-gray-800 rounded-lg border border-gray-700">
                                <thead>
                                    <tr className="bg-gray-700 border-b border-gray-600">
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Pos</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Driver</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Team</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Points</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Laps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionInfo.map((result: DriverResult, index: number) => (
                                        <tr 
                                            key={result.DriverId} 
                                            className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-semibold">{result.Position || index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {result.HeadshotUrl && (
                                                        <img 
                                                            src={result.HeadshotUrl} 
                                                            alt={result.FullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-semibold">{result.BroadcastName}</div>
                                                        <div className="text-sm text-gray-400">{result.Abbreviation}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {result.TeamColor && (
                                                        <div 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ backgroundColor: `#${result.TeamColor}` }}
                                                        ></div>
                                                    )}
                                                    <span>{result.TeamName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {result.Time 
                                                    ? ((result.Position || index + 1) > 1 
                                                        ? `+${formatDuration(result.Time)}`
                                                        : formatDuration(result.Time))
                                                    : result.Q3 
                                                        ? `Q3: ${formatDuration(result.Q3)}`
                                                        : result.Q2 
                                                            ? `Q2: ${formatDuration(result.Q2)}`
                                                            : result.Q1
                                                                ? `Q1: ${formatDuration(result.Q1)}`
                                                                : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    result.Status === "Finished" 
                                                        ? "bg-green-500/20 text-green-300" 
                                                        : result.Status?.includes("Lap") 
                                                        ? "bg-yellow-500/20 text-yellow-300"
                                                        : "bg-red-500/20 text-red-300"
                                                }`}>
                                                    {result.Status || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{result.Points || 0}</td>
                                            <td className="px-4 py-3">{result.Laps || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Results Message */}
                {!loading && selectedSessionCode && sessionInfo && sessionInfo.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl">No session data available</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}