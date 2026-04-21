import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Dodany import
import './SeatSelection.css';

const SeatSelection = () => {
  const { screeningId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { t, i18n } = useTranslation(); // 2. Wywołanie funkcji

  const [screening, setScreening] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); 
  const [occupiedSeats, setOccupiedSeats] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- NOWE STANY DO PŁATNOŚCI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success'

  // Dynamiczny język do wyświetlania dat
  const currentLocale = i18n.language === 'pl' ? 'pl-PL' : 'en-US';

  useEffect(() => {
    // KROK 1: Sprawdzamy, czy wracamy z logowania i czy mieliśmy wybrane miejsca
    const savedSeats = sessionStorage.getItem(`savedSeats_${screeningId}`);
    if (savedSeats) {
      setSelectedSeats(JSON.parse(savedSeats));
      sessionStorage.removeItem(`savedSeats_${screeningId}`); // Czyścimy pamięć
      setIsModalOpen(true); // Od razu otwieramy okienko płatności!
    }

    // KROK 2: Pobieramy dane z bazy
    Promise.all([
      fetch(`http://localhost:8080/api/screenings/${screeningId}`).then(res => res.json()),
      fetch(`http://localhost:8080/api/tickets/screening/${screeningId}/taken-seats`).then(res => res.json())
    ])
    .then(([screeningData, takenSeatsData]) => {
      setScreening(screeningData);
      setOccupiedSeats(takenSeatsData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Błąd pobierania danych:", err);
      setLoading(false);
    });
  }, [screeningId]);

  const getSeatLabel = (seatNumber) => {
    const rowIndex = Math.floor((seatNumber - 1) / 10);
    const colIndex = ((seatNumber - 1) % 10) + 1;
    const rowLetter = String.fromCharCode(65 + rowIndex);
    return `${rowLetter}${colIndex}`;
  };

  const handleSeatClick = (seatLabel) => {
    if (occupiedSeats.includes(seatLabel)) return;

    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatLabel));
    } else {
      if (selectedSeats.length < 10) {
        setSelectedSeats([...selectedSeats, seatLabel]);
      } else {
        alert(t('seatSelection.maxSeatsAlert'));
      }
    }
  };

  // --- KROK 1: Kliknięcie BUY TICKETS na dole ekranu ---
  const handleOpenSummary = () => {
    if (!user) {
      // Zapisujemy fotele do pamięci przeglądarki przed wylotem do logowania
      sessionStorage.setItem(`savedSeats_${screeningId}`, JSON.stringify(selectedSeats));
      navigate('/logowanie', { state: { from: location.pathname } });
      return;
    }
    // Jeśli zalogowany - otwieramy ładne podsumowanie
    setIsModalOpen(true);
  };

  // --- KROK 2: Faktyczna transakcja w okienku ---
  const confirmPayment = async () => {
    setPaymentStatus('processing');

    try {
      // Symulacja połączenia z bankiem (dla picu, 2.5 sekundy)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Faktyczne uderzenie do Javy
      const purchasePromises = selectedSeats.map(seatLabel => {
        return fetch('http://localhost:8080/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': user.token
          },
          body: JSON.stringify({
            user: { id: user.id },
            screening: { id: screening.id },
            seatNumber: seatLabel
          })
        }).then(res => {
          if (!res.ok) throw new Error(`${seatLabel} - ${t('seatSelection.seatTakenAlert')}`);
          return res.json();
        });
      });

      await Promise.all(purchasePromises);
      
      // Sukces!
      setPaymentStatus('success');
      
      // Po 3 sekundach zamykamy okienko i odświeżamy salę
      setTimeout(() => {
        setIsModalOpen(false);
        setPaymentStatus('idle');
        setSelectedSeats([]);
        fetch(`http://localhost:8080/api/tickets/screening/${screeningId}/taken-seats`)
          .then(res => res.json())
          .then(data => setOccupiedSeats(data));
      }, 3000);

    } catch (err) {
      alert(err.message);
      setPaymentStatus('idle');
      setIsModalOpen(false);
      // Odświeżamy, bo ktoś nam zwinął miejsce sprzed nosa
      const newTakenSeats = await fetch(`http://localhost:8080/api/tickets/screening/${screeningId}/taken-seats`).then(res => res.json());
      setOccupiedSeats(newTakenSeats);
    }
  };

  if (loading) return <h2 className="loading-msg">{t('seatSelection.loadingRoom')}</h2>;
  if (!screening) return <h2 className="loading-msg">{t('seatSelection.notFound')}</h2>;

  const totalSeats = screening.room.totalSeats;
  const seatsArray = Array.from({ length: totalSeats }, (_, i) => i + 1);
  const totalPrice = (selectedSeats.length * (screening.price || 25)).toFixed(2);

  return (
    <div className="seat-selection-container">
      
      <div className="seat-header">
        <button onClick={() => navigate(-1)} className="back-btn">{t('seatSelection.backToMovie')}</button>
        <div className="screening-summary">
          <h1 className="movie-title-small">{screening.movie.title}</h1>
          <p className="screening-meta">
            <span>{new Date(screening.startTime).toLocaleDateString(currentLocale, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span className="time-highlight">
              {new Date(screening.startTime).toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            <span>| {screening.room.name}</span>
          </p>
        </div>
      </div>

      <div className="room-layout">
        <div className="screen-container">
          <div className="screen"></div>
          <p className="screen-text">{t('seatSelection.screen')}</p>
        </div>

        <div className="seats-grid">
          {seatsArray.map((seatNumber) => {
            const seatLabel = getSeatLabel(seatNumber);
            const isOccupied = occupiedSeats.includes(seatLabel);
            const isSelected = selectedSeats.includes(seatLabel);
            const colIndex = ((seatNumber - 1) % 10) + 1;
            const gridColumnPosition = colIndex > 5 ? colIndex + 1 : colIndex;

            return (
              <button
                key={seatNumber}
                onClick={() => handleSeatClick(seatLabel)}
                disabled={isOccupied}
                className={`seat ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                style={{ gridColumn: gridColumnPosition }}
              >
                {seatLabel}
              </button>
            );
          })}
        </div>

        <div className="seat-legend">
          <div className="legend-item"><div className="seat available"></div> <span>{t('seatSelection.available')}</span></div>
          <div className="legend-item"><div className="seat selected"></div> <span>{t('seatSelection.selected')}</span></div>
          <div className="legend-item"><div className="seat occupied"></div> <span>{t('seatSelection.occupied')}</span></div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="booking-footer glass-panel">
          <div className="booking-info">
            <h3>{t('seatSelection.selectedSeatsMsg')} <span style={{ color: 'rgb(0, 201, 27)' }}>{selectedSeats.join(', ')}</span></h3>
            <p>{t('seatSelection.total')} <strong style={{ color: 'white', fontSize: '20px' }}>PLN {totalPrice}</strong></p>
          </div>
          <button className="glassBtn small-cyber" onClick={handleOpenSummary}>
            {t('seatSelection.buyTickets')}
          </button>
        </div>
      )}

      {/* --- OKIENKO PODSUMOWANIA (MODAL) --- */}
      {isModalOpen && (
        <div className="payment-overlay">
          <div className="payment-modal glass-panel">
            
            {paymentStatus === 'idle' && (
              <>
                <h2>{t('seatSelection.checkoutSummary')}</h2>
                <div className="summary-details">
                  <p><strong>{t('seatSelection.movie')}:</strong> {screening.movie.title}</p>
                  <p><strong>{t('seatSelection.date')}:</strong> {new Date(screening.startTime).toLocaleDateString(currentLocale)}</p>
                  <p><strong>{t('seatSelection.seats')}:</strong> {selectedSeats.join(', ')}</p>
                  <hr style={{ borderColor: '#333', margin: '15px 0' }}/>
                  <h3>{t('seatSelection.totalToPay')}: <span style={{ color: 'rgb(0, 201, 27)' }}>{totalPrice} PLN </span></h3>
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>{t('seatSelection.cancelTx')}</button>
                  <button className="pay-btn" onClick={confirmPayment}>{t('seatSelection.payNow')}</button>
                </div>
              </>
            )}

            {paymentStatus === 'processing' && (
              <div className="processing-state">
                <div className="spinner"></div>
                <h3>{t('seatSelection.processing')}</h3>
                <p>{t('seatSelection.doNotClose')}</p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="success-state">
                <div className="checkmark">✔</div>
                <h2 style={{ color: '#4dff4d' }}>{t('seatSelection.success')}</h2>
                <p>{t('seatSelection.emailSent')}</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default SeatSelection;