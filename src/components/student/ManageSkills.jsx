import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './ManageSkills.css';


const ManageSkills = () => {
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [newTeachSkill, setNewTeachSkill] = useState({ skillName: '', experienceLevel: 'BEGINNER' });
  const [newLearnSkill, setNewLearnSkill] = useState({ skillName: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  const experienceLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const handleAddTeachSkill = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await skillsAPI.addTeachSkill(newTeachSkill);
      setMessage('Teach skill added successfully!');
      setNewTeachSkill({ skillName: '', experienceLevel: 'BEGINNER' });
      // Refresh skills list if you add GET endpoint later
    } catch (error) {
      setMessage('Error adding teach skill');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await skillsAPI.addLearnSkill(newLearnSkill);
      setMessage('Learn skill added successfully!');
      setNewLearnSkill({ skillName: '' });
    } catch (error) {
      setMessage('Error adding learn skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-skills-container">
      <div className="manage-skills-card">
        <h1 className="manage-title">Manage Your Skills</h1>
        <p className="manage-subtitle">Add skills you can teach and want to learn</p>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="skills-sections">
          {/* Teach Skills Section */}
          <div className="skills-section">
            <h3 className="section-title">
              <span className="icon">👨‍🏫</span> Skills I Can Teach
            </h3>

            <form onSubmit={handleAddTeachSkill} className="skill-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="e.g., Java, React, DSA"
                  value={newTeachSkill.skillName}
                  onChange={(e) => setNewTeachSkill({ ...newTeachSkill, skillName: e.target.value })}
                  required
                  className="skill-input"
                />
                <select
                  value={newTeachSkill.experienceLevel}
                  onChange={(e) => setNewTeachSkill({ ...newTeachSkill, experienceLevel: e.target.value })}
                  className="level-select"
                  required
                >
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <button type="submit" disabled={loading} className="add-btn">
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>

       
          </div>

          {/* Learn Skills Section */}
          <div className="skills-section">
            <h3 className="section-title">
              <span className="icon">👨‍🎓</span> Skills I Want to Learn
            </h3>

            <form onSubmit={handleAddLearnSkill} className="skill-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="e.g., Machine Learning, UI/UX"
                  value={newLearnSkill.skillName}
                  onChange={(e) => setNewLearnSkill({ ...newLearnSkill, skillName: e.target.value })}
                  required
                  className="skill-input"
                />
                <button type="submit" disabled={loading} className="add-btn">
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>

        
          </div>
         

        </div>
            <div className="manage-actions">
              <button
                className="cancel-btn"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </button>
            </div>
      </div>
    </div>
  );
};

export default ManageSkills;
