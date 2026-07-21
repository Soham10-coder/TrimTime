import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('trimtime_user');
      const savedToken = localStorage.getItem('trimtime_token');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        api.setToken(savedToken);
        
        const refreshed = await api.refreshToken();
        if (!refreshed) {
          handleLogoutLocal();
        } else {
          const currentUser = localStorage.getItem('trimtime_user');
          if (currentUser) {
            setUser(JSON.parse(currentUser));
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();

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

      return { success: true, message: data.message, devOtp: data.devOtp };
    } catch (error) {
      console.error("Registration Error:", error);
      return { success: false, message: error.message };
    }
  };

  const registerBarber = async (formData) => {
    try {
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
        throw new Error(data.message || 'Verification failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("OTP Verification Error:", error);
      return { success: false, message: error.message };
    }
  };

  const resendOtp = async (email, type = 'signup') => {
    try {
      const res = await api.post('/auth/resend-otp', { email, type });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Resend failed');
      }

      return { success: true, message: data.message, devOtp: data.devOtp };
    } catch (error) {
      console.error("Resend OTP Error:", error);
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/barber/profile', formData);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Update failed');
      }

      if (data.user) {
        const updated = { ...user, ...data.user };
        localStorage.setItem('trimtime_user', JSON.stringify(updated));
        setUser(updated);
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Update Profile Error:", error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout API failed, cleaning local state:", e);
    } finally {
      handleLogoutLocal();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      registerCustomer,
      registerBarber,
      verifyOtp,
      resendOtp,
      updateProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
