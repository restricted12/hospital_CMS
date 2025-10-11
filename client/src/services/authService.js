import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('hospital_token', token);
      localStorage.setItem('hospital_user', JSON.stringify(user));
      
      return { success: true, user, token };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  // Register user (admin only)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, user: response.data.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, user: response.data.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get profile' };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/me', profileData);
      const updatedUser = response.data.data.user;
      
      // Update stored user data
      localStorage.setItem('hospital_user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to change password' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('hospital_token');
  },

  // Get stored user
  getStoredUser: () => {
    const userStr = localStorage.getItem('hospital_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('hospital_token');
  }
};
