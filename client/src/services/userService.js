import api from './api';

export const userService = {
  // Get all users (admin only)
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch users' };
    }
  },

  // Get single user (admin only)
  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return { success: true, data: response.data.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user' };
    }
  },

  // Update user (admin only)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return { success: true, data: response.data.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update user' };
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete user' };
    }
  },

  // Toggle user status (admin only)
  toggleUserStatus: async (id) => {
    try {
      const response = await api.put(`/users/${id}/toggle-status`);
      return { success: true, data: response.data.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to toggle user status' };
    }
  },

  // Create user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create user' };
    }
  },

  // Get users by role (admin only)
  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch users by role' };
    }
  }
};
