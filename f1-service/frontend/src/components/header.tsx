export function Header() {
    return (
      <header className="bg-red-600 shadow-lg">
        <div className="flex flex-row">
            <div className="container mx-auto px-4 py-3">
                <h1 className="text-4xl font-bold text-white">Formula 1 Service</h1>
                <p className="text-red-100 mt-2">Formula 1 Race Calendar</p>
            </div>
            <div className="flex items-center justify-evenly gap-4 px-4 flex-1">
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition">
                    <a href="/">
                        Home
                    </a>
                </button>
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition">
                    <a href="/schedule">
                        Schedule
                    </a>
                </button>
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition">
                    <a href="/standings">
                        Standings
                    </a>
                </button>
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 py-2 rounded transition">
                    <a href="/sessions">
                        Sessions
                    </a>
                </button>
            </div>
        </div>
      </header>
    )
}