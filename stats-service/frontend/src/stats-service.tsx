import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { authService } from './auth/auth';
import './stats-service.css';

const StatsContent: React.FC = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
    
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header" style={{ padding: '20px', backgroundColor: '#282c34', color: 'white', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ margin: 0 }}>Stats Service</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user && (
              <>
                <span>Welcome, {user.username}</span>
                {isAdmin && (
                  <span style={{ backgroundColor: '#9c27b0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    ADMIN
                  </span>
                )}
                <button
                  onClick={logout}
                  style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {isAdmin && (
          <div style={{ marginBottom: '30px' }}>
            <AdminDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <StatsContent />
    </AuthProvider>
  );
}

export default App;
