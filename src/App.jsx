import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/student/Profile';
import EditProfile from './components/student/EditProfile';
import ManageSkills from './components/student/ManageSkills';
import MainMatchPage from './components/student/MainMatchPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/profile/edit" element={<EditProfile />} />
           <Route path="/skills" element={<ManageSkills />} />
           <Route path="/matches" element={<MainMatchPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
