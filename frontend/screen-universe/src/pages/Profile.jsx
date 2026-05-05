import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../components/MovieCardSkeleton.css';
import './Profile.css';

const API_URL = 'http://localhost:8080';

const LazyPoster = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', padding: 0 }}
    >
      {!isLoaded && (
        <div
          className="skeleton-poster animate-pulse"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0, borderRadius: 'inherit' }}
        ></div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit'
        }}
      />
    </div>
  );
};

const Profile = () => {
  const { user, login, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState('active');
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const [activeTickets, setActiveTickets] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [activeTotalPages, setActiveTotalPages] = useState(0);

  const [historyTickets, setHistoryTickets] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: ''
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [ticketToReturn, setTicketToReturn] = useState(null);

  // Zaktualizowana zmienna do aktualnego czasu
  const TODAY = new Date();
  const currentLocale = i18n.language === 'pl' ? 'pl-PL' : 'en-US';

  const formatDateTime = (value) => {
    if (!value) return { date: '-', time: '-', full: '-' };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: '-', time: '-', full: '-' };

    return {
      date: date.toLocaleDateString(currentLocale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString(currentLocale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      full: date.toLocaleString(currentLocale)
    };
  };

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/logowanie');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'active') fetchActiveTickets(activePage);
      if (activeTab === 'history') fetchHistoryTickets(historyPage);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!notification.text) return;
    const timer = setTimeout(() => {
      setNotification({ text: '', type: '' });
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification]);

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
    } catch (err) {
      console.error(err);
      showNotification(err.message || t('profile.fetchError'), 'error');
    } finally {
      setTicketsLoading(false);
    }
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
    } catch (err) {
      console.error(err);
      showNotification(err.message || t('profile.fetchError'), 'error');
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleDownloadPdf = async (ticketId) => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}/pdf`, {
        method: 'GET',
        headers: { Authorization: user.token }
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

      showNotification(t('profile.downloadSuccess'), 'success');
    } catch (err) {
      showNotification(err.message || t('profile.downloadError'), 'error');
    }
  };

  const handleReturnTicket = async (ticket) => {
    setTicketToReturn(ticket);
  };

  const confirmReturnTicket = async () => {
    if (!ticketToReturn) return;

    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketToReturn.id}/return`, {
        method: 'PUT',
        headers: { Authorization: user.token }
      });

      if (!res.ok) throw new Error(t('profile.cancelError'));

      showNotification(t('profile.cancelledMsg'), 'success');
      setTicketToReturn(null);
      fetchActiveTickets(activePage);
    } catch (err) {
      showNotification(err.message || t('profile.cancelError'), 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.token
        },
        body: JSON.stringify(profileData)
      });

      if (!res.ok) throw new Error(t('profile.updateError'));

      const updatedUser = await res.json();
      login({ ...updatedUser, token: user.token });
      setMessage({ text: t('profile.profileUpdated'), type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.token
        },
        body: JSON.stringify(passwords)
      });

      if (!res.ok) throw new Error(t('profile.passChangeError'));

      setMessage({ text: t('profile.passUpdated'), type: 'success' });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) return <div>{t('profile.sync')}</div>;
  if (!user) return null;

  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          className="save-btn pagination-btn"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('profile.prev')}
        </button>

        <span className="pagination-text">
          {t('profile.page')} {currentPage + 1} {t('profile.of')} {totalPages}
        </span>

        <button
          className="save-btn pagination-btn"
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
      {notification.text && (
        <div className={`toast-notification ${notification.type}`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification({ text: '', type: '' })}>×</button>
        </div>
      )}

      {ticketToReturn && (
        <div className="modal-overlay" onClick={() => setTicketToReturn(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('profile.returnTicketTitle')}</h3>

            <p className="confirm-text">
              {t('profile.returnTicketText')}<br /><br />
              <strong>{ticketToReturn.screening?.movie?.title || '-'}</strong><br />
              {ticketToReturn.screening?.room?.name ? `${t('profile.room')}: ${ticketToReturn.screening.room.name}` : ''}<br />
              {ticketToReturn.seatNumber ? `${t('profile.seat')}: ${ticketToReturn.seatNumber}` : ''}<br />
              {ticketToReturn.screening?.startTime
                ? (() => {
                    const d = formatDateTime(ticketToReturn.screening.startTime);
                    return `${t('profile.showtime')}: ${d.date} ${t('profile.atTime')} ${d.time}`;
                  })()
                : ''}
            </p>

            <div className="modal-actions">
              <button className="save-btn modal-secondary" onClick={() => setTicketToReturn(null)}>
                {t('profile.cancel')}
              </button>
              <button className="save-btn danger-btn modal-danger" onClick={confirmReturnTicket}>
                {t('profile.confirmReturn')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>
            {user.firstName || t('profile.defaultFirstName')}{' '}
            {user.lastName || t('profile.defaultLastName')}
          </h2>
          <p>{user.email}</p>
        </div>

        <ul className="sidebar-menu">
          <li
            className={activeTab === 'active' ? 'active' : ''}
            onClick={() => {
              setActiveTab('active');
              setMessage({ text: '', type: '' });
            }}
          >
            {t('profile.activeTab')}
          </li>

          <li
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => {
              setActiveTab('history');
              setMessage({ text: '', type: '' });
            }}
          >
            {t('profile.historyTab')}
          </li>

          <li
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => {
              setActiveTab('settings');
              setMessage({ text: '', type: '' });
            }}
          >
            {t('profile.settingsTab')}
          </li>

          <li
            onClick={handleLogout}
            style={{
              color: '#ff4d4d',
              marginTop: '20px',
              borderTop: '1px solid #333',
              paddingTop: '15px'
            }}
          >
            {t('profile.logoutBtn')}
          </li>
        </ul>
      </div>

      <div className="profile-content glass-panel">
        {ticketsLoading && activeTab !== 'settings' ? (
          <div className="tab-section">
            <h2 className="tab-title">
              {activeTab === 'active' ? t('profile.upcomingMovies') : t('profile.ticketHistory')}
            </h2>
            <div className="tickets-list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="ticket-card" style={{ opacity: 0.7, pointerEvents: 'none' }}>
                  <div
                    className="skeleton-poster animate-pulse ticket-poster"
                    style={{ margin: 0, marginRight: '20px' }}
                  ></div>
                  <div className="ticket-info">
                    <div className="skeleton-line animate-pulse" style={{ height: '22px', width: '50%', marginBottom: '10px', borderRadius: '4px' }}></div>
                    <div className="skeleton-line animate-pulse" style={{ height: '16px', width: '30%', marginBottom: '15px', borderRadius: '4px' }}></div>
                    <div className="ticket-details-grid">
                      <div className="skeleton-line animate-pulse" style={{ height: '14px', width: '70%', borderRadius: '4px' }}></div>
                      <div className="skeleton-line animate-pulse" style={{ height: '14px', width: '60%', borderRadius: '4px' }}></div>
                      <div className="skeleton-line animate-pulse" style={{ height: '14px', width: '80%', borderRadius: '4px' }}></div>
                      <div className="skeleton-line animate-pulse" style={{ height: '14px', width: '50%', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <div className="skeleton-line animate-pulse" style={{ height: '38px', width: '100%', borderRadius: '8px', marginBottom: '10px' }}></div>
                    <div className="skeleton-line animate-pulse" style={{ height: '38px', width: '100%', borderRadius: '8px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'active' && (
              <div className="tab-section">
                <h2 className="tab-title">{t('profile.upcomingMovies')}</h2>

                {activeTickets.length === 0 ? (
                  <p className="empty-state">{t('profile.noActiveTickets')}</p>
                ) : (
                  <div className="tickets-list">
                    {activeTickets.map((ticket) => {
                      const start = formatDateTime(ticket.screening?.startTime);
                      // Używamy uaktualnionego TODAY do sprawdzania, czy można zwrócić bilet
                      const canReturn =
                        TODAY <= new Date(new Date(ticket.screening?.startTime).getTime() - 30 * 60000);

                      return (
                        <div key={ticket.id} className="ticket-card">
                          <LazyPoster
                            src={ticket.screening?.movie?.posterUrl}
                            alt="Poster"
                            className="ticket-poster"
                          />

                          <div className="ticket-info">
                            <div className="ticket-header-row">
                              <h3>{ticket.screening?.movie?.title || '-'}</h3>
                              <span className="ticket-id-badge">
                                {t('profile.ticketId')}: {ticket.id}
                              </span>
                            </div>

                            <p className="ticket-date">
                              {start.date} {t('profile.atTime')} {start.time}
                            </p>

                            <div className="ticket-details-grid">
                              <p>
                                <span className="ticket-label">{t('profile.room')}:</span>{' '}
                                <strong>{ticket.screening?.room?.name || '-'}</strong>
                              </p>
                              <p>
                                <span className="ticket-label">{t('profile.seat')}:</span>{' '}
                                <strong className="ticket-seat">{ticket.seatNumber || '-'}</strong>
                              </p>
                              <p>
                                <span className="ticket-label">{t('profile.screeningId')}:</span>{' '}
                                <strong>{ticket.screening?.id || '-'}</strong>
                              </p>
                              <p>
                                <span className="ticket-label">{t('profile.status')}:</span>{' '}
                                <strong>{ticket.status || 'AKTYWNY'}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="ticket-actions">
                            {canReturn ? (
                              <button
                                className="cancel-ticket-btn"
                                onClick={() => handleReturnTicket(ticket)}
                              >
                                {t('profile.cancelBtn')}
                              </button>
                            ) : (
                              <span className="non-refundable-text">
                                {t('profile.nonRefundable')}
                              </span>
                            )}

                            <button
                              className="download-btn cancel-ticket-btn"
                              onClick={() => handleDownloadPdf(ticket.id)}
                            >
                              {t('profile.downloadBtn')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                    {historyTickets.map((ticket) => {
                      const start = formatDateTime(ticket.screening?.startTime);
                      
                      // Explicitly definiujemy i obsługujemy stany na zaktualizowanym froncie
                      const isCancelled = ticket.status === 'ANULOWANY' || ticket.status === 'CANCELLED';
                      const isCompleted = ticket.status === 'ZAKOŃCZONY' || ticket.status === 'COMPLETED';

                      return (
                        <div
                          key={ticket.id}
                          className={`ticket-card history-ticket ${
                            isCancelled ? 'cancelled-ticket' : 'past-ticket'
                          }`}
                        >
                          <LazyPoster
                            src={ticket.screening?.movie?.posterUrl}
                            alt="Poster"
                            className="ticket-poster"
                          />

                          <div className="ticket-info">
                            <div className="ticket-header-row">
                              <h3>{ticket.screening?.movie?.title || '-'}</h3>
                              <span className="ticket-id-badge">
                                {t('profile.ticketId')}: {ticket.id}
                              </span>
                            </div>

                            <p className="ticket-date">
                              {start.date} {t('profile.atTime')} {start.time}
                            </p>

   
                            <span className={`status-badge ${isCancelled ? 'red-badge' : 'gray-badge'}`}>
                              {isCancelled ? t('profile.statusCancelled') : (isCompleted ? t('profile.statusCompleted') : ticket.status)}
                            </span>

                            <div className="ticket-details-grid history-details">
                              <p>
                                <span className="ticket-label">{t('profile.room')}:</span>{' '}
                                <strong>{ticket.screening?.room?.name || '-'}</strong>
                              </p>
                              <p>
                                <span className="ticket-label">{t('profile.seat')}:</span>{' '}
                                <strong>{ticket.seatNumber || '-'}</strong>
                              </p>
                              <p>
                                <span className="ticket-label">{t('profile.screeningId')}:</span>{' '}
                                <strong>{ticket.screening?.id || '-'}</strong>
                              </p>
                              <p>
                                <span className="ticket-label">{t('profile.status')}:</span>{' '}
                                <strong>{ticket.status || '-'}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label>{t('profile.lastName')}</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label>{t('profile.phoneNum')}</label>
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phoneNumber: e.target.value })
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label>{t('profile.address')}</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({ ...profileData, address: e.target.value })
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label>{t('profile.dob')}</label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) =>
                          setProfileData({ ...profileData, dateOfBirth: e.target.value })
                        }
                      />
                    </div>

                    <button type="submit" className="save-btn">
                      {t('profile.saveChanges')}
                    </button>
                  </form>

                  <form className="settings-form password-form" onSubmit={handlePasswordChange}>
                    <h3>{t('profile.changePass')}</h3>

                    <div className="input-group">
                      <label>{t('profile.currPass')}</label>
                      <input
                        type="password"
                        required
                        value={passwords.oldPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, oldPassword: e.target.value })
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label>{t('profile.newPass')}</label>
                      <input
                        type="password"
                        required
                        value={passwords.newPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, newPassword: e.target.value })
                        }
                      />
                    </div>

                    <button type="submit" className="save-btn danger-btn">
                      {t('profile.updatePass')}
                    </button>
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