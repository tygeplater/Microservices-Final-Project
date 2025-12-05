import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
    const { user, logout, isAdmin } = useAuth();

    return (
      <header className="mx-auto backdrop-blur-xl bg-gray-900/85 px-4 py-3 mb-10 shadow-2xl">
        <div className="flex flex-row">
            <div className="container mx-auto px-4 py-3">
                <h1 className="text-4xl font-bold text-white">Stats Service</h1>
                <p className="text-red-100 mt-2">API Usage Statistics & Analytics</p>
            </div>
            <div className="flex items-center justify-evenly gap-4 px-4 flex-1">
                {user && (
                    <div className="flex items-center gap-4 ml-4">
                        <span className="text-white">Welcome, {user.username}</span>
                        {isAdmin && (
                            <span className="bg-purple-600 px-2 py-1 rounded text-xs text-white font-semibold">
                                ADMIN
                            </span>
                        )}
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition cursor-pointer border-none"
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