import api from './api';

export const medicineService = {
  // Get all medicines
  getMedicines: async (params = {}) => {
    try {
      const response = await api.get('/pharmacy/medicines', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch medicines' };
    }
  },

  // Get single medicine
  getMedicine: async (id) => {
    try {
      const response = await api.get(`/pharmacy/medicines/${id}`);
      return { success: true, data: response.data.data.medicine };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch medicine' };
    }
  },

  // Update medicine stock
  updateMedicineStock: async (id, stock, operation = 'set') => {
    try {
      const response = await api.put(`/pharmacy/medicines/${id}/stock`, { stock, operation });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update medicine stock' };
    }
  }
};
