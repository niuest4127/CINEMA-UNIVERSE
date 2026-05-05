import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout() {
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  return (
    <div className="app-container">
      <Navbar />
      

      <main className="main-content">
        <Outlet /> 
      </main>

      {!isHomePage && <Footer />}
    </div>
  );
}

export default MainLayout;