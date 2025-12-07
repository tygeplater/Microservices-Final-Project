import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/header';
import './stats-service.css';
import { BrowserRouter } from 'react-router-dom';

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
      <Header />
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
    <BrowserRouter>
      <AuthProvider>
        <StatsContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
