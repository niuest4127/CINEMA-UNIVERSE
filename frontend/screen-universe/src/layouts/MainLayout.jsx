import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout() {
  const location = useLocation();
  // Sprawdzamy, czy obecny adres to strona główna ("/")
  const isHomePage = location.pathname === '/';
  return (
    <div className="app-container">
      <Navbar />
      
      {/* Tutaj będą się ładować Twoje podstrony (Home, Repertuar itd.) */}
      <main className="main-content">
        <Outlet /> 
      </main>
{/* 
  {/* Magia: Renderuj Footer TYLKO, jeśli NIE jesteśmy na stronie głównej! */}
      {!isHomePage && <Footer />}
    </div>
  );
}

export default MainLayout;