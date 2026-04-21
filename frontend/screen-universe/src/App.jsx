import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// Importujemy nasz Layout i Podstrony
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Repertuar from './pages/Repertuar';
import About from './pages/About';
import Auth from './pages/Auth';
import AdminPanel  from './pages/AdminPanel';
import Profile from './pages/Profile';
import MovieDetails from './pages/MovieDetails'; // Dawne ScreeningDetails
import SeatSelection from './pages/SeatSelection'; // Nowy komponent do biletów

function App() {
  return (
    // Owijamy wszystko AuthProviderem
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Twoje dotychczasowe ścieżki */}
            <Route index element={<Home />} />
            <Route path="repertuar" element={<Repertuar />} />
            <Route path="movie/:id" element={<MovieDetails />} />
            <Route path="booking/:screeningId" element={<SeatSelection />} />
            <Route path="o-nas" element={<About />} />
            <Route path="logowanie" element={<Auth />} />
            <Route path="profil" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;