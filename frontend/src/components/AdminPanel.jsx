import React, { useState, useEffect } from 'react';

export default function AdminPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch Users
        const usersRes = await fetch('http://localhost:8080/api/admin/users', { headers });
        if (usersRes.status === 403) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        
        const usersData = usersRes.ok ? await usersRes.json() : [];

        // Fetch Logs
        const logsRes = await fetch('http://localhost:8080/api/admin/logs', { headers });
        const logsData = logsRes.ok ? await logsRes.json() : [];

        setUsers(usersData);
        setLogs(logsData);
      } catch (err) {
        console.error("Failed to retrieve administrator telemetry:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [token]);

  if (unauthorized) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem', maxWidth: '600px', margin: '3rem auto' }}>
        <div style={{ fontSize: '3rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>&#9888;</div>
        <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Access Denied</h2>
        <p>You require administrator role permissions to inspect user tables and system audit log streams.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '1.2rem', color: 'var(--color-primary)' }}>Synchronizing telemetry stream...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1>System Administration Panel</h1>
        <p>User directory orchestration and physical log stream telemetry.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* User directory */}
        <div className="glass-card">
          <h3 style={{ color: '#ffffff', marginBottom: '1.25rem' }}>Registered Users Directory</h3>
          <div className="table-container" style={{ marginTop: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(0, 210, 255, 0.1)', color: 'var(--color-primary)' }}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Logger Terminal console */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Audit Event Log Stream</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Active database queries and login transaction security reports.</p>
          
          <div 
            style={{ 
              flex: 1, 
              background: '#040710', 
              borderRadius: '8px', 
              padding: '1rem', 
              fontFamily: 'monospace', 
              fontSize: '0.8rem', 
              overflowY: 'auto', 
              maxHeight: '380px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: '#64748b' }}>[SYSTEM] Log stream empty.</span>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--color-primary)' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{log.eventType}</span>:{' '}
                  <span style={{ color: '#e2e8f0' }}>{log.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
