import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth states from localstorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('trimtime_user');
      const savedToken = localStorage.getItem('trimtime_token');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        api.setToken(savedToken);
        
        // Attempt a background token refresh to verify session
        const refreshed = await api.refreshToken();
        if (!refreshed) {
          // If refresh fails, session is expired
          handleLogoutLocal();
        } else {
          // Update details from server if needed
          const currentToken = api.getToken();
          const currentUser = localStorage.getItem('trimtime_user');
          if (currentUser) {
            setUser(JSON.parse(currentUser));
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to session expired events from API client
    const handleSessionExpired = () => {
      handleLogoutLocal();
      alert("Your session has expired. Please log in again.");
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const handleLogoutLocal = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('trimtime_user');
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      api.setToken(data.accessToken);
      localStorage.setItem('trimtime_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: error.message };
    }
  };

  const registerCustomer = async (name, email, phone, password, gender = 'Male') => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password, gender });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Registration Error:", error);
      return { success: false, message: error.message };
    }
  };

  const registerBarber = async (formData) => {
    try {
      // Form Data upload
      const res = await api.post('/barber/register', formData);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Barber registration failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Barber Registration Error:", error);
      return { success: false, message: error.message };
    }
  };

  const verifyOtp = async (email, otp, type = 'signup') => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp, type });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resendOtp = async (email, type = 'signup') => {
    try {
      const res = await api.post('/auth/resend-otp', { email, type });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      console.error("Server logout error:", e);
    } finally {
      handleLogoutLocal();
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/barber/profile', formData);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update user details locally
      localStorage.setItem('trimtime_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerCustomer,
        registerBarber,
        verifyOtp,
        resendOtp,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
