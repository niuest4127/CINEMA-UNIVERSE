import React, { useEffect, useState } from "react";
import audioIcon from "/audioIcon/icons8-audio-wave-gradient-96.png"
import lightIcon from "/lightIcon/icons8-light-gradient-96.png"
import engineIcon from "/engineIcon/icons8-processor-gradient-96.png"
import movieIcon from "/movieicon/icons8-video-gradient-96.png"
import userIcon from "/usericon/icons8-user-default-gradient-96.png"
import starIcon from "/staricon/icons8-star-gradient-96.png"
import Footer from "../components/Footer";
import './MobileHome.css';

const MobileHome = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8080/api/movies')
      .then((res) => res.json())
      .then((data) => {
        const sortedMovies = data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        setMovies(sortedMovies.slice(0, 4));
      })
      .catch((err) => console.error("Błąd pobierania filmów:", err));
  }, []);

  return (
    <div className="mobile-home-container">
      
      {/* SEKCJA 1 */}
      <section className="mobile-section hero-section">
        <h6>Welcome to the</h6>
        <h1>SCR<span className="shadow">EE</span>N UNIVERSE</h1>
        <p>Where every scene is a masterpiece, and every moment is an unforgettable spectacle.</p>
        <button className="glassBtn">WHAT IS SCREEN UNIVERSE</button>
      </section>

      {/* SEKCJA 2 */}
      <section className="mobile-section features-section">
        <h5>LIGHTS, SPEAKERS, ENGINE</h5>
        <h2>EMBRACE AN UNFORGETTABLE JOURNEY</h2>
        <div className="features-grid">
          <div className="feature-item">
            <img src={lightIcon} alt="Light" />
            <p>Cutting-edge display technology delivering exceptional brightness.</p>
          </div>
          <div className="feature-item">
            <img src={audioIcon} alt="Audio" />
            <p>Advanced audio systems engineered for precise, high-fidelity sound.</p>
          </div>
          <div className="feature-item">
            <img src={engineIcon} alt="Engine" />
            <p>A high-performance system integrating image and sound.</p>
          </div>
        </div>
      </section>

{/* SEKCJA 5 - PREMIERY */}
      <section className="mobile-section premieres-section">
        
        {/* Dynamiczne, rozmyte tło - renderujemy tylko, gdy filmy są pobrane */}
        {movies.length > 0 && (
          <div 
            className="blurred-poster-bg"
            style={{ backgroundImage: `url(${movies[selectedMovieIndex].posterUrl})` }}
          />
        )}

        {/* Zawartość na wierzchu (z-index podbity w CSS) */}
        <div className="premieres-content">
          <h2>THE HO<span className="shadow">TT</span>EST PREMIERES</h2>
          
          <div className="mobile-movie-buttons">
            {movies.map((movie, index) => (
              <button 
                key={movie.id} 
                className={`premiereBtn ${selectedMovieIndex === index ? "active-btn" : ""}`}
                onClick={() => setSelectedMovieIndex(index)}
              >
                {movie.title}
              </button>
            ))}
          </div>

          {movies.length > 0 && (
            <div className="mobile-movie-card">
              {/* Plakat celowo wyciągnięty trochę do góry w CSS */}
              <img src={movies[selectedMovieIndex].posterUrl} alt="Poster" className="mobile-poster-small" />
              
              <div className="mobile-movie-info">
                <h3 style={{color: 'gold'}}>{movies[selectedMovieIndex].title}</h3>
                
                {/* Krótkie metadane obok siebie */}
                <p className="movie-meta">
                  {movies[selectedMovieIndex].durationMin} min | {movies[selectedMovieIndex].genres} | {movies[selectedMovieIndex].minimumAge}+
                </p>
                
                <p className="movie-desc-small">{movies[selectedMovieIndex].shortDescription}</p>
                
                {/* Kontener na reżysera i obsadę */}
                <div className="movie-crew">
                  <p><strong>Director:</strong> {movies[selectedMovieIndex].director}</p>
                  <p><strong>Cast:</strong> {movies[selectedMovieIndex].mainCast}</p>
                  <p><strong>Release:</strong> {movies[selectedMovieIndex].releaseDate}</p>
                </div>

                <button className="glassBtn small-btn">BUY TICKET</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEKCJA 6 - STATYSTYKI */}
      <section className="mobile-section stats-section">
        <h2>Trusted by movie lovers worldwide</h2>
        <div className="mobile-stats-grid">
          <div className="stat-item">
            <img src={starIcon} alt="Star" />
            <h2>4.9/5</h2>
            <p>Google Reviews reflecting our commitment to quality.</p>
          </div>
          <div className="stat-item">
            <img src={userIcon} alt="User" />
            <h2>12,000+</h2>
            <p>Monthly visitors choosing our premium cinema.</p>
          </div>
          <div className="stat-item">
            <img src={movieIcon} alt="Movie" />
            <h2>350+</h2>
            <p>Screenings every month of the latest blockbusters.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MobileHome;