import React from 'react';
import './MovieCardSkeleton.css';

const MovieCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      {/* Plakat */}
      <div className="skeleton-poster animate-pulse"></div>
      
      {/* Informacje o filmie */}
      <div className="skeleton-info">
        <div className="skeleton-line title animate-pulse"></div>
        <div className="skeleton-line short animate-pulse"></div>
        <div className="skeleton-line animate-pulse" style={{ marginTop: '15px' }}></div>
        <div className="skeleton-line animate-pulse"></div>
        
        {/* Szkielety dla kafelków z godzinami */}
        <div className="skeleton-times-grid">
          <div className="skeleton-time-tile animate-pulse"></div>
          <div className="skeleton-time-tile animate-pulse"></div>
          <div className="skeleton-time-tile animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;