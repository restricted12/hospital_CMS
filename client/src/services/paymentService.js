import api from './api';

export const paymentService = {
  // Get all payments
  getPayments: async (params = {}) => {
    try {
      const response = await api.get('/payments', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch payments' };
    }
  },

  // Get single payment
  getPayment: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return { success: true, data: response.data.data.payment };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch payment' };
    }
  },

  // Create payment
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create payment' };
    }
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update payment' };
    }
  },

  // Confirm payment
  confirmPayment: async (id) => {
    try {
      const response = await api.put(`/payments/${id}/confirm`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to confirm payment' };
    }
  },

  // Delete payment (admin only)
  deletePayment: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete payment' };
    }
  },

  // Get payments by visit
  getPaymentsByVisit: async (visitId) => {
    try {
      const response = await api.get(`/payments/visit/${visitId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visit payments' };
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const response = await api.get('/payments/stats/overview');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch payment statistics' };
    }
  }
};
