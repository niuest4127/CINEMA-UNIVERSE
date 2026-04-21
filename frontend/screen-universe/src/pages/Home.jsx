import React, { useState, useEffect } from 'react';
import DesktopHome from './DesktopHome';
import MobileHome from './MobileHome';

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Funkcja nasłuchująca zmiany szerokości okna
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Jeśli ekran jest mały -> ładujemy wersję mobilną. Jeśli duży -> Twoją oryginalną.
  return isMobile ? <MobileHome /> : <DesktopHome />;
};

export default Home;    