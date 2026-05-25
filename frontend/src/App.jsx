import React, { useState, useEffect } from 'react';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import UploadZone from './components/UploadZone';
import HistoryView from './components/HistoryView';
import ReportView from './components/ReportView';
import AdminPanel from './components/AdminPanel';
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [reportId, setReportId] = useState(null);
  const [reportUploadData, setReportUploadData] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_details');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (newToken, userDetails) => {
    setToken(newToken);
    setUser(userDetails);
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_details', JSON.stringify(userDetails));
    setPage('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_details');
    setPage('dashboard');
  };

  if (!token || !user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      <div className="bg-grid-3d"></div>
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo">
          <span style={{ fontSize: '1.75rem' }}>&#9738;</span>
          <span>DeepShield X</span>
        </div>

        <nav className="nav-menu">
          <li className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setPage('dashboard')}>
              <span>&#128202;</span> <span>Dashboard</span>
            </button>
          </li>
          <li className={`nav-item ${page === 'upload' ? 'active' : ''}`}>
            <button onClick={() => setPage('upload')}>
              <span>&#8673;</span> <span>Verify Media</span>
            </button>
          </li>
          <li className={`nav-item ${page === 'history' ? 'active' : ''}`}>
            <button onClick={() => setPage('history')}>
              <span>&#128196;</span> <span>Audit History</span>
            </button>
          </li>
          
          {user.role === 'ADMIN' && (
            <li className={`nav-item ${page === 'admin' ? 'active' : ''}`}>
              <button onClick={() => setPage('admin')}>
                <span>&#9881;</span> <span>Admin Panel</span>
              </button>
            </li>
          )}
        </nav>

        <div className="nav-footer">
          <div className="user-profile">
            <div className="avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="name">{user.name}</div>
              <div className="role">{user.role}</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>&#8594;</span> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        {page === 'dashboard' && (
          <DashboardView 
            token={token} 
            onViewReport={(id) => {
              setReportId(id);
              setReportUploadData(null); // Will fetch upload metadata inside ReportView
              setPage('report');
            }} 
            onNavigateToUpload={() => setPage('upload')} 
          />
        )}
        
        {page === 'upload' && (
          <UploadZone 
            token={token} 
            onUploadSuccess={(id, data) => {
              setReportId(id);
              setReportUploadData(data);
              setPage('report');
            }} 
          />
        )}

        {page === 'history' && (
          <HistoryView 
            token={token} 
            onViewReport={(id) => {
              setReportId(id);
              setReportUploadData(null);
              setPage('report');
            }} 
          />
        )}

        {page === 'admin' && user.role === 'ADMIN' && (
          <AdminPanel token={token} />
        )}

        {page === 'report' && (
          <ReportView 
            token={token} 
            uploadId={reportId} 
            uploadData={reportUploadData} 
            onBack={() => setPage('history')} 
          />
        )}
      </main>
    </div>
  );
}
