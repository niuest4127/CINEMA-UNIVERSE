import React, { useState } from 'react';
import './MovieCardSkeleton.css'; // Korzystamy z tych samych stylów pulsowania!

const ImageWithSkeleton = ({ src, alt, onClick, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {/* 1. Pokazujemy szkielet, dopóki obrazek się nie załaduje */}
      {!isLoaded && (
        <div 
          className={`skeleton-poster animate-pulse ${className}`} 
          onClick={onClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        ></div>
      )}

      {/* 2. Ukrywamy prawdziwy obrazek (display: none), aż się nie pobierze */}
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        className={className}
        style={isLoaded ? {} : { display: 'none' }}
        onLoad={() => setIsLoaded(true)} // <-- MAGIA: Gdy przeglądarka ściągnie obrazek, odpala się to!
        onError={(e) => {
          // Jeśli link do obrazka jest zepsuty, ukrywamy błąd
          setIsLoaded(true);
        }}
      />
    </>
  );
};

export default ImageWithSkeleton;