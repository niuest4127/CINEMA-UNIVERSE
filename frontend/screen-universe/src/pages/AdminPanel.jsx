import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import GlobalCinemaLoader from '../components/GlobalCinemaLoader';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null); 
  
  const [activeTab, setActiveTab] = useState('movies'); 
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [managingUser, setManagingUser] = useState(null); 
  const [userTickets, setUserTickets] = useState([]);     
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  // --- STANY DLA ZAKŁADEK ---
  const [moviesList, setMoviesList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [screeningsList, setScreeningsList] = useState([]); // <--- NOWY STAN DLA TABELI SEANSÓW

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [movieData, setMovieData] = useState({
    title: '', shortDescription: '', fullDescription: '', durationMin: '', 
    minimumAge: '', releaseDate: '', languageVersion: 'Napisy PL', 
    director: '', mainCast: '', genres: '', posterUrl: ''
  });

  const [screeningData, setScreeningData] = useState({
    movieId: '', roomId: '', startTime: '', price: ''
  });

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("UWAGA! Ta operacja bezpowrotnie usunie użytkownika oraz CAŁĄ historię jego biletów. Kontynuować?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': user.token }
      });
      if (!res.ok) throw new Error("Wystąpił błąd podczas usuwania użytkownika.");
      setMessage({ text: 'Użytkownik został usunięty z systemu!', type: 'success' });
      fetchAuxiliaryData(); 
    } catch (err) { setMessage({ text: err.message, type: 'error' }); }
  };

  const handleManageTickets = async (selectedUser) => {
    setManagingUser(selectedUser);
    setIsTicketModalOpen(true);
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/user/${selectedUser.id}`, {
        headers: { 'Authorization': user.token }
      });
      if (!res.ok) throw new Error("Błąd pobierania biletów");
      setUserTickets(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAdminCancelTicket = async (ticketId) => {
    if (!window.confirm("Na pewno chcesz anulować ten bilet?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${ticketId}/return`, {
        method: 'PUT',
        headers: { 'Authorization': user.token }
      });
      if (!res.ok) throw new Error("Nie udało się zwrócić biletu.");
      alert("Bilet został anulowany!");
      handleManageTickets(managingUser); 
    } catch (err) { alert(err.message); }
  };

  // --- OCHRONA I POBIERANIE DANYCH ---
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        alert("Odmowa dostępu."); navigate('/');
      } else { fetchAuxiliaryData(); }
    }
  }, [user, authLoading, navigate]);

  const fetchAuxiliaryData = async () => {
    try {
      // 1. Pobieramy również seanse z backendu do nowej tabeli
      const [moviesRes, roomsRes, usersRes, screeningsRes] = await Promise.all([
        fetch('http://localhost:8080/api/movies'),
        fetch('http://localhost:8080/api/rooms'), 
        fetch('http://localhost:8080/api/users'),
        fetch('http://localhost:8080/api/screenings')
      ]);
      setMoviesList(await moviesRes.json());
      setRoomsList(await roomsRes.json());
      setUsersList(await usersRes.json());
      
      // Sortujemy seanse po dacie, by najnowsze/nadchodzące były na górze
      const fetchedScreenings = await screeningsRes.json();
      const sortedScreenings = fetchedScreenings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setScreeningsList(sortedScreenings);

    } catch (err) { console.error("Błąd pobierania danych:", err); }
  };

  const handlePosterUploaded = (url) => setMovieData({ ...movieData, posterUrl: url });

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    if (!movieData.posterUrl) return setMessage({ text: 'Musisz wgrać plakat!', type: 'error' });
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8080/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': user.token },
        body: JSON.stringify(movieData)
      });
      if (!res.ok) throw new Error('Błąd zapisu filmu.');
      setMessage({ text: 'Film dodany!', type: 'success' });
      setMovieData({ title: '', shortDescription: '', fullDescription: '', durationMin: '', minimumAge: '', releaseDate: '', languageVersion: 'Napisy PL', director: '', mainCast: '', genres: '', posterUrl: '' });
      fetchAuxiliaryData(); 
    } catch (err) { setMessage({ text: err.message, type: 'error' }); } 
    finally { setIsSubmitting(false); }
  };

  const handleScreeningSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        movie: { id: screeningData.movieId }, room: { id: screeningData.roomId },
        startTime: screeningData.startTime, price: parseFloat(screeningData.price)
      };

      const res = await fetch('http://localhost:8080/api/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': user.token },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Błąd zapisu seansu.');
      setMessage({ text: 'Seans dodany pomyślnie!', type: 'success' });
      
      fetchAuxiliaryData(); // ODŚWIEŻENIE BAZY W TLE ŻEBY TABELA NA DOLE ZARAZ GO WYŚWIETLIŁA
    } catch (err) { setMessage({ text: err.message, type: 'error' }); } 
    finally { setIsSubmitting(false); }
  };

  // --- NOWA FUNKCJA DO USUWANIA SEANSÓW ---
  const handleDeleteScreening = async (screeningId) => {
    const confirmDelete = window.confirm("UWAGA! Usunięcie tego seansu bezpowrotnie usunie również WSZYSTKIE bilety użytkowników do niego przypisane. Jesteś absolutnie pewien?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:8080/api/screenings/${screeningId}`, {
        method: 'DELETE',
        headers: { 'Authorization': user.token }
      });

      if (!res.ok) throw new Error("Nie udało się usunąć seansu i biletów.");

      setMessage({ text: 'Seans wyczyszczony z bazy w pełni!', type: 'success' });
      fetchAuxiliaryData(); // Odświeżamy tabelę na dole ekranu
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  // PAGINACJA USERÓW
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; 
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const filteredUsers = usersList.filter(u => {
    const searchLower = userSearchQuery.toLowerCase();
    const emailMatch = u.email.toLowerCase().includes(searchLower);
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return emailMatch || fullName.includes(searchLower);
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  if (authLoading) return <GlobalCinemaLoader />;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>ADMIN PANEL</h1>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => {setActiveTab('movies'); setMessage({text: '', type: ''});}}>Dodaj Film</button>
        <button className={activeTab === 'screenings' ? 'active' : ''} onClick={() => {setActiveTab('screenings'); setMessage({text: '', type: ''});}}>Zarządzaj Seansami</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => {setActiveTab('users'); setMessage({text: '', type: ''});}}>Użytkownicy</button>
      </div>

      <div className="admin-content glass-panel">
        {message.text && <div className={`admin-message ${message.type}`}>{message.text}</div>}

        {/* ZAKŁADKA 1: FILMY */}
        {activeTab === 'movies' && (
          <form className="admin-form" onSubmit={handleMovieSubmit}>
            <div className="form-grid">
              <div className="input-column">
              <div className="input-group">
                <label>Tytuł filmu</label>
                <input required type="text" value={movieData.title} onChange={e => setMovieData({...movieData, title: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Gatunek</label>
                  <input required type="text" value={movieData.genres} onChange={e => setMovieData({...movieData, genres: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Reżyser</label>
                  <input required type="text" value={movieData.director} onChange={e => setMovieData({...movieData, director: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label>Obsada</label>
                <input required type="text" value={movieData.mainCast} onChange={e => setMovieData({...movieData, mainCast: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="input-group"><label>Czas trwania (min)</label><input required type="number" value={movieData.durationMin} onChange={e => setMovieData({...movieData, durationMin: e.target.value})} /></div>
                <div className="input-group"><label>Wiek min.</label><input required type="number" value={movieData.minimumAge} onChange={e => setMovieData({...movieData, minimumAge: e.target.value})} /></div>
              </div>

              <div className="form-row">
                <div className="input-group"><label>Data premiery</label><input required type="date" value={movieData.releaseDate} onChange={e => setMovieData({...movieData, releaseDate: e.target.value})} /></div>
                <div className="input-group">
                  <label>Wersja</label>
                  <select value={movieData.languageVersion} onChange={e => setMovieData({...movieData, languageVersion: e.target.value})}>
                    <option value="Napisy PL">Napisy PL</option><option value="Dubbing PL">Dubbing PL</option><option value="Lektor PL">Lektor PL</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Krótki opis</label>
                <textarea required rows="2" value={movieData.shortDescription} onChange={e => setMovieData({...movieData, shortDescription: e.target.value})}></textarea>
              </div>

              <div className="input-group">
                <label>Pełny opis</label>
                <textarea required rows="5" value={movieData.fullDescription} onChange={e => setMovieData({...movieData, fullDescription: e.target.value})}></textarea>
              </div>
            </div>
              <div className="upload-column">
                <h3>Plakat filmu</h3>
                <ImageUpload onImageUploaded={handlePosterUploaded} />
                <div className={`upload-status-box ${movieData.posterUrl ? 'success-box' : ''}`}>
                  {movieData.posterUrl ? "Plakat wgrany!" : "Czekam na plakat..."}
                </div>
              </div>
            </div>
            <button type="submit" className="cyber-btn admin-submit" disabled={isSubmitting}>
              {isSubmitting ? "ZAPISYWANIE..." : "DODAJ FILM"}
            </button>
          </form>
        )}

        {/* ZAKŁADKA 2: SEANSE (DODAWANIE + TABELA USUWANIA) */}
        {activeTab === 'screenings' && (
          <div>
            <form className="admin-form" onSubmit={handleScreeningSubmit}>
               <div className="form-grid" style={{flexDirection: 'column', gap: '20px'}}>
                  <div className="input-group">
                    <label>Wybierz Film</label>
                    <select required value={screeningData.movieId} onChange={e => setScreeningData({...screeningData, movieId: e.target.value})}>
                      <option value="" disabled>-- Wybierz film z bazy --</option>
                      {moviesList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Wybierz Salę</label>
                    <select required value={screeningData.roomId} onChange={e => setScreeningData({...screeningData, roomId: e.target.value})}>
                      <option value="" disabled>-- Wybierz salę kinową --</option>
                      {roomsList.map(r => <option key={r.id} value={r.id}>{r.name} (Miejsc: {r.totalSeats})</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Data i Godzina</label>
                      <input required type="datetime-local" value={screeningData.startTime} onChange={e => setScreeningData({...screeningData, startTime: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>Cena Biletu (PLN)</label>
                      <input required type="number" step="0.01" value={screeningData.price} onChange={e => setScreeningData({...screeningData, price: e.target.value})} />
                    </div>
                  </div>
               </div>
               <button type="submit" className="cyber-btn admin-submit" disabled={isSubmitting}>
                {isSubmitting ? "ZAPISYWANIE..." : "ZAPLANUJ NOWY SEANS"}
              </button>
            </form>

            <hr style={{ borderColor: '#333', margin: '40px 0' }} />
            
            {/* --- TABELA ZE WSZYSTKIMI SEANSAMI --- */}
            <h2 style={{ marginBottom: '20px', color: '#ff3333' }}>📋 Lista zaplanowanych seansów</h2>
            <div style={{ overflowX: 'auto', background: '#111', borderRadius: '8px' }}>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plakat</th>
                    <th>Film</th>
                    <th>Sala</th>
                    <th>Data i Godzina</th>
                    <th>Cena</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {screeningsList.length === 0 ? (
                    <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Brak zaplanowanych seansów</td></tr>
                  ) : (
                    screeningsList.map(s => {
                      const start = new Date(s.startTime);
                      return (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>
                            <img src={s.movie?.posterUrl} alt="plakat" style={{ width: '40px', borderRadius: '4px' }} />
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{s.movie?.title}</td>
                          <td>{s.room?.name}</td>
                          <td style={{ color: '#4dff4d' }}>
                            {start.toLocaleDateString()} o {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>{s.price?.toFixed(2)} PLN</td>
                          <td>
                            <button className="action-btn delete" onClick={() => handleDeleteScreening(s.id)}>
                              Usuń Seans
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 3: UŻYTKOWNICY */}
        {activeTab === 'users' && (
          <div className="admin-users-section">
            <div className="search-bar-wrapper" style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Szukaj po e-mailu, imieniu lub nazwisku..."
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  setCurrentPage(1); 
                }}
                className="search-input"
                style={{ 
                  width: '100%', padding: '15px', borderRadius: '8px', 
                  background: 'rgba(255, 255, 255, 0.05)', color: 'white', 
                  border: '1px solid #444', fontSize: '16px'
                }}
              />
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th><th>E-mail</th><th>Rola</th><th>Imię i Nazwisko</th><th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="action-btn" style={{ background: '#333', color: 'gold' }} onClick={() => handleManageTickets(u)}>
                          Bilety
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeleteUser(u.id)}>
                          Usuń Konto
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-controls">
              <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>Poprzednia</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={currentPage === i + 1 ? 'active-page' : ''} onClick={() => paginate(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => paginate(currentPage + 1)}>Następna</button>
            </div>
          </div>
        )}

      </div>
      
      {/* MODAL BILETÓW DLA UŻYTKOWNIKÓW */}
      {isTicketModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsTicketModalOpen(false)}>
          <div className="admin-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Bilety użytkownika: {managingUser?.email}</h2>
              <button className="close-modal-btn" onClick={() => setIsTicketModalOpen(false)}>✖</button>
            </div>
            
            <div className="admin-modal-body">
              {userTickets.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center' }}>Ten użytkownik nie posiada jeszcze żadnych biletów.</p>
              ) : (
                <ul className="admin-ticket-list">
                  {userTickets.map(ticket => (
                    <li key={ticket.id} className={`admin-ticket-item ${ticket.status === 'ANULOWANY' ? 'cancelled' : ''}`}>
                      <div className="ticket-info">
                        <strong>{ticket.screening?.movie?.title || 'Film usunięty z bazy'}</strong> 
                        <br/>
                        <span style={{ fontSize: '12px', color: '#aaa' }}>
                          Sala: {ticket.screening?.room?.name} | Miejsce: {ticket.seatNumber} | Status: <span style={{ color: ticket.status === 'AKTYWNY' ? '#4dff4d' : '#ff4d4d' }}>{ticket.status}</span>
                        </span>
                      </div>
                      
                      {ticket.status === 'AKTYWNY' && (
                        <button className="action-btn delete" onClick={() => handleAdminCancelTicket(ticket.id)}>
                          Anuluj Bilet
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;