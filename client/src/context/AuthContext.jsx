import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = authService.getStoredUser();
    const token = authService.getStoredToken();
    
    if (storedUser && token) {
      setUser(storedUser);
      // Verify token is still valid by getting profile
      authService.getProfile()
        .then(result => {
          if (result.success) {
            setUser(result.user);
            localStorage.setItem('hospital_user', JSON.stringify(result.user));
          } else {
            // Token is invalid, clear storage
            authService.logout();
            setUser(null);
          }
        })
        .catch(() => {
          // Token is invalid, clear storage
          authService.logout();
          setUser(null);
        });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        toast.success('Login successful!');
        return { success: true, user: result.user };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        toast.success('User registered successfully!');
        return { success: true, user: result.user };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.user);
        toast.success('Profile updated successfully!');
        return { success: true, user: result.user };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to change password');
      return { success: false, error: error.message };
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      reception: 'Reception Staff',
      checkerDoctor: 'Checker Doctor',
      labTech: 'Lab Technician',
      mainDoctor: 'Main Doctor',
      pharmacy: 'Pharmacist',
      admin: 'Administrator'
    };
    return roleNames[role] || role;
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    const permissions = {
      admin: ['all'],
      reception: ['patients', 'visits', 'payments'],
      checkerDoctor: ['visits', 'patients'],
      labTech: ['lab_tests'],
      mainDoctor: ['prescriptions', 'visits'],
      pharmacy: ['prescriptions', 'medicines']
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    getRoleDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};