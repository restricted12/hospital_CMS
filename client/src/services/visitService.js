import api from './api';

export const visitService = {
  // Get all visits
  getVisits: async (params = {}) => {
    try {
      const response = await api.get('/visits', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visits' };
    }
  },

  // Get single visit
  getVisit: async (id) => {
    try {
      const response = await api.get(`/visits/${id}`);
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visit' };
    }
  },

  // Create new visit
  createVisit: async (visitData) => {
    try {
      const response = await api.post('/visits', visitData);
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create visit' };
    }
  },

  // Update visit status
  updateVisitStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/visits/${id}/status`, { status, notes });
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update visit status' };
    }
  },

  // Get pending visits for checker doctor
  getPendingVisits: async () => {
    try {
      const response = await api.get('/checker/visits/pending');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pending visits' };
    }
  },

  // Get visits with lab results for main doctor
  getLabDoneVisits: async () => {
    try {
      const response = await api.get('/prescriptions/visits/lab-done');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch lab done visits' };
    }
  },

  // Update visit with checker doctor data
  updateVisitChecker: async (id, symptoms, labTests) => {
    try {
      const response = await api.put(`/checker/visits/${id}/checker`, { symptoms, labTests });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update visit' };
    }
  },

  // Direct diagnosis without lab tests
  updateVisitDirect: async (id, symptoms, diagnosis) => {
    try {
      const response = await api.put(`/checker/visits/${id}/direct`, { symptoms, diagnosis });
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update visit' };
    }
  },

  // Get visit statistics
  getVisitStats: async () => {
    try {
      const response = await api.get('/visits/stats/overview');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visit statistics' };
    }
  }
};
