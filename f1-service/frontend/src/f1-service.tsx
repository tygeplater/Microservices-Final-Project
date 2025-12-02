import React, { useState, useEffect } from 'react';
import { fetchSchedule } from './api/api.hub';
import { ScheduleEvent } from './models/models';

function App() {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(2024);

  useEffect(() => {
    loadSchedule(year);
  }, [year]);

  async function loadSchedule(selectedYear: number) {
    setLoading(true);
    setError(null);
    
    try {
      const schedule = await fetchSchedule(selectedYear);
      console.log('Response received:', schedule);
      setSchedule(schedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white">🏎️ F1 Schedule Service</h1>
          <p className="text-red-100 mt-2">Formula 1 Race Calendar</p>
        </div>
      </header>

      {/* Year Selector */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <label htmlFor="year" className="text-lg font-semibold">Select Year:</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {!loading && !error && schedule.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schedule.map((event) => (
              <div
                key={event.RoundNumber}
                className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20"
              >
                {/* Round Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Round {event.RoundNumber}
                  </span>
                  {event.F1ApiSupport && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">API</span>
                  )}
                </div>

                {/* Event Info */}
                <h3 className="text-xl font-bold text-red-400 mb-2">{event.EventName}</h3>
                <p className="text-gray-300 mb-1">📍 {event.Location}, {event.Country}</p>
                <p className="text-gray-400 text-sm mb-4">
                  📅 {new Date(event.EventDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>

                {/* Event Format */}
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-gray-400 mb-2">
                    <span className="font-semibold text-gray-300">Format:</span> {event.EventFormat}
                  </p>
                  
                  {/* Sessions */}
                  <div className="space-y-1 text-sm">
                    {event.Session5 && (
                      <p className="text-gray-300">🏁 {event.Session5}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && schedule.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No schedule data available for {year}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-700">
        <p className="text-center text-gray-500">
          F1 Schedule Service • Powered by FastAPI & React
        </p>
      </footer>
    </div>
  );
}

export default App;
