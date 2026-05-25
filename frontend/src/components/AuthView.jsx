import React, { useState } from 'react';
import Tilt from './Tilt';

export default function AuthView({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('ANALYST'); // Default to analyst for high access
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password } 
      : { name, email, password, role };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication transaction failed.');
      }

      onAuthSuccess(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      });
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Tilt className="glass-card auth-card">
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>&#9738;</span>
          <span>DEEPSHIELD X</span>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#ffffff' }}>
          {isLogin ? 'Media Audit Registry' : 'Register Secure Profile'}
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          {isLogin ? 'Access forensic networks & classifiers.' : 'Initialize credentials to access the AI engine.'}
        </p>

        {error && (
          <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
            &#9888; {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Inspector Miller"
              />
            </div>
          )}

          <div className="form-group">
            <label>Secure Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@deepshield.io"
            />
          </div>

          <div className="form-group">
            <label>Master Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Security Clearance Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="USER">USER (Standard Scan)</option>
                <option value="ANALYST">ANALYST (Detailed Forensics)</option>
                <option value="ADMIN">ADMIN (System Owner)</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Processing Cryptography...' : isLogin ? 'Sign In to Terminal' : 'Generate Credentials'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have a credentials profile? " : "Already registered? "}
          </span>
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Register Profile' : 'Sign In'}
          </button>
        </div>
      </Tilt>
    </div>
  );
}
