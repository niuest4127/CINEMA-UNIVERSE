import React, { useState } from 'react';
import './MovieCardSkeleton.css'; 

const ImageWithSkeleton = ({ src, alt, onClick, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
   
      {!isLoaded && (
        <div 
          className={`skeleton-poster animate-pulse ${className}`} 
          onClick={onClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        ></div>
      )}


      <img
        src={src}
        alt={alt}
        onClick={onClick}
        className={className}
        style={isLoaded ? {} : { display: 'none' }}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {

          setIsLoaded(true);
        }}
      />
    </>
  );
};

export default ImageWithSkeleton;