import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {isRegistering ? 'Create an account' : 'Sign in to Stats Service'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {error && (
            <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
          >
            {isRegistering ? 'Register' : 'Sign in'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
