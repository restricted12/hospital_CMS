import api from './api';

export const labService = {
  // Get all lab tests
  getLabTests: async (params = {}) => {
    try {
      const response = await api.get('/labs', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch lab tests' };
    }
  },

  // Get single lab test
  getLabTest: async (id) => {
    try {
      const response = await api.get(`/labs/${id}`);
      return { success: true, data: response.data.data.labTest };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch lab test' };
    }
  },

  // Get pending lab tests
  getPendingLabTests: async () => {
    try {
      const response = await api.get('/labs/pending');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pending lab tests' };
    }
  },

  // Get completed lab tests
  getCompletedLabTests: async (params = {}) => {
    try {
      const response = await api.get('/labs/completed', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch completed lab tests' };
    }
  },

  // Upload lab test result
  uploadLabResult: async (id, resultData) => {
    try {
      const formData = new FormData();
      formData.append('result', resultData.result);
      if (resultData.notes) {
        formData.append('notes', resultData.notes);
      }
      if (resultData.file) {
        formData.append('resultFile', resultData.file);
      }

      const response = await api.put(`/labs/${id}/result`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to upload lab result' };
    }
  },

  // Update lab test status
  updateLabTestStatus: async (id, isCompleted) => {
    try {
      const response = await api.put(`/labs/${id}/status`, { isCompleted });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update lab test status' };
    }
  },

  // Get lab statistics
  getLabStats: async () => {
    try {
      const response = await api.get('/labs/stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch lab statistics' };
    }
  }
};
