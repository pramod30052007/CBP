import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request interceptor - attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
};

// ─── Workers ─────────────────────────────────────────────────────────────────
export const workerAPI = {
  getAll: (params) => api.get('/api/workers', { params }),
  getById: (id) => api.get(`/api/workers/${id}`),
  getMyProfile: () => api.get('/api/workers/my/profile'),
  updateProfile: (formData) =>
    api.put('/api/workers/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Hotels ──────────────────────────────────────────────────────────────────
export const hotelAPI = {
  create: (data) => api.post('/api/hotels', data),
  getMyHotel: () => api.get('/api/hotels/my'),
  getAll: () => api.get('/api/hotels'),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/api/bookings', data),
  getAll: (params) => api.get('/api/bookings', { params }),
  updateStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  getMy: () => api.get('/api/payments/my'),
  update: (id, data) => api.patch(`/api/payments/${id}`, data),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => api.post('/api/reviews', data),
  getByWorker: (id) => api.get(`/api/reviews/worker/${id}`),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  markAllRead: () => api.patch('/api/notifications/read-all'),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  toggleUser: (id) => api.patch(`/api/admin/users/${id}/toggle`),
  verifyWorker: (id, status) => api.patch(`/api/admin/workers/${id}/verify`, { status }),
  getBookings: () => api.get('/api/admin/bookings'),
};

export default api;
