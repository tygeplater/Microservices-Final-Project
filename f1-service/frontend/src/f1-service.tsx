import React, { useState, useEffect } from 'react';
import './f1-service.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from backend API
    fetch('/api/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>F1 Service</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        {data && (
          <div className="data-container">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
