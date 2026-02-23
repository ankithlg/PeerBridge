import React, { useState, useEffect, useCallback } from 'react';
import './MainMatchPage.css';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Helper: get first letter of first name
const getInitial = (name) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

// Avatar circle using initial
const InitialAvatar = ({ name, size = 48, onClick, style = {} }) => (
  <div
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#6c63ff',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 'bold',
      cursor: onClick ? 'pointer' : 'default',
      flexShrink: 0,
      ...style,
    }}
  >
    {getInitial(name)}
  </div>
);

const MainMatchPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    skillName: '',
    preferredMode: 'both',
    availableTime: '',
    page: 0,
    size: 10,
    sortBy: 'relevance',
  });
  const [matches, setMatches] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/student/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchMatches = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const params = { ...searchParams, page };
        const response = await api.post('/skills/matches', params);
        setMatches(response.data.matches || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.currentPage || 0);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    },
    [searchParams]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/connect/pending-requests');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchMatches();
    fetchNotifications();
  }, [fetchUserProfile, fetchMatches, fetchNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMatches(0);
  };

  const sendConnectionRequest = async (receiverId) => {
    try {
      await api.post('/connect/send', null, { params: { receiverId } });
      alert('✅ Connection request sent successfully!');
      fetchMatches(currentPage);
    } catch (error) {
      alert('❌ Error sending request');
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      await api.post('/connect/respond', null, { params: { requestId, status } });
      alert(`✅ Request ${status.toLowerCase()}d!`);
      fetchNotifications();
      setShowNotificationPanel(false);
    } catch (error) {
      alert('❌ Error responding to request');
    }
  };

  const getConnectionStatus = useCallback(async (studentId) => {
    try {
      const response = await api.get('/connect/status', { params: { student2: studentId } });
      return response.data;
    } catch {
      return 'none';
    }
  }, []);

  return (
    <div className="main-match-page">
      {/* Header */}
      <header className="page-header">
        <div className="logo">
          <h1>🎯 Find Your Match</h1>
          <p>Connect with experts to learn new skills</p>
        </div>

        <div className="profile-section">
          {userProfile ? (
            <div className="user-profile">
              {/* Clicking the avatar goes to /profile (current user) */}
              <InitialAvatar
                name={userProfile.name}
                size={44}
                onClick={() => navigate('/profile')}
                style={{ border: '2px solid #fff' }}
              />
              <div className="profile-info" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                <span className="profile-name">{userProfile.name}</span>
                <span className="profile-email">{userProfile.email}</span>
              </div>
              <div
                className="notification-bell"
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              >
                🔔
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="loading-profile">Loading profile...</div>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="What do you want to learn? (React, Python, Java...)"
              value={searchParams.skillName}
              onChange={(e) => setSearchParams({ ...searchParams, skillName: e.target.value })}
              className="search-input"
            />
            <select
              value={searchParams.preferredMode}
              onChange={(e) => setSearchParams({ ...searchParams, preferredMode: e.target.value })}
              className="search-select"
            >
              <option value="both">Online/Offline</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline Only</option>
            </select>
            <input
              type="text"
              placeholder="Available time (evenings, weekends...)"
              value={searchParams.availableTime}
              onChange={(e) => setSearchParams({ ...searchParams, availableTime: e.target.value })}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '🔍 Searching...' : '🚀 Find Perfect Matches'}
          </button>
        </form>
      </section>

      {/* Matches Grid */}
      <section className="matches-section">
        <div className="section-header">
          <h2>🎓 Perfect Learning Matches</h2>
          <div className="pagination">
            <button
              onClick={() => fetchMatches(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0 || loading}
              className="pagination-btn prev"
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => fetchMatches(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1 || loading}
              className="pagination-btn next"
            >
              Next →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Finding your perfect learning matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="no-matches">
            <div className="empty-icon">🔍</div>
            <p>No matches found. Try different search criteria or add teaching skills!</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onConnect={sendConnectionRequest}
                getStatus={getConnectionStatus}
              />
            ))}
          </div>
        )}
      </section>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <NotificationPanel
          notifications={notifications}
          onRespond={respondToRequest}
          onClose={() => setShowNotificationPanel(false)}
        />
      )}
    </div>
  );
};

const MatchCard = ({ match, onConnect, getStatus }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('none');
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const result = await getStatus(match.id);
      setStatus(result);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (status === 'none') {
      await onConnect(match.id);
    } else {
      await checkStatus();
    }
  };

  return (
    <div className="match-card">
      <div className="match-header">
        {/* Clicking avatar or name navigates to that student's profile */}
        <InitialAvatar
          name={match.name}
          size={52}
          onClick={() => navigate(`/profile/${match.id}`)}
        />
        <div className="match-meta">
          <h3
            style={{ cursor: 'pointer', color: '#6c63ff' }}
            onClick={() => navigate(`/profile/${match.id}`)}
          >
            {match.name || 'Student'}
          </h3>
          <div className="student-stats">
            <span>⭐ 4.8 rating</span>
            <span>•</span>
            <span>{match.teachSkillsCount || 0} skills</span>
          </div>
        </div>
      </div>

      <div className="match-content">
        <div className="match-skills">
          <span className="skill-tag expert">
            🎓 Expert: {match.teaches || match.teachSkillName || 'Multiple Skills'}
          </span>
          {match.experienceLevel && (
            <span className={`level-tag level-${match.experienceLevel.toLowerCase()}`}>
              {match.experienceLevel}
            </span>
          )}
        </div>

        <div className="match-details">
          <div className="detail-item">
            <span>📱 Mode:</span>
            <span>{match.preferredMode?.replace('both', 'Online/Offline') || 'Flexible'}</span>
          </div>
          <div className="detail-item">
            <span>⏰ Available:</span>
            <span>{match.availableTime || 'Flexible'}</span>
          </div>
          <div className="detail-item">
            <span>📍 Location:</span>
            <span>{match.location || 'Remote'}</span>
          </div>
        </div>
      </div>

      <div className="match-actions">
        <button
          className={`connect-btn ${status === 'none' ? 'primary' : status.toLowerCase()}`}
          onClick={handleConnect}
          disabled={checkingStatus || status !== 'none'}
        >
          {checkingStatus
            ? '⏳ Checking...'
            : status === 'none'
            ? '📤 Send Request'
            : status === 'PENDING'
            ? '⏳ Pending'
            : status === 'ACCEPTED'
            ? '✅ Connected'
            : '❌ Request Denied'}
        </button>
      </div>
    </div>
  );
};

const NotificationPanel = ({ notifications, onRespond, onClose }) => (
  <div className="notification-panel">
    <div className="panel-header">
      <h3>📬 Connection Requests ({notifications.length})</h3>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
    <div className="notifications-list">
      {notifications.length === 0 ? (
        <div className="empty-notifications">
          <div className="empty-icon">📭</div>
          No pending requests
        </div>
      ) : (
        notifications.map((notif) => (
          <div key={notif.id} className="notification-item">
            <div className="notif-header">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#6c63ff',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {notif.sender?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="notif-sender-info">
                <div className="notif-sender-name">
                  {notif.sender?.name || 'Student'} wants to connect!
                </div>
                <div className="notif-sender-skill">
                  Wants to learn: <strong>{notif.skillName || 'Your skills'}</strong>
                </div>
              </div>
            </div>
            <div className="notif-actions">
              <button className="accept-btn" onClick={() => onRespond(notif.id, 'ACCEPTED')}>
                ✅ Accept
              </button>
              <button className="reject-btn" onClick={() => onRespond(notif.id, 'REJECTED')}>
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default MainMatchPage;