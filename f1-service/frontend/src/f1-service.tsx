import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Schedule, HomePage, Standings } from './pages/index';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/standings"
          element={
            <ProtectedRoute>
              <Standings />
            </ProtectedRoute>
          }
        />
        {/* Optional: Add a catch-all route for 404 pages */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;