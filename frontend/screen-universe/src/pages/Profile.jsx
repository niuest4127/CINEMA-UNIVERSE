import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Profile.css';

const API_URL = 'http://localhost:8080';

const Profile = () => {
  const { user, login, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState('active');
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // --- STANY DO STRONICOWANIA (Rozdzielone dla obu zakładek) ---
  const [activeTickets, setActiveTickets] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [activeTotalPages, setActiveTotalPages] = useState(0);

  const [historyTickets, setHistoryTickets] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', phoneNumber: '', address: '', dateOfBirth: ''
  });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const MOCK_TODAY = new Date('2026-04-01T11:50:00'); // Zostawiamy do wyliczania 30 minut na zwrot
  const currentLocale = i18n.language === 'pl' ? 'pl-PL' : 'en-US';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/logowanie');
      return;
    }
  }, [user, authLoading, navigate]);

  // Pobieranie danych po załadowaniu profilu i przy zmianie zakładki
  useEffect(() => {
    if (user) {
      if (activeTab === 'active') fetchActiveTickets(activePage);
      if (activeTab === 'history') fetchHistoryTickets(historyPage);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '', lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '', address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  }, [user]);

  // --- POPRAWIONE FUNKCJE POBIERANIA ---
  const fetchActiveTickets = async (page = 0) => {
    setTicketsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets/my/active?page=${page}&size=10`, {
        headers: { Authorization: user.token }
      });
      if (!res.ok) throw new Error(t('profile.fetchError'));
      const data = await res.json();
      setActiveTickets(data.content || []); 
      setActiveTotalPages(data.totalPages || 0);
      setActivePage(data.number || 0);
    } catch (err) { console.error(err); } 
    finally { setTicketsLoading(false); }
  };

  const fetchHistoryTickets = async (page = 0) => {
    setTicketsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets/my/history?page=${page}&size=10`, {
        headers: { Authorization: user.token }
      });
      if (!res.ok) throw new Error(t('profile.fetchError'));
      const data = await res.json();
      setHistoryTickets(data.content || []); 
      setHistoryTotalPages(data.totalPages || 0);
      setHistoryPage(data.number || 0);
    } catch (err) { console.error(err); } 
    finally { setTicketsLoading(false); }
  };

  const handleDownloadPdf = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${ticketId}/pdf`, {
        method: 'GET',
        headers: { 'Authorization': user.token }
      });
      if (!res.ok) throw new Error(t('profile.downloadError'));
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
    if (!window.confirm(t('profile.cancelConfirm'))) return;
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}/return`, {
        method: 'PUT',
        headers: { Authorization: user.token }
      });
      if (!res.ok) throw new Error(t('profile.cancelError'));
      alert(t('profile.cancelledMsg'));
      // Po anulowaniu, odświeżamy listę aktywnych żeby usunąć z niej bilet
      fetchActiveTickets(activePage); 
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
      if (!res.ok) throw new Error(t('profile.updateError'));
      const updatedUser = await res.json();
      login({ ...updatedUser, token: user.token });
      setMessage({ text: t('profile.profileUpdated'), type: 'success' });
    } catch (err) { setMessage({ text: err.message, type: 'error' }); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // (Pominięto zawartość by nie powielać - działała prawidłowo)
    try {
      const res = await fetch(`${API_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: user.token },
        body: JSON.stringify(passwords)
      });
      if (!res.ok) throw new Error(t('profile.passChangeError'));
      setMessage({ text: t('profile.passUpdated'), type: 'success' });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) { setMessage({ text: err.message, type: 'error' }); }
  };

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  if (authLoading) return <div>{t('profile.sync')}</div>;
  if (!user) return null; 

  // --- DYNAMICZNY KOMPONENT PAGINACJI ---
  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null; 
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
        <button 
          className="save-btn" 
          style={{ width: 'auto', padding: '10px 20px', opacity: currentPage === 0 ? 0.5 : 1 }}
          disabled={currentPage === 0} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('profile.prev')}
        </button>
        <span style={{ color: '#aaa', fontWeight: 'bold' }}>
          {t('profile.page')} {currentPage + 1} {t('profile.of')} {totalPages}
        </span>
        <button 
          className="save-btn" 
          style={{ width: 'auto', padding: '10px 20px', opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
          disabled={currentPage >= totalPages - 1} 
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t('profile.next')}
        </button>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>{user.firstName || t('profile.defaultFirstName')} {user.lastName || t('profile.defaultLastName')}</h2>
          <p>{user.email}</p>
        </div>
        
        <ul className="sidebar-menu">
          <li className={activeTab === 'active' ? 'active' : ''} onClick={() => {setActiveTab('active'); setMessage({text: ''})}}>{t('profile.activeTab')}</li>
          <li className={activeTab === 'history' ? 'active' : ''} onClick={() => {setActiveTab('history'); setMessage({text: ''})}}>{t('profile.historyTab')}</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => {setActiveTab('settings'); setMessage({text: ''})}}>{t('profile.settingsTab')}</li>
          
          <li onClick={handleLogout} style={{ color: '#ff4d4d', marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
            {t('navbar.logout')}
          </li>
        </ul>
      </div>

      <div className="profile-content glass-panel">
        {ticketsLoading && activeTab !== 'settings' ? (
           <h2 style={{padding: '100px', color: 'white'}}>{t('profile.loading')}</h2>
        ) : (
          <>
            {activeTab === 'active' && (
              <div className="tab-section">
                <h2 className="tab-title">{t('profile.upcomingMovies')}</h2>
                {activeTickets.length === 0 ? (
                  <p className="empty-state">{t('profile.noActiveTickets')}</p>
                ) : (
                  <div className="tickets-list">
                    {activeTickets.map(ticket => (
                      <div key={ticket.id} className="ticket-card">
                        <img src={ticket.screening.movie.posterUrl} alt="Poster" className="ticket-poster" />
                        <div className="ticket-info">
                          <h3>{ticket.screening.movie.title}</h3>
                          <p className="ticket-date">
                            {new Date(ticket.screening.startTime).toLocaleDateString(currentLocale, { weekday: 'short', month: 'short', day: 'numeric' })} {t('profile.atTime')} {new Date(ticket.screening.startTime).toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </p>
                          <p>{t('profile.room')}: <strong>{ticket.screening.room.name}</strong></p>
                          <p>{t('profile.seat')}: <strong className="ticket-seat">{ticket.seatNumber}</strong></p>
                        </div>
                        <div className="ticket-actions">
                          {MOCK_TODAY > new Date(new Date(ticket.screening.startTime).getTime() - 30 * 60000) ? (
                            <span className="non-refundable-text">
                              {t('profile.nonRefundable')}
                            </span>
                          ) : (
                            <button className="cancel-ticket-btn" onClick={() => handleReturnTicket(ticket.id)}>
                              {t('profile.cancelBtn')}
                            </button>
                          )}
                          <button className="download-btn cancel-ticket-btn" onClick={() => handleDownloadPdf(ticket.id)}>
                              {t('profile.downloadBtn')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Używamy komponentu paginacji dedykowanego dla aktywnych */}
                <PaginationControls 
                  currentPage={activePage} 
                  totalPages={activeTotalPages} 
                  onPageChange={(page) => fetchActiveTickets(page)} 
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="tab-section">
                <h2 className="tab-title">{t('profile.ticketHistory')}</h2>
                {historyTickets.length === 0 ? (
                  <p className="empty-state">{t('profile.noHistory')}</p>
                ) : (
                  <div className="tickets-list">
                    {historyTickets.map(ticket => (
                      <div key={ticket.id} className={`ticket-card ${ticket.status === 'ANULOWANY' ? 'cancelled-ticket' : 'past-ticket'}`}>
                        <img src={ticket.screening.movie.posterUrl} alt="Poster" className="ticket-poster" />
                        <div className="ticket-info">
                          <h3>{ticket.screening.movie.title}</h3>
                          <p className="ticket-date">
                            {new Date(ticket.screening.startTime).toLocaleDateString(currentLocale)}
                          </p>
                          <span className={`status-badge ${ticket.status === 'ANULOWANY' ? 'red-badge' : 'gray-badge'}`}>
                            {ticket.status === 'ANULOWANY' ? t('profile.statusCancelled') : t('profile.statusCompleted')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Używamy komponentu paginacji dedykowanego dla historii */}
                <PaginationControls 
                  currentPage={historyPage} 
                  totalPages={historyTotalPages} 
                  onPageChange={(page) => fetchHistoryTickets(page)} 
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-section">
                <h2 className="tab-title">{t('profile.accountSettings')}</h2>
                
                {message.text && (
                  <div className={`profile-message ${message.type}`}>{message.text}</div>
                )}

                <div className="settings-grid">
                  <form className="settings-form" onSubmit={handleProfileUpdate}>
                    <h3>{t('profile.personalInfo')}</h3>
                    <div className="input-group">
                      <label>{t('profile.firstName')}</label>
                      <input type="text" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>{t('profile.lastName')}</label>
                      <input type="text" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>{t('profile.phoneNum')}</label>
                      <input type="tel" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>{t('profile.address')}</label>
                      <input type="text" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>{t('profile.dob')}</label>
                      <input type="date" value={profileData.dateOfBirth} onChange={e => setProfileData({...profileData, dateOfBirth: e.target.value})} />
                    </div>
                    <button type="submit" className="save-btn">{t('profile.saveChanges')}</button>
                  </form>

                  <form className="settings-form password-form" onSubmit={handlePasswordChange}>
                    <h3>{t('profile.changePass')}</h3>
                    <div className="input-group">
                      <label>{t('profile.currPass')}</label>
                      <input type="password" required value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>{t('profile.newPass')}</label>
                      <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                    </div>
                    <button type="submit" className="save-btn danger-btn">{t('profile.updatePass')}</button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;