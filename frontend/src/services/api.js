import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Asset API
export const assetAPI = {
  getAll: (params = {}) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  getDashboardStats: () => api.get('/assets/dashboard/stats'),
  exportCSV: () => api.get('/assets/export/csv', { responseType: 'blob' }),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// Status API
export const statusAPI = {
  getAll: () => api.get('/statuses'),
};

export default api;