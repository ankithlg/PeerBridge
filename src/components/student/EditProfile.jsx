import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './EditProfile.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    preferredMode: '',
    availableTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch current profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/student/me');
      const student = response.data;
      setFormData({
        name: student.name || '',
        bio: student.bio || '',
        preferredMode: student.preferredMode || '',
        availableTime: student.availableTime || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/student/me', formData);
      setSuccess('Profile updated successfully!');
      // Optionally redirect to dashboard
      // navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <div className="edit-header">
          <h2>Edit Profile</h2>
          <p>Update your personal information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself..."
              maxLength="1000"
            />
            <small>{formData.bio.length}/1000</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Mode</label>
              <select name="preferredMode" value={formData.preferredMode} onChange={handleChange}>
                <option value="">Select preference</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="form-group">
              <label>Available Time</label>
              <input
                type="text"
                name="availableTime"
                value={formData.availableTime}
                onChange={handleChange}
                placeholder="e.g., Evenings, Weekends"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
