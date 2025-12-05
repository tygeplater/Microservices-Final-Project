import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
      <header className="mx-auto backdrop-blur-xl bg-gray-900/85 px-4 py-3 mb-10 shadow-2xl">
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
                {isAuthenticated && user && (
                    <div className="flex items-center gap-4">
                        <span className="text-white">Welcome, {user.username}</span>
                        {user.role === 'admin' && (
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">ADMIN</span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>
    )
}