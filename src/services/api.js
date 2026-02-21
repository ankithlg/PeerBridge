import axios from 'axios';

const API_BASE_URL = 'http://localhost:9099';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests after login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};


export const studentAPI = {
  getProfile: () => api.get('/student/me'),
  updateProfile: (updates) => api.put('/student/me', updates),
};

export const skillsAPI = {
  addTeachSkill: (skillData) => api.post('/skills/teach', skillData),
  addLearnSkill: (skillData) => api.post('/skills/learn', skillData),
  findMatches: (searchParams) => api.post('/skills/matches', searchParams),
 };

export const connectionAPI = {
 
  sendRequest: (receiverId) => api.post('/connect/send', null, { params: { receiverId } }),
  respondRequest: (requestId, status) => api.post('/connect/respond', null, { params: { requestId, status } }),
  getStatus: (studentId) => api.get('/connect/status', { params: { student2: studentId } }),
  removeConnection: (studentId) => api.delete('/connect/remove', { params: { student2: studentId } }),
  getPendingRequests: () => api.get('/connect/pending-requests'),
};
export default api;
