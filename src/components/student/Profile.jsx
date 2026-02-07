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
          <button onClick={fetchAllData} className="retry-button">
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
        <h2>👤 My Profile</h2>
        <button
          onClick={() => navigate('/profile/edit')}
          className="edit-button"
        >
          ✏️ Edit Profile
        </button>
      </div>

      <div className="profile-avatar">
        <div className="avatar-placeholder">
          {profile.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
      </div>

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

      {/* Skills Section */}
      <div className="skills-wrapper">

        <div className="skill-block">
          <h5 className="section-heading teach-heading">
            🎓 Skills I Can Teach
          </h5>

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
          <h5 className="section-heading learn-heading">
            📚 Skills I Want to Learn
          </h5>

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
);
}
export default Profile;
