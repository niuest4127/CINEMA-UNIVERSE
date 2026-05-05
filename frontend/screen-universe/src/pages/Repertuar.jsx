import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import MovieCardSkeleton from '../components/MovieCardSkeleton';
import './Repertuar.css';

const API_URL = 'http://localhost:8080';

const LazyPoster = ({ src, alt, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="lazy-poster-wrapper" 
      onClick={onClick}
      style={{ cursor: 'pointer', position: 'relative', width: '100%', height: '100%' }}
    >
   
      {!isLoaded && (
        <div 
          className="skeleton-poster animate-pulse" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0 }}
        ></div>
      )}
      

      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)} 
        style={{ 
          opacity: isLoaded ? 1 : 0, 
          transition: 'opacity 0.5s ease-in-out', 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          borderRadius: '8px' 
        }}
      />
    </div>
  );
};

const Repertuar = () => {
  const MOCK_TODAY = new Date();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 

  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    MOCK_TODAY.toISOString().split('T')[0]
  );


  const currentLocale = i18n.language === 'pl' ? 'pl-PL' : 'en-US';

  // 🔥 FETCH + LOADING FIX
  useEffect(() => {
    fetch(`${API_URL}/api/screenings`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
        setScreenings(sorted);
      })
      .catch(err => console.error("Błąd pobierania:", err))
      .finally(() => setLoading(false));
  }, []);


  const getNext7Days = () => {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(MOCK_TODAY);
      nextDate.setDate(MOCK_TODAY.getDate() + i);

      days.push({
        fullDate: nextDate.toISOString().split('T')[0],
        displayDate: nextDate.toLocaleDateString(currentLocale, {
          day: '2-digit',
          month: '2-digit'
        }),
        dayName: nextDate.toLocaleDateString(currentLocale, {
          weekday: 'short'
        })
      });
    }

    return days;
  };

  const datesList = getNext7Days();


  const filteredScreenings = screenings.filter(screening => {
    const screeningDate = screening.startTime.split('T')[0];
    const isSameDate = screeningDate === selectedDate;

    const matchesSearch = screening.movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return isSameDate && matchesSearch;
  });

  const groupedByMovie = filteredScreenings.reduce((acc, screening) => {
    const movieId = screening.movie.id;

    if (!acc[movieId]) {
      acc[movieId] = {
        movie: screening.movie,
        times: []
      };
    }

    acc[movieId].times.push(screening);

   return acc;
  }, {});

  const movieList = Object.values(groupedByMovie);

  return (
    <div className="repertuar-container">


      <h1 className="page-title">{t('repertoire.title')}</h1>


      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder={t('repertoire.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="date-picker-wrapper">
        {datesList.map(day => (
          <button
            key={day.fullDate}
            onClick={() => setSelectedDate(day.fullDate)}
            className={`date-tile ${
              selectedDate === day.fullDate ? 'active' : ''
            }`}
          >
            <div className="day-name">{day.dayName.toUpperCase()}</div>
            <div className="day-date">{day.displayDate}</div>
          </button>
        ))}
      </div>


      <div className="movie-repertoire-list">

        {loading ? (
  
          Array.from({ length: 4 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        ) : movieList.length === 0 ? (
          <h3 className="no-screenings">
            {t('repertoire.noScreenings')}
          </h3>
        ) : (
          movieList.map(({ movie, times }) => (
            <div key={movie.id} className="repertoire-card">

              <div className="poster-side">
                <LazyPoster
                  src={movie.posterUrl}
                  alt={movie.title}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              </div>

    
              <div className="info-side">
                <h2 onClick={() => navigate(`/movie/${movie.id}`)}>
                  {movie.title}
                </h2>

                <p className="movie-short-desc">
                  {movie.shortDescription}
                </p>

                <div className="movie-meta-info">
                  <span><strong>{t('repertoire.cast')}</strong> {movie.mainCast}</span>
                  <span><strong>{t('repertoire.duration')}</strong> {movie.durationMin} min</span>
                  <span><strong>{t('repertoire.age')}</strong> {movie.minimumAge}+</span>
                </div>

                <hr className="divider" />

                <div className="times-container">
                  {times.map(screening => (
                    <button
                      key={screening.id}
                      onClick={() => navigate(`/booking/${screening.id}`)}
                      className="time-tile"
                    >
                      <div className="time-text">
                        {new Date(screening.startTime).toLocaleTimeString(
                          currentLocale,
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }
                        )}
                      </div>

                      {screening.price && (
                        <div className="price-text">
                          PLN {screening.price.toFixed(2)}
                        </div>
                      )}

                      <div className="room-text">
                        {screening.room.name} • {movie.languageVersion}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Repertuar;