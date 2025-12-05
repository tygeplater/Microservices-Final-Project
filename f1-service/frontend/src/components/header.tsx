import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
    return (
      <header className="mx-auto backdrop-blur-xl bg-gray-900/85 px-4 py-3 mb-10 shadow-2xl">
        <div className="flex flex-row">
            <div className="container mx-auto px-4 py-3">
                <h1 className="text-4xl font-bold text-white">Formula 1 Service</h1>
                <p className="text-red-100 mt-2">Formula 1 Race Calendar</p>
            </div>
            <div className="flex items-center justify-evenly gap-4 px-4 flex-1">
                <Link to="/">
                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition block w-full">
                        Home
                    </button>
                </Link>
                <Link to="/schedule">
                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition block w-full">
                        Schedule
                    </button>
                </Link>
                <Link to="/standings">
                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition block w-full">
                        Standings
                    </button>
                </Link>
                <Link to="/sessions">
                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition block w-full">
                        Sessions
                    </button>
                </Link>
            </div>
        </div>
      </header>
    )
}