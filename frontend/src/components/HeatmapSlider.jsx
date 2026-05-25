import React, { useState, useRef, useEffect } from 'react';

export default function HeatmapSlider({ originalUrl, heatmapUrl }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  return (
    <div 
      className="heatmap-slider-container" 
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
    >
      {/* Background: Original Image */}
      <img src={originalUrl} alt="Original forensic" className="heatmap-image" />
      
      {/* Foreground: Heatmap Overlay */}
      <img 
        src={heatmapUrl} 
        alt="Heatmap details" 
        className="heatmap-image heatmap-overlay"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      />
      
      {/* The Swipe Split Handle */}
      <div 
        className="slider-handle" 
        style={{ left: `${sliderPos}%` }}
      >
        <div className="slider-handle-button">
          &#8644;
        </div>
      </div>
    </div>
  );
}
