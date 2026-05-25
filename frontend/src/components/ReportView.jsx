import React, { useState, useEffect } from 'react';
import HeatmapSlider from './HeatmapSlider';
import Tilt from './Tilt';

export default function ReportView({ token, uploadId, uploadData, onBack }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('heatmap'); // heatmap, fft, noise

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`http://localhost:8080/api/result/${uploadId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setResult(data);
        }
      } catch (err) {
        console.error("Error fetching analysis result:", err);
      } finally {
        setLoading(false);
      }
    }

    if (uploadId) {
      fetchResult();
    }
  }, [uploadId, token]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '1.2rem', color: 'var(--color-primary)' }}>Executing deep forensic scanning models...</div>;
  }

  if (!result) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: '1.5rem' }}>Could not load results for this item.</p>
        <button onClick={onBack} className="btn btn-secondary">Go Back</button>
      </div>
    );
  }

  // Concatenate host domains
  const apiHost = 'http://localhost:8080';
  const aiHost = 'http://localhost:8000';

  const originalUrl = uploadData?.fileUrl 
    ? `${apiHost}${uploadData.fileUrl}` 
    : result?.fileUrl 
      ? `${apiHost}${result.fileUrl}`
      : `${apiHost}/api/upload/files/${uploadData?.fileName || result?.fileName || ''}`;

  const heatmapUrl = result.heatmapUrl ? `${aiHost}${result.heatmapUrl}` : '';
  const fftUrl = result.fftUrl ? `${aiHost}${result.fftUrl}` : '';
  const noiseUrl = result.noiseUrl ? `${aiHost}${result.noiseUrl}` : '';

  const isVideo = uploadData?.mediaType === 'VIDEO' || result.lipSyncMismatch !== null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          &larr; Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Forensic Report Analysis</h1>
          <p style={{ fontSize: '0.9rem' }}>File Token: {uploadId}</p>
        </div>
      </div>

      <div className="forensic-layout">
        {/* Left Side: Visual Assets Forensic Tab views */}
        <div className="forensic-media-panel">
          <div className="glass-card">
            <div className="forensic-tabs">
              <button 
                onClick={() => setActiveTab('heatmap')} 
                className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
              >
                Suspicious Hotspots (Heatmap)
              </button>
              
              {!isVideo && (
                <>
                  <button 
                    onClick={() => setActiveTab('fft')} 
                    className={`tab-btn ${activeTab === 'fft' ? 'active' : ''}`}
                  >
                    2D FFT Power Spectrum
                  </button>
                  <button 
                    onClick={() => setActiveTab('noise')} 
                    className={`tab-btn ${activeTab === 'noise' ? 'active' : ''}`}
                  >
                    Sensor Noise Residual
                  </button>
                </>
              )}
            </div>

            <div className="tab-content">
              {activeTab === 'heatmap' && (
                <div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Swipe the handle to compare the source file (left) with the Grad-CAM generative anomaly highlights (right).
                  </p>
                  {heatmapUrl ? (
                    <HeatmapSlider originalUrl={originalUrl} heatmapUrl={heatmapUrl} />
                  ) : isVideo ? (
                    <div style={{ padding: '4rem 2rem', background: '#0b0f19', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)' }}>Video playback heatmap overlay not available. See frame inconsistency metrics below.</p>
                    </div>
                  ) : (
                    <p>Heatmap could not load.</p>
                  )}
                </div>
              )}

              {activeTab === 'fft' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    The 2D Fast Fourier Transform (FFT) reveals periodic grid artifacts. Generative networks (GANs/Diffusions) leave checkerboard pixel patterns due to transposed convolutions. In natural photography, this spectrum decays smoothly from the center outwards.
                  </p>
                  {fftUrl ? (
                    <img 
                      src={fftUrl} 
                      alt="FFT Spectrum" 
                      style={{ maxWidth: '320px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-glow)' }} 
                    />
                  ) : (
                    <p>FFT Spectrum image not available.</p>
                  )}
                </div>
              )}

              {activeTab === 'noise' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    The noise residual isolates the photo's high-frequency camera sensor fingerprint. Artificial neural generations display uniform or missing micro-textures. Anomalous localized spikes point to compositing or deepfake blending.
                  </p>
                  {noiseUrl ? (
                    <img 
                      src={noiseUrl} 
                      alt="Noise Residual" 
                      style={{ maxWidth: '320px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <p>Noise residual image not available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Score Panel and Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Verdict */}
          <Tilt 
            className="glass-card" 
            style={{ 
              borderColor: result.prediction === 'FAKE' ? 'rgba(255, 51, 102, 0.3)' : 'rgba(0, 230, 118, 0.3)',
              boxShadow: result.prediction === 'FAKE' ? 'var(--shadow-glow-red)' : '0 0 20px rgba(0, 230, 118, 0.05)'
            }}
          >
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Analysis Verdict
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '2.5rem', color: result.prediction === 'FAKE' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {result.prediction}
              </h2>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {result.confidenceScore}%
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Confidence of generator match: <strong>{result.generatorType}</strong>
            </p>
          </Tilt>

          {/* AI Forensic Explanation */}
          <Tilt className="glass-card">
            <h3 style={{ marginBottom: '0.75rem', color: '#ffffff' }}>Explainable AI (XAI) Summary</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {result.explanation}
            </p>
          </Tilt>

          {/* Core CNN / ViT Ensemble Metrics */}
          {!isVideo ? (
            <Tilt className="glass-card">
              <h3 style={{ marginBottom: '1.25rem', color: '#ffffff' }}>Ensemble ML Classifier Details</h3>
              <div className="metrics-list">
                <div className="metric-row">
                  <div className="metric-meta">
                    <span>EfficientNet-B4 (CNN Spatial)</span>
                    <span style={{ fontWeight: 600 }}>{result.efficientNetScore}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.efficientNetScore}%` }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-meta">
                    <span>Vision Transformer (ViT Attention)</span>
                    <span style={{ fontWeight: 600 }}>{result.vitScore}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.vitScore}%` }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-meta">
                    <span>ConvNeXt (Layer Features)</span>
                    <span style={{ fontWeight: 600 }}>{result.convNextScore}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.convNextScore}%` }}></div>
                  </div>
                </div>
              </div>
            </Tilt>
          ) : (
            // Video Deepfake metrics
            <Tilt className="glass-card">
              <h3 style={{ marginBottom: '1.25rem', color: '#ffffff' }}>Video Facial Forensic Details</h3>
              <div className="metrics-list">
                <div className="metric-row">
                  <div className="metric-meta">
                    <span>Lip-Sync Audio Mismatch</span>
                    <span style={{ fontWeight: 600 }}>{result.lipSyncMismatch}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.lipSyncMismatch}%` }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-meta">
                    <span>Eye Blinking Anomalies</span>
                    <span style={{ fontWeight: 600 }}>{result.blinkingAnomalies}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.blinkingAnomalies}%` }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-meta">
                    <span>Frame Temporal Artifacts</span>
                    <span style={{ fontWeight: 600 }}>{result.frameArtifacts}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.frameArtifacts}%` }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-meta">
                    <span>Facial Boundary Inconsistency</span>
                    <span style={{ fontWeight: 600 }}>{result.facialInconsistency}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill red" style={{ width: `${result.facialInconsistency}%` }}></div>
                  </div>
                </div>
              </div>
            </Tilt>
          )}

          {/* EXIF Metadata Tag checklist */}
          <Tilt className="glass-card">
            <h3 style={{ marginBottom: '1rem', color: '#ffffff' }}>EXIF Metadata Signatures</h3>
            {Object.keys(result.exif || {}).length === 0 || result.exif?.Warning || result.exif?.Error ? (
              <div style={{ padding: '0.75rem', borderRadius: '4px', background: 'rgba(255, 51, 102, 0.1)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                &#9888; {result.exif?.Warning || result.exif?.Error || 'EXIF metadata missing: Device footprint could not be validated.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(result.exif || {}).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{key}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </Tilt>
        </div>
      </div>
    </div>
  );
}
