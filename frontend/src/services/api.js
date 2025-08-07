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

// Ticket API
export const ticketAPI = {
  getAll: (params = {}) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
  uploadAttachment: (id, data) => api.post(`/tickets/${id}/attachments`, data),
  getDashboardStats: () => api.get('/tickets/dashboard/stats'),
};

// User API
export const userAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Import API
export const importAPI = {
  importAssets: (data) => api.post('/import/assets', data),
  getTemplate: () => api.get('/import/template'),
};

// Report API
export const reportAPI = {
  getAssetReport: (params = {}) => api.get('/reports/assets', { params }),
  getTicketReport: (params = {}) => api.get('/reports/tickets', { params }),
  getMaintenanceReport: (params = {}) => api.get('/reports/maintenance', { params }),
  getCostReport: (params = {}) => api.get('/reports/cost', { params }),
  getUserActivityReport: (params = {}) => api.get('/reports/user-activity', { params }),
  getDashboardReport: () => api.get('/reports/dashboard'),
  exportReport: (params = {}) => api.get('/reports/export', { params }),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: (params = {}) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
  getDashboardStats: () => api.get('/maintenance/dashboard/stats'),
  autoSchedule: () => api.post('/maintenance/auto-schedule'),
  checkOverdue: () => api.post('/maintenance/check-overdue'),
};

export default api;