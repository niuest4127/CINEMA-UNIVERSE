import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import audioIcon from "/audioIcon/icons8-audio-wave-gradient-96.png"
import lightIcon from "/lightIcon/icons8-light-gradient-96.png"
import engineIcon from "/engineIcon/icons8-processor-gradient-96.png"
import movieIcon from "/movieicon/icons8-video-gradient-96.png"
import userIcon from "/usericon/icons8-user-default-gradient-96.png"
import starIcon from "/staricon/icons8-star-gradient-96.png"
import Footer from "../components/Footer";
import './MobileHome.css';

const MobileHome = () => {
  const { t } = useTranslation();
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
 
      <section className="mobile-section hero-section">

        <h6>{t('home.welcomeTo')}</h6>
  
        <h1>SCR<span className="shadow">EE</span>N UNIVERSE</h1>
        <p>{t('home.mobileSec1Subtitle')}</p>
        <button className="glassBtn">{t('home.whatIsBtn')}</button>
      </section>


      <section className="mobile-section features-section">
        <h5>{t('home.sec2Title')}</h5>
        <h2>{t('home.mobileSec2Heading')}</h2>
        <div className="features-grid">
          <div className="feature-item">
            <img src={lightIcon} alt="Light" />
            <p>{t('home.mobileFeature1')}</p>
          </div>
          <div className="feature-item">
            <img src={audioIcon} alt="Audio" />
            <p>{t('home.mobileFeature2')}</p>
          </div>
          <div className="feature-item">
            <img src={engineIcon} alt="Engine" />
            <p>{t('home.mobileFeature3')}</p>
          </div>
        </div>
      </section>


      <section className="mobile-section premieres-section">
        

        {movies.length > 0 && (
          <div 
            className="blurred-poster-bg"
            style={{ backgroundImage: `url(${movies[selectedMovieIndex].posterUrl})` }}
          />
        )}

        <div className="premieres-content">
          <h2>{t('home.mobileSec5Heading_part1')}<span className="shadow">{t('home.mobileSec5Heading_shadow')}</span>{t('home.mobileSec5Heading_part2')}</h2>
          
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
      
              <img src={movies[selectedMovieIndex].posterUrl} alt="Poster" className="mobile-poster-small" />
              
              <div className="mobile-movie-info">
                <h3 style={{color: 'gold'}}>{movies[selectedMovieIndex].title}</h3>
                
       
                <p className="movie-meta">
                  {movies[selectedMovieIndex].durationMin} min | {movies[selectedMovieIndex].genres} | {movies[selectedMovieIndex].minimumAge}+
                </p>
                
                <p className="movie-desc-small">{movies[selectedMovieIndex].shortDescription}</p>
                
      
                <div className="movie-crew">
                  <p><strong>{t('home.director')}</strong> {movies[selectedMovieIndex].director}</p>
                  <p><strong>{t('home.cast')}</strong> {movies[selectedMovieIndex].mainCast}</p>
                  <p><strong>{t('home.release')}</strong> {movies[selectedMovieIndex].releaseDate}</p>
                </div>

                <button className="glassBtn small-btn">{t('home.buyTicketBtnCaps')}</button>
              </div>
            </div>
          )}
        </div>
      </section>


      <section className="mobile-section stats-section">
        <h2>{t('home.statsTitle')}</h2>
        <div className="mobile-stats-grid">
          <div className="stat-item">
            <img src={starIcon} alt="Star" />
            <h2>4.9/5</h2>
            <p>{t('home.mobileStat1Desc')}</p>
          </div>
          <div className="stat-item">
            <img src={userIcon} alt="User" />
            <h2>12,000+</h2>
            <p>{t('home.mobileStat2Desc')}</p>
          </div>
          <div className="stat-item">
            <img src={movieIcon} alt="Movie" />
            <h2>350+</h2>
            <p>{t('home.mobileStat3Desc')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MobileHome;