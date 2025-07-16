import axios from 'axios';
import {
  Asset,
  AssetCategory,
  AssetStatus,
  AssetStats,
  AssetHistory,
  Ticket,
  TicketStats,
  PaginatedResponse,
  ApiResponse,
  FilterOptions,
  AssetFormData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Asset API
export const assetApi = {
  getAll: (filters?: FilterOptions): Promise<PaginatedResponse<Asset>> =>
    api.get('/assets', { params: filters }).then(res => res.data),
  
  getById: (id: number): Promise<Asset> =>
    api.get(`/assets/${id}`).then(res => res.data),
  
  create: (data: AssetFormData): Promise<ApiResponse<Asset>> =>
    api.post('/assets', data).then(res => res.data),
  
  update: (id: number, data: Partial<AssetFormData>): Promise<ApiResponse<Asset>> =>
    api.put(`/assets/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/assets/${id}`).then(res => res.data),
  
  getStats: (): Promise<AssetStats> =>
    api.get('/assets/stats').then(res => res.data),
  
  getHistory: (id: number): Promise<AssetHistory[]> =>
    api.get(`/assets/${id}/history`).then(res => res.data),
  
  exportExcel: (): Promise<Blob> =>
    api.get('/assets/export', { responseType: 'blob' }).then(res => res.data),
  
  importExcel: (file: File): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/assets/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  }
};

// Asset Category API
export const assetCategoryApi = {
  getAll: (): Promise<AssetCategory[]> =>
    api.get('/asset-categories').then(res => res.data),
  
  getById: (id: number): Promise<AssetCategory> =>
    api.get(`/asset-categories/${id}`).then(res => res.data),
  
  create: (data: Omit<AssetCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<AssetCategory>> =>
    api.post('/asset-categories', data).then(res => res.data),
  
  update: (id: number, data: Partial<AssetCategory>): Promise<ApiResponse<AssetCategory>> =>
    api.put(`/asset-categories/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/asset-categories/${id}`).then(res => res.data)
};

// Asset Status API
export const assetStatusApi = {
  getAll: (): Promise<AssetStatus[]> =>
    api.get('/asset-statuses').then(res => res.data),
  
  getById: (id: number): Promise<AssetStatus> =>
    api.get(`/asset-statuses/${id}`).then(res => res.data),
  
  create: (data: Omit<AssetStatus, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<AssetStatus>> =>
    api.post('/asset-statuses', data).then(res => res.data),
  
  update: (id: number, data: Partial<AssetStatus>): Promise<ApiResponse<AssetStatus>> =>
    api.put(`/asset-statuses/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/asset-statuses/${id}`).then(res => res.data)
};

// Ticket API
export const ticketApi = {
  getAll: (filters?: FilterOptions): Promise<PaginatedResponse<Ticket>> =>
    api.get('/tickets', { params: filters }).then(res => res.data),
  
  getById: (id: number): Promise<Ticket> =>
    api.get(`/tickets/${id}`).then(res => res.data),
  
  create: (data: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Ticket>> =>
    api.post('/tickets', data).then(res => res.data),
  
  update: (id: number, data: Partial<Ticket>): Promise<ApiResponse<Ticket>> =>
    api.put(`/tickets/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/tickets/${id}`).then(res => res.data),
  
  getStats: (): Promise<TicketStats> =>
    api.get('/tickets/stats').then(res => res.data)
};

export default api;