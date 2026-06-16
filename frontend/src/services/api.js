import axios from 'axios'

// ===== AXIOS INSTANCE =====
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===== AUTH SERVICE =====
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// ===== INCOME SERVICE =====
export const incomeService = {
  getAll: (params) => api.get('/income', { params }),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
  getMonthlyAnalytics: (year) => api.get('/income/analytics/monthly', { params: { year } }),
  getYearlyAnalytics: () => api.get('/income/analytics/yearly'),
  getCategoryBreakdown: (params) => api.get('/income/analytics/category', { params }),
}

// ===== EXPENSE SERVICE =====
export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  uploadReceipt: (id, formData) =>
    api.post(`/expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCategoryAnalytics: (params) => api.get('/expenses/analytics/category', { params }),
  getMonthlyAnalytics: (year) => api.get('/expenses/analytics/monthly', { params: { year } }),
  getAnomalies: () => api.get('/expenses/anomalies'),
}

// ===== TAX SERVICE =====
export const taxService = {
  calculate: (data) => api.post('/tax/calculate', data),
  getRecords: () => api.get('/tax/records'),
  getRecordByYear: (year) => api.get(`/tax/records/${year}`),
  updateRecord: (year, data) => api.put(`/tax/records/${year}`, data),
  getDeadlines: () => api.get('/tax/deadlines'),
}

// ===== AI SERVICE =====
export const aiService = {
  getInsights: () => api.get('/ai/insights'),
  getFinancialScore: () => api.get('/ai/financial-score'),
  categorizeExpense: (data) => api.post('/ai/categorize', data),
  detectAnomalies: () => api.post('/ai/detect-anomalies'),
  predictTax: (params) => api.get('/ai/predict-tax', { params }),
  chat: (data) => api.post('/ai/chat', data),
}

// ===== REPORTS SERVICE =====
export const reportsService = {
  downloadPDF: (params) =>
    api.get('/reports/pdf', {
      params,
      responseType: 'blob',
    }),
  downloadExcel: (params) =>
    api.get('/reports/excel', {
      params,
      responseType: 'blob',
    }),
  getSummary: (params) => api.get('/reports/summary', { params }),
  getMonthlyBreakdown: (params) => api.get('/reports/monthly-breakdown', { params }),
}

// ===== NOTIFICATION SERVICE =====
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export default api
