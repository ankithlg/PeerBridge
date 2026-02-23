import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { id } = useParams(); // present only on /profile/:id
  const isOwnProfile = !id;

  const [profile, setProfile] = useState(null);
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        // Fetch logged-in user's own profile + skills
        const [profileRes, teachRes, learnRes] = await Promise.all([
          api.get('/student/me'),
          api.get('/student/current-user/teach'),
          api.get('/student/current-user/learn'),
        ]);
        setProfile(profileRes.data);
        setTeachSkills(teachRes.data || []);
        setLearnSkills(learnRes.data || []);
      } else {
        // Fetch another student's profile (skills are embedded in response)
        const response = await api.get(`/student/${id}`);
        setProfile(response.data);
        setTeachSkills(response.data.teachSkills || []);
        setLearnSkills(response.data.learnSkills || []);
      }
    } catch (err) {
      setError(isOwnProfile ? 'Failed to load profile' : 'Student not found.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          {error}
          {isOwnProfile && (
            <>
              <br />
              <button className="retry-button" onClick={fetchAllData}>Try Again</button>
            </>
          )}
          {!isOwnProfile && (
            <button className="retry-button" onClick={() => navigate(-1)}>← Go Back</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Logout only shown on own profile */}
      {isOwnProfile && (
        <button className="logout-button fixed-top-right" onClick={handleLogout}>
          🚪 Logout
        </button>
      )}

      {/* Back button only shown on other profiles */}
      {!isOwnProfile && (
        <button
          className="logout-button fixed-top-right"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: '1px solid #6c63ff', color: '#6c63ff' }}
        >
          ← Back
        </button>
      )}

      <div className="profile-container">
        <div className="profile-card">

          {/* Header */}
          <div className="profile-header">
            <h2>{isOwnProfile ? '👤 My Profile' : `👤 ${profile.name}'s Profile`}</h2>
            {isOwnProfile && (
              <button onClick={() => navigate('/profile/edit')} className="edit-button">
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="profile-avatar1">
            <div className="avatar-placeholder1" />
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <div className="detail-item">
              <label>🧑 Name</label>
              <span>{profile.name || 'Not set'}</span>
            </div>

            {profile.email && (
              <div className="detail-item">
                <label>📧 Email</label>
                <span>{profile.email}</span>
              </div>
            )}

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
                <span>
                  {profile.preferredMode === 'both'
                    ? 'Online / Offline'
                    : profile.preferredMode}
                </span>
              </div>
            )}

            {profile.location && (
              <div className="detail-item">
                <label>📍 Location</label>
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="skills-wrapper">
            <div className="skill-block">
              <h4 className="section-heading teach-heading">🎓 Skills I Can Teach</h4>
              <div className="skills-inline">
                {teachSkills.length > 0 ? (
                  teachSkills.map((skill, i) => (
                    <span key={skill.id ?? i} className="chip teach">
                      {skill.skillName}
                      {skill.experienceLevel && ` · ${skill.experienceLevel}`}
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
                  learnSkills.map((skill, i) => (
                    <span key={skill.id ?? i} className="chip learn">
                      {skill.skillName}
                    </span>
                  ))
                ) : (
                  <span className="no-skill">No learning skills added</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions — only on own profile */}
          {isOwnProfile && (
            <div className="profile-actions">
              <button onClick={() => navigate('/skills')} className="action-button primary">
                ⚙️ Manage Skills
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Profile;