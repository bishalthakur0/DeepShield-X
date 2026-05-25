import React, { useState, useRef } from 'react';
import Tilt from './Tilt';

export default function UploadZone({ token, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
    const isVideo = ['mp4', 'avi', 'mov'].includes(ext);

    if (!isImage && !isVideo) {
      setError('Unsupported file type. Please upload a JPG, PNG, WEBP, MP4, AVI, or MOV file.');
      return;
    }

    setError('');
    setScanFile(file);
    
    // Set preview URL (only for images)
    if (isImage) {
      setScanPreviewUrl(URL.createObjectURL(file));
    } else {
      setScanPreviewUrl(''); // Clear for video
    }

    // Trigger Upload
    uploadFile(file, isImage ? 'IMAGE' : 'VIDEO');
  };

  const uploadFile = async (file, mediaType) => {
    setLoading(true);
    setProgress(15);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload to Spring Boot
      const uploadEndpoint = mediaType === 'IMAGE' ? '/api/upload/image' : '/api/upload/video';
      const response = await fetch(`http://localhost:8080${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to the server.');
      }

      setProgress(45);
      const uploadData = await response.json();
      const uploadId = uploadData.id;

      // 2. Trigger Forensics Analysis Loop
      setProgress(75);
      const resultResponse = await fetch(`http://localhost:8080/api/result/${uploadId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!resultResponse.ok) {
        throw new Error('Forensic analysis engine failed.');
      }

      setProgress(100);
      const resultData = await resultResponse.json();
      
      // Delay slightly so the user sees 100% completion
      setTimeout(() => {
        onUploadSuccess(uploadId, uploadData);
        setLoading(false);
        setScanFile(null);
        setScanPreviewUrl('');
      }, 1000);

    } catch (err) {
      setError(err.message || 'An error occurred during verification.');
      setLoading(false);
      setScanFile(null);
      setScanPreviewUrl('');
    }
  };

  return (
    <div className="upload-arena">
      <Tilt className="glass-card text-center">
        <h2 style={{ marginBottom: '1rem', color: '#ffffff' }}>Verify Media Authenticity</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Upload files to scan for Generative AI footprints, GAN artifacts, frame inconsistencies, and EXIF signature anomalies.
        </p>

        {error && (
          <div style={{ color: 'var(--color-danger)', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
            &#9888; {error}
          </div>
        )}

        {!loading && (
          <div 
            className={`dropzone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input 
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleChange}
              accept=".jpg,.jpeg,.png,.webp,.mp4,.avi,.mov"
            />
            
            <div className="upload-icon">&#8673;</div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Drag and drop file here</h3>
            <p style={{ fontSize: '0.85rem' }}>or click to browse from device</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Supports JPG, PNG, WEBP, MP4, AVI, MOV (Max 50MB)
            </div>
          </div>
        )}

        {loading && (
          <div style={{ padding: '2rem 0' }}>
            <h3 style={{ marginBottom: '1rem', color: '#ffffff' }}>Analyzing Media Core...</h3>
            
            {scanPreviewUrl ? (
              <div className="scanning-container">
                <img src={scanPreviewUrl} alt="Preview" className="scanning-image" />
                <div className="scan-bar"></div>
                <div className="scanning-glow"></div>
              </div>
            ) : (
              <div style={{ margin: '3rem auto', width: '80px', height: '80px', borderRadius: '50%', border: '3px solid rgba(0, 210, 255, 0.1)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
            )}

            <div className="metric-row" style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>
              <div className="metric-meta">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Extracting frequency grids</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{progress}%</span>
              </div>
              <div className="metric-bar-bg">
                <div className="metric-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </Tilt>
    </div>
  );
}
