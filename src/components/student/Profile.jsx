import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, teachRes, learnRes] = await Promise.all([
        api.get('/student/me'),
        api.get('/student/current-user/teach'),
        api.get('/student/current-user/learn'),
      ]);
      setProfile(profileRes.data);
      setTeachSkills(teachRes.data);
      setLearnSkills(learnRes.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* ====== Logout button — rendered OUTSIDE every container so position:fixed works ====== */}
      <button className="logout-button fixed-top-right" onClick={handleLogout}>
        🚪 Logout
      </button>

      {loading ? (
        <div className="profile-container">
          <div className="loading">Loading your profile...</div>
        </div>
      ) : error ? (
        <div className="profile-container">
          <div className="error-message">
            {error}
            <br />
            <button className="retry-button" onClick={fetchAllData}>Try Again</button>
          </div>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-card">

            {/* ====== Header ====== */}
            <div className="profile-header">
              <h2>👤 My Profile</h2>
              <button
                onClick={() => navigate('/profile/edit')}
                className="edit-button"
              >
                ✏️ Edit Profile
              </button>
            </div>

            {/* ====== Avatar ====== */}
            <div className="profile-avatar1">
              <div className="avatar-placeholder1">
                {/* {profile.name?.charAt(0)?.toUpperCase() || 'S'} */}
              </div>
            </div>

            {/* ====== Profile Details ====== */}
            <div className="profile-details">
              <div className="detail-item">
                <label>🧑 Name</label>
                <span>{profile.name || 'Not set'}</span>
              </div>

              {profile.bio && (
                <div className="detail-item">
                  <label>📝 Bio</label>
                  <span>{profile.bio}</span>
                </div>
              )}

              {profile.availableTime && (
                <div className="detail-item">
                  <label>⏰ Available Time</label>
                  <span>{profile.availableTime}</span>
                </div>
              )}

              {profile.preferredMode && (
                <div className="detail-item">
                  <label>💻 Preferred Mode</label>
                  <span>{profile.preferredMode}</span>
                </div>
              )}
            </div>

            {/* ====== Skills Section ====== */}
            <div className="skills-wrapper">

              <div className="skill-block">
                <h4 className="section-heading teach-heading">🎓 Skills I Can Teach</h4>
                <div className="skills-inline">
                  {teachSkills.length > 0 ? (
                    teachSkills.map((skill) => (
                      <span key={skill.id} className="chip teach">
                        {skill.skillName}
                      </span>
                    ))
                  ) : (
                    <span className="no-skill">No teaching skills added</span>
                  )}
                </div>
              </div>

              <div className="skill-block">
                <h4 className="section-heading learn-heading">📚 Skills I Want to Learn</h4>
                <div className="skills-inline">
                  {learnSkills.length > 0 ? (
                    learnSkills.map((skill) => (
                      <span key={skill.id} className="chip learn">
                        {skill.skillName}
                      </span>
                    ))
                  ) : (
                    <span className="no-skill">No learning skills added</span>
                  )}
                </div>
              </div>

            </div>

            {/* ====== Action Button ====== */}
            <div className="profile-actions">
              <button
                onClick={() => navigate('/skills')}
                className="action-button primary"
              >
                ⚙️ Manage Skills
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Profile;