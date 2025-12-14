import axios from 'axios';

// إنشاء instance من axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن تلقائياً لكل طلب
api.interceptors.request.use(
  (config) => {
    // محاولة الحصول على Token من localStorage
    let token = localStorage.getItem('token');
    
    // إذا لم يوجد، حاول الحصول عليه من auth object
    if (!token) {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const parsedAuth = JSON.parse(auth);
        token = parsedAuth.token;
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا كان التوكن غير صالح، قم بتسجيل الخروج
      // لكن فقط إذا لم نكن في صفحة تسجيل الدخول
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        console.error('خطأ في المصادقة:', error.response?.data?.message);
        // لا تعيد التوجيه تلقائياً، دع المكون يتعامل مع الخطأ
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Auth APIs ====================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  register: (userData) => api.post('/auth/register', userData),
};

// ==================== Drivers APIs ====================
export const driversAPI = {
  getAll: () => api.get('/drivers?limit=10000'),
  getOne: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

// ==================== Vehicles APIs ====================
export const vehiclesAPI = {
  getAll: () => api.get('/vehicles?limit=10000'),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ==================== Payments APIs ====================
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getOne: (id) => api.get(`/payments/${id}`),
  getByDriver: (driverId) => api.get(`/payments/driver/${driverId}`),
  getByVehicle: (vehicleId) => api.get(`/payments/vehicle/${vehicleId}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  markAsPaid: (id, data) => api.put(`/payments/${id}/mark-paid`, data),
  bulkMarkAsPaid: (data) => api.post('/payments/bulk-mark-paid', data),
  undoPayment: (id) => api.put(`/payments/${id}/undo-paid`),
  getStats: () => api.get('/payments/stats/summary'),
  getMonthlyStats: () => api.get('/payments/stats/monthly'),
  getHistory: (params) => api.get('/payments/history/all', { params }),
  updateOverdue: () => api.post('/payments/update-overdue'),
  generate: (data) => api.post('/payments/generate', data),
};

// ==================== Debts APIs ====================
export const debtsAPI = {
  getAll: () => api.get('/debts'),
  getOne: (id) => api.get(`/debts/${id}`),
  create: (data) => api.post('/debts', data),
  update: (id, data) => api.put(`/debts/${id}`, data),
  delete: (id) => api.delete(`/debts/${id}`),
  payInstallment: (debtId, data) => api.post(`/debts/${debtId}/pay-installment`, data),
  getAlerts: () => api.get('/debts/alerts'),
  getTypes: () => api.get('/debts/types'),
  getPaymentMethods: () => api.get('/debts/payment-methods'),
  getPaymentHistory: (debtId) => api.get(`/debts/${debtId}/payment-history`),
};

// ==================== Ownership APIs ====================
export const ownershipAPI = {
  getAll: () => api.get('/ownership'),
  getOne: (id) => api.get(`/ownership/${id}`),
  create: (data) => api.post('/ownership', data),
  update: (id, data) => api.put(`/ownership/${id}`, data),
  delete: (id) => api.delete(`/ownership/${id}`),
  payInstallment: (ownershipId, data) => api.post(`/ownership/${ownershipId}/pay-installment`, data),
};

// ==================== Notifications APIs ====================
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  generate: () => api.post('/notifications/generate'),
};

// ==================== Expenses APIs ====================
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  getOne: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats/summary', { params }),
};

// ==================== Maintenance APIs ====================
export const maintenanceAPI = {
  getAll: () => api.get('/maintenance'),
  getOne: (id) => api.get(`/maintenance/${id}`),
  getByVehicle: (vehicleId) => api.get(`/maintenance/vehicle/${vehicleId}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
  getUpcoming: (days) => api.get('/maintenance/alerts/upcoming', { params: { days } }),
  getOverdue: () => api.get('/maintenance/alerts/overdue'),
  getStats: (params) => api.get('/maintenance/stats/summary', { params }),
};

// ==================== Insurance APIs ====================
export const insuranceAPI = {
  getAll: () => api.get('/insurance'),
  getOne: (id) => api.get(`/insurance/${id}`),
  getByVehicle: (vehicleId) => api.get(`/insurance/vehicle/${vehicleId}`),
  create: (data) => api.post('/insurance', data),
  update: (id, data) => api.put(`/insurance/${id}`, data),
  delete: (id) => api.delete(`/insurance/${id}`),
  renew: (id, data) => api.post(`/insurance/${id}/renew`, data),
  getExpiring: (days = 30) => api.get(`/insurance/alerts/expiring?days=${days}`),
  getStats: () => api.get('/insurance/stats/summary'),
};

// ==================== Licenses APIs ====================
export const licensesAPI = {
  getAll: (type = 'all') => api.get(`/licenses?type=${type}`),
  getOne: (id, category) => api.get(`/licenses/${id}?category=${category}`),
  getByDriver: (driverId) => api.get(`/licenses/driver/${driverId}`),
  getByVehicle: (vehicleId) => api.get(`/licenses/vehicle/${vehicleId}`),
  create: (data) => api.post('/licenses', data),
  update: (id, data) => api.put(`/licenses/${id}`, data),
  delete: (id, category) => api.delete(`/licenses/${id}?category=${category}`),
  renew: (id, data) => api.post(`/licenses/${id}/renew`, data),
  getExpiring: (days = 30, type = 'all') => api.get(`/licenses/alerts/expiring?days=${days}&type=${type}`),
  getStats: () => api.get('/licenses/stats/summary'),
};

export default api;
