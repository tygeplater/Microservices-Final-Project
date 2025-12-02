import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Schedule, HomePage } from './pages/index';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<Schedule />} />
        {/* Optional: Add a catch-all route for 404 pages */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
  );
}

export default App;