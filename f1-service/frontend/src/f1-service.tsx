import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Schedule, HomePage, Standings, SessionPage } from './pages/index';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/sessions" element={<SessionPage />} />
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
  );
}

export default App;