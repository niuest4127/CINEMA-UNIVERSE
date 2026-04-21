import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Dodany import
import ImageWithSkeleton from "../components/ImageWithSkeleton"
import './MovieDetails.css'; 

const MovieDetails = () => {
  const { id } = useParams(); // To jest teraz ID FILMU!
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // 2. Wywołanie hooka (pobieramy też i18n do zmiany formatu daty)
  
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Określamy locale dla formatowania dat na podstawie wybranego języka
  const currentLocale = i18n.language === 'pl' ? 'pl-PL' : 'en-US';

  useEffect(() => {
    // Ponieważ potrzebujemy i danych filmu, i jego seansów, używamy Promise.all by pobrać je naraz
    Promise.all([
      fetch(`http://localhost:8080/api/movies/${id}`).then(res => res.json()),
      fetch(`http://localhost:8080/api/screenings/movie/${id}`).then(res => res.json())
    ])
    .then(([movieData, screeningsData]) => {
      setMovie(movieData);
      // Sortujemy seanse chronologicznie
      const sortedScreenings = screeningsData.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setShowtimes(sortedScreenings);
      setLoading(false);
    })
    .catch(err => {
      console.error("Błąd pobierania danych filmu:", err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <h2 className="loading-msg">{t('movieDetails.loadingData')}</h2>;
  if (!movie) return <h2 className="loading-msg">{t('movieDetails.notFound')}</h2>;

  return (
    <div className="screening-details-container">
      
      <button onClick={() => navigate(-1)} className="back-btn">
        {t('movieDetails.backBtn')}
      </button>

      <div className="details-content">
        
        <div className="details-poster-wrapper">
         {/* POSTER */}
              <div className="poster-side">
                <ImageWithSkeleton
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="details-poster" 
                />
              </div>
        </div>

        <div className="details-info-wrapper">
          <h1 className="movie-title">{movie.title}</h1>
          
          <p className="movie-meta-bottom">
            {movie.genres} • {movie.durationMin} min • {t('movieDetails.age')} {movie.minimumAge}+ • {movie.languageVersion}
          </p>
          
          <h3 className="synopsis-title">{t('movieDetails.shortDescTitle')}</h3>
          <p className="synopsis-text">
            {movie.shortDescription}
          </p>
          
          <h3 className="synopsis-title">{t('movieDetails.fullDescTitle')}</h3>
          <p className="synopsis-text">
            {movie.fullDescription}
          </p>

          <div className="crew-box">
            <p><strong>{t('movieDetails.director')}</strong> {movie.director}</p>
            <p><strong>{t('movieDetails.cast')}</strong> {movie.mainCast}</p>
          </div>

          {/* SEKCJA GODZIN */}
          <div className="other-showtimes-section">
            <h3 className="other-showtimes-title">{t('movieDetails.availableShowtimes')}</h3>
            <div className="screeningButtons">
                    <div className="showtimes-grid">
                    {showtimes.length > 0 ? (
                        showtimes.map(ot => (
                        <button 
                            key={ot.id}
                            onClick={() => navigate(`/booking/${ot.id}`)} // PRZEJŚCIE DO KUPNA BILETU
                            className="time-tile time2"
                        >
                            <div className="date-text">
                            {new Date(ot.startTime).toLocaleDateString(currentLocale, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>

                            <div className="time-text">
                            {new Date(ot.startTime).toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>

                            {ot.price && (
                            <div className="price-text">
                                PLN {ot.price.toFixed(2)}
                            </div>
                            )}

                            <div className="room-text">
                            {ot.room.name}
                            </div>
                        </button>
                        ))
                    ) : (
                        <p className="no-showtimes-msg">{t('movieDetails.noShowtimes')}</p>
                    )}
                    </div>
                    
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;