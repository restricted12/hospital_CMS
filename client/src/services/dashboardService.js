import api from './api';

export const dashboardService = {
  // Get dashboard overview
  getOverview: async () => {
    try {
      const response = await api.get('/dashboard/overview');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch dashboard overview' };
    }
  },

  // Get revenue data
  getRevenue: async (period = '30d') => {
    try {
      const response = await api.get(`/dashboard/revenue?period=${period}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch revenue data' };
    }
  },

  // Get patient analytics
  getPatientAnalytics: async () => {
    try {
      const response = await api.get('/dashboard/patients');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient analytics' };
    }
  },

  // Get visit analytics
  getVisitAnalytics: async () => {
    try {
      const response = await api.get('/dashboard/visits');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visit analytics' };
    }
  },

  // Get system performance metrics
  getPerformanceMetrics: async () => {
    try {
      const response = await api.get('/dashboard/performance');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch performance metrics' };
    }
  }
};
