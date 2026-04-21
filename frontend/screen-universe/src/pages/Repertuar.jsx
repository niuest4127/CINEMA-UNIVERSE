import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      {/* 1. SZKIELET: Świeci się, dopóki isLoaded jest false */}
      {!isLoaded && (
        <div 
          className="skeleton-poster animate-pulse" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0 }}
        ></div>
      )}
      
      {/* 2. PRAWDZIWY OBRAZEK: Ładuje się w tle, pokazuje się z ładnym przejściem gdy jest gotowy */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)} // Magia: Odpala się, gdy pobieranie pliku się zakończy!
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
  const MOCK_TODAY = new Date('2026-04-01T10:00:00');
  const navigate = useNavigate();

  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    MOCK_TODAY.toISOString().split('T')[0]
  );

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

  // 🔥 DATY
  const getNext7Days = () => {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(MOCK_TODAY);
      nextDate.setDate(MOCK_TODAY.getDate() + i);

      days.push({
        fullDate: nextDate.toISOString().split('T')[0],
        displayDate: nextDate.toLocaleDateString('pl-PL', {
          day: '2-digit',
          month: '2-digit'
        }),
        dayName: nextDate.toLocaleDateString('pl-PL', {
          weekday: 'short'
        })
      });
    }

    return days;
  };

  const datesList = getNext7Days();

  // 🔥 FILTROWANIE
  const filteredScreenings = screenings.filter(screening => {
    const screeningDate = screening.startTime.split('T')[0];
    const isSameDate = screeningDate === selectedDate;

    const matchesSearch = screening.movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return isSameDate && matchesSearch;
  });

  // 🔥 GRUPOWANIE
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

      <h1 className="page-title">SHOWTIMES</h1>

      {/* 🔍 SEARCH */}
      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 📅 DATE PICKER */}
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

      {/* 🎬 LISTA */}
      <div className="movie-repertoire-list">

        {loading ? (
          // 🔥 SKELETONY
          Array.from({ length: 4 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        ) : movieList.length === 0 ? (
          <h3 className="no-screenings">
            No screenings found for this day.
          </h3>
        ) : (
          movieList.map(({ movie, times }) => (
            <div key={movie.id} className="repertoire-card">

              {/* POSTER */}
              <div className="poster-side">
                <LazyPoster
                  src={movie.posterUrl}
                  alt={movie.title}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              </div>

              {/* INFO */}
              <div className="info-side">
                <h2 onClick={() => navigate(`/movie/${movie.id}`)}>
                  {movie.title}
                </h2>

                <p className="movie-short-desc">
                  {movie.shortDescription}
                </p>

                <div className="movie-meta-info">
                  <span><strong>Cast:</strong> {movie.mainCast}</span>
                  <span><strong>Duration:</strong> {movie.durationMin} min</span>
                  <span><strong>Age:</strong> {movie.minimumAge}+</span>
                </div>

                <hr className="divider" />

                {/* GODZINY */}
                <div className="times-container">
                  {times.map(screening => (
                    <button
                      key={screening.id}
                      onClick={() => navigate(`/booking/${screening.id}`)}
                      className="time-tile"
                    >
                      <div className="time-text">
                        {new Date(screening.startTime).toLocaleTimeString(
                          'en-US',
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