import React from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../content/red-bull-tbt-2023.avif";
import { Header } from "../components";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
    <Header />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto backdrop-blur-xl bg-gray-900/85 border border-red-600/30 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-red-600 mb-4 drop-shadow-[0_0_20px_rgba(225,6,0,0.5)]">
                🏎️ F1 Service
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-400 mb-4">
                Your Gateway to Formula 1 Data
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Access comprehensive Formula 1 race schedules, real-time data,
                and detailed statistics all in one place. Powered by FastAPI and
                built for speed.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
              {/* Schedule Card */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 transition-all duration-300 hover:border-red-600 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col items-center space-y-4">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white">
                    Race Schedule
                  </h3>
                  <p className="text-gray-400 text-center text-sm">
                    View complete race calendars with dates, locations, and
                    event formats
                  </p>
                </div>
              </div>

              {/* Live Data Card */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 transition-all duration-300 hover:border-red-600 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col items-center space-y-4">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Live Data</h3>
                  <p className="text-gray-400 text-center text-sm">
                    Access real-time F1 session information and race data
                  </p>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 transition-all duration-300 hover:border-red-600 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col items-center space-y-4">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Statistics</h3>
                  <p className="text-gray-400 text-center text-sm">
                    Analyze detailed race statistics and performance metrics
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/schedule")}
              className="mt-8 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:scale-105 transition-all duration-300"
            >
              View Race Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
