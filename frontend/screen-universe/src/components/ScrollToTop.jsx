import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Wyciągamy obecną ścieżkę (np. /profil, /film/1)
  const { pathname } = useLocation();

  useEffect(() => {
    // Za każdym razem gdy zmieni się adres URL, przesuń natychmiast na górę
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Ten komponent nic nie wyświetla, działa tylko "w tle"
};

export default ScrollToTop;