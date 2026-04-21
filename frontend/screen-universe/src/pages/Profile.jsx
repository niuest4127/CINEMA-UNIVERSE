import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_URL = 'http://localhost:8080';

const Profile = () => {
  // POBIERAMY LOGOUT Z KONTEKSTU
  const { user, login, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('active');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', phoneNumber: '', address: '', dateOfBirth: ''
  });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const MOCK_TODAY = new Date('2026-04-01T11:50:00');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/logowanie');
      return;
    }
    if (user) {
      fetchTickets();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '', lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '', address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/my`, {
        headers: { Authorization: user.token }
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      setTickets(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleDownloadPdf = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${ticketId}/pdf`, {
        method: 'GET',
        headers: { 'Authorization': user.token }
      });
      if (!res.ok) throw new Error("Wystąpił błąd podczas pobierania biletu.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) { alert(err.message); }
  };

  const handleReturnTicket = async (ticketId) => {
    if (!window.confirm("Cancel ticket?")) return;
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}/return`, {
        method: 'PUT',
        headers: { Authorization: user.token }
      });
      if (!res.ok) throw new Error("Failed to cancel");
      alert("Cancelled");
      fetchTickets();
    } catch (err) { alert(err.message); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: user.token },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedUser = await res.json();
      login({ ...updatedUser, token: user.token });
      setMessage({ text: 'Profile updated!', type: 'success' });
    } catch (err) { setMessage({ text: err.message, type: 'error' }); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: user.token },
        body: JSON.stringify(passwords)
      });
      if (!res.ok) throw new Error("Password change failed");
      setMessage({ text: 'Password updated!', type: 'success' });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) { setMessage({ text: err.message, type: 'error' }); }
  };

  // --- NOWA FUNKCJA WYLOGOWANIA ---
  const handleLogout = () => {
    logout();
    navigate('/'); // Po wylogowaniu wyrzucamy od razu na stronę główną
  };

  if (authLoading) return <div>Synchronizing session...</div>;
  
  // 🔥 KLUCZOWY FIX: Jeśli user to null, przestajemy cokolwiek renderować (zapobiega crashom!)
  if (!user) return null; 

  if (ticketsLoading) return <h2>Loading profile...</h2>;

  const activeTickets = tickets.filter(t => t.status === 'AKTYWNY' && new Date(t.screening.startTime) > MOCK_TODAY);
  const historyTickets = tickets.filter(t => t.status === 'ANULOWANY' || new Date(t.screening.startTime) <= MOCK_TODAY);

  return (
<div className="profile-container">
      <div className="profile-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>{user.firstName || 'Cinema'} {user.lastName || 'Fan'}</h2>
          <p>{user.email}</p>
        </div>
        
        <ul className="sidebar-menu">
          <li className={activeTab === 'active' ? 'active' : ''} onClick={() => {setActiveTab('active'); setMessage({text: ''})}}>Active Tickets</li>
          <li className={activeTab === 'history' ? 'active' : ''} onClick={() => {setActiveTab('history'); setMessage({text: ''})}}>Ticket History</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => {setActiveTab('settings'); setMessage({text: ''})}}>Account Settings</li>
          
          {/* NOWY PRZYCISK WYLOGOWANIA */}
          <li onClick={handleLogout} style={{ color: '#ff4d4d', marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
            Logout
          </li>
        </ul>
      </div>

      {/* PRAWA STRONA: ZAWARTOŚĆ ZAKŁADKI */}
      <div className="profile-content glass-panel">
        
        {/* ZAKŁADKA 1: AKTYWNE BILETY */}
        {activeTab === 'active' && (
          <div className="tab-section">
            <h2 className="tab-title">Your Upcoming Movies</h2>
            {activeTickets.length === 0 ? (
              <p className="empty-state">You have no active tickets. Time to book a movie!</p>
            ) : (
              <div className="tickets-list">
                {activeTickets.map(ticket => (
                  <div key={ticket.id} className="ticket-card">
                    <img src={ticket.screening.movie.posterUrl} alt="Poster" className="ticket-poster" />
                    <div className="ticket-info">
                      <h3>{ticket.screening.movie.title}</h3>
                      <p className="ticket-date">
                        {new Date(ticket.screening.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(ticket.screening.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                      <p>Room: <strong>{ticket.screening.room.name}</strong></p>
                      <p>Seat: <strong className="ticket-seat">{ticket.seatNumber}</strong></p>
                    </div>
                    <div className="ticket-actions">
                      {/* Sprawdzamy, czy czas "zamrożony" jest późniejszy niż czas seansu minus 30 minut */}
                      {MOCK_TODAY > new Date(new Date(ticket.screening.startTime).getTime() - 30 * 60000) ? (
                        <span className="non-refundable-text">
                          Non-refundable (starts soon)
                        </span>
                      ) : (
                        <>
                        
                        <button className="cancel-ticket-btn" onClick={() => handleReturnTicket(ticket.id)}>
                          Cancel Ticket
                        </button>
                        </>
                      )}

                      <button className="download-btn cancel-ticket-btn" onClick={() => handleDownloadPdf(ticket.id)}>
                          Download PDF
                      </button>


                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ZAKŁADKA 2: HISTORIA */}
        {activeTab === 'history' && (
          <div className="tab-section">
            <h2 className="tab-title">Your Ticket History</h2>
            {historyTickets.length === 0 ? (
              <p className="empty-state">Your history is empty.</p>
            ) : (
              <div className="tickets-list">
                {historyTickets.map(ticket => (
                  <div key={ticket.id} className={`ticket-card ${ticket.status === 'ANULOWANY' ? 'cancelled-ticket' : 'past-ticket'}`}>
                    <img src={ticket.screening.movie.posterUrl} alt="Poster" className="ticket-poster" />
                    <div className="ticket-info">
                      <h3>{ticket.screening.movie.title}</h3>
                      <p className="ticket-date">
                        {new Date(ticket.screening.startTime).toLocaleDateString('en-US')}
                      </p>
                      <span className={`status-badge ${ticket.status === 'ANULOWANY' ? 'red-badge' : 'gray-badge'}`}>
                        {ticket.status === 'ANULOWANY' ? 'CANCELLED' : 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ZAKŁADKA 3: USTAWIENIA KONTA */}
        {activeTab === 'settings' && (
          <div className="tab-section">
            <h2 className="tab-title">Account Settings</h2>
            
            {message.text && (
              <div className={`profile-message ${message.type}`}>{message.text}</div>
            )}

            <div className="settings-grid">
              
              {/* FORMULARZ DANYCH */}
              <form className="settings-form" onSubmit={handleProfileUpdate}>
                <h3>Personal Information</h3>
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Address</label>
                  <input type="text" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input type="date" value={profileData.dateOfBirth} onChange={e => setProfileData({...profileData, dateOfBirth: e.target.value})} />
                </div>
                <button type="submit" className="save-btn">SAVE CHANGES</button>
              </form>

              {/* FORMULARZ HASŁA */}
              <form className="settings-form password-form" onSubmit={handlePasswordChange}>
                <h3>Change Password</h3>
                <div className="input-group">
                  <label>Current Password</label>
                  <input type="password" required value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                </div>
                <button type="submit" className="save-btn danger-btn">UPDATE PASSWORD</button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;