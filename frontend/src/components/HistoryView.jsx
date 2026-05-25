import React, { useState, useEffect } from 'react';

export default function HistoryView({ token, onViewReport }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterVerdict, setFilterVerdict] = useState('ALL');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('http://localhost:8080/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load historical audits:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [token]);

  const filteredHistory = history.filter((item) => {
    const filenameMatch = item.fileName.toLowerCase().includes(search.toLowerCase());
    const typeMatch = filterType === 'ALL' || item.mediaType === filterType;
    const verdictMatch = filterVerdict === 'ALL' || item.prediction === filterVerdict;
    return filenameMatch && typeMatch && verdictMatch;
  });

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#ffffff' }}>Verification Audit History</h2>
          <p>Search, filter, and review all previous media forensic audits.</p>
        </div>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by filename..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }}
          />

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }}
          >
            <option value="ALL">All Formats</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
          </select>

          <select 
            value={filterVerdict} 
            onChange={(e) => setFilterVerdict(e.target.value)}
            style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }}
          >
            <option value="ALL">All Verdicts</option>
            <option value="REAL">Real Only</option>
            <option value="FAKE">Fake Only</option>
            <option value="PENDING">Pending Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--color-primary)' }}>Loading History records...</div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No forensic records matching search criteria.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Media Format</th>
                <th>Analysis Date</th>
                <th>Classification</th>
                <th>Match Score</th>
                <th>Fingerprint</th>
                <th>Report Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: '#ffffff' }}>{item.fileName}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.mediaType}</span>
                  </td>
                  <td>{new Date(item.uploadTime).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${item.prediction === 'FAKE' ? 'badge-fake' : item.prediction === 'REAL' ? 'badge-real' : 'badge-pending'}`}>
                      {item.prediction}
                    </span>
                  </td>
                  <td>
                    {item.confidenceScore ? `${item.confidenceScore}%` : 'N/A'}
                  </td>
                  <td>
                    <span style={{ color: item.generatorType === 'REAL_CAMERA' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {item.generatorType}
                    </span>
                  </td>
                  <td>
                    {item.status === 'COMPLETED' ? (
                      <button 
                        onClick={() => onViewReport(item.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        View Details
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.status}...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
