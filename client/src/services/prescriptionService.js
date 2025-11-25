import api from './api';

export const prescriptionService = {
  // Get all prescriptions
  getPrescriptions: async (params = {}) => {
    try {
      const response = await api.get('/prescriptions', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch prescriptions' };
    }
  },

  // Get single prescription
  getPrescription: async (visitId) => {
    try {
      const response = await api.get(`/prescriptions/${visitId}`);
      return { success: true, data: response.data.data.prescription };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch prescription' };
    }
  },

  // Create prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await api.post('/prescriptions', prescriptionData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create prescription' };
    }
  },

  // Update prescription
  updatePrescription: async (id, prescriptionData) => {
    try {
      const response = await api.put(`/prescriptions/${id}`, prescriptionData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update prescription' };
    }
  },

  // Get pending prescriptions for pharmacy
  getPendingPrescriptions: async () => {
    try {
      const response = await api.get('/pharmacy/prescriptions/pending');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pending prescriptions' };
    }
  },

  // Get all prescriptions for pharmacy
  getPharmacyPrescriptions: async (params = {}) => {
    try {
      const response = await api.get('/pharmacy/prescriptions', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pharmacy prescriptions' };
    }
  },

  // Get single prescription for pharmacy
  getPharmacyPrescription: async (id) => {
    try {
      const response = await api.get(`/pharmacy/prescriptions/${id}`);
      return { success: true, data: response.data.data.prescription };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch prescription' };
    }
  },

  // Dispense prescription
  dispensePrescription: async (id, notes = '') => {
    try {
      const response = await api.put(`/pharmacy/prescriptions/${id}/dispense`, { notes });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to dispense prescription' };
    }
  },

  // Partially dispense prescription
  partialDispensePrescription: async (id, dispensedMedicines, notes = '') => {
    try {
      const response = await api.put(`/pharmacy/prescriptions/${id}/partial-dispense`, {
        dispensedMedicines,
        notes
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to partially dispense prescription' };
    }
  },

  // Get prescription statistics
  getPrescriptionStats: async () => {
    try {
      const response = await api.get('/prescriptions/stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch prescription statistics' };
    }
  },

  // Get pharmacy statistics
  getPharmacyStats: async () => {
    try {
      const response = await api.get('/pharmacy/stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pharmacy statistics' };
    }
  }
};
