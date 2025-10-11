import api from './api';

export const patientService = {
  // Get all patients
  getPatients: async (params = {}) => {
    try {
      const response = await api.get('/patients', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patients' };
    }
  },

  // Get single patient
  getPatient: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return { success: true, data: response.data.data.patient };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient' };
    }
  },

  // Create new patient
  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return { success: true, data: response.data.data.patient };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create patient' };
    }
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return { success: true, data: response.data.data.patient };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update patient' };
    }
  },

  // Delete patient
  deletePatient: async (id) => {
    try {
      const response = await api.delete(`/patients/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete patient' };
    }
  },

  // Get patient statistics
  getPatientStats: async () => {
    try {
      const response = await api.get('/patients/stats/overview');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient statistics' };
    }
  }
};
