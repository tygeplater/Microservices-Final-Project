import React, { useState, useEffect } from 'react';
import { getUsageData } from '../api/api.hub';
import { UsageSummary, EndpointUsage, RecentUsage } from '../models/models';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [endpointUsage, setEndpointUsage] = useState<EndpointUsage[]>([]);
  const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { summaryData, endpointData, recentData } = await getUsageData();

      setSummary(summaryData);
      setEndpointUsage(endpointData);
      setRecentUsage(recentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading usage statistics...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={fetchUsageData} style={{ marginTop: '10px', padding: '8px 16px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Admin Dashboard - Usage Statistics</h1>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#666' }}>Total Requests</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{summary.total_requests}</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#666' }}>Average Response Time</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              {summary.average_response_time_ms.toFixed(2)} ms
            </p>
          </div>
        </div>
      )}

      {/* Endpoint Usage Table */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Usage by Endpoint</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Endpoint</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Request Count</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Avg Response Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {endpointUsage.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.endpoint}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.request_count}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.avg_response_time_ms.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Usage Table */}
      <div>
        <h2>Recent API Usage</h2>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Timestamp</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Service</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Endpoint</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Response Time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {recentUsage.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(item.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{item.service}</td>
                  <td style={{ padding: '12px' }}>{item.endpoint}</td>
                  <td style={{ padding: '12px' }}>{item.method}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: item.status_code >= 400 ? 'red' : 'green' }}>
                    {item.status_code}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{item.response_time_ms.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
