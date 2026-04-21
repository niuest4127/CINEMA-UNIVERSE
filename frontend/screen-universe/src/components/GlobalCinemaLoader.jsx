import React from 'react';
import './GlobalCinemaLoader.css';

const GlobalCinemaLoader = () => {
  return (
    <div className="global-loader-container">
      <div className="loader-content">
        <div className="cinema-spinner"></div>
        <h2 className="loader-text">
          SCR<span className="shadow">EE</span>N UNIVERSE
        </h2>
        <p className="loader-subtext">Preparing your experience...</p>
      </div>
    </div>
  );
};

export default GlobalCinemaLoader;