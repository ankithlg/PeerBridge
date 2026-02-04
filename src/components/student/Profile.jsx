import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/me');
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">{error}</div>
          <button onClick={fetchProfile} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button 
            onClick={() => navigate('/profile/edit')} 
            className="edit-button"
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {profile.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <label>Name</label>
            <span>{profile.name || 'Not set'}</span>
          </div>

          <div className="detail-item">
            <label>Email</label>
            <span>{profile.email}</span>
          </div>

          {profile.bio && (
            <div className="detail-item">
              <label>Bio</label>
              <span>{profile.bio}</span>
            </div>
          )}

          {profile.preferredMode && (
            <div className="detail-item">
              <label>Preferred Mode</label>
              <span>{profile.preferredMode}</span>
            </div>
          )}

          {profile.availableTime && (
            <div className="detail-item">
              <label>Available Time</label>
              <span>{profile.availableTime}</span>
            </div>
          )}

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{profile.teachSkills?.length || 0}</span>
              <span className="stat-label">Teach Skills</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.learnSkills?.length || 0}</span>
              <span className="stat-label">Learn Skills</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            onClick={() => navigate('/skills/teach')} 
            className="action-button primary"
          >
            Manage Teach Skills
          </button>
          <button 
            onClick={() => navigate('/skills/learn')} 
            className="action-button secondary"
          >
            Manage Learn Skills
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
