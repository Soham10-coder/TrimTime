import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';

// Shared Pages
import LandingPage from './pages/Shared/LandingPage';
import Login from './pages/Shared/Login';
import Signup from './pages/Shared/Signup';
import VerifyOtp from './pages/Shared/VerifyOtp';
import ForgotPassword from './pages/Shared/ForgotPassword';
import ResetPassword from './pages/Shared/ResetPassword';

// Customer Pages
import BookAppointment from './pages/Customer/BookAppointment';
import CustomerDashboard from './pages/Customer/CustomerDashboard';

// Barber Pages
import BarberSignup from './pages/Barber/BarberSignup';
import BarberDashboard from './pages/Barber/BarberDashboard';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

// Secure Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950">
        <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="barber/signup" element={<BarberSignup />} />
            
            {/* Booking Flow (Public browse/select, locks inside checkout) */}
            <Route path="book/:barberId" element={<BookAppointment />} />

            {/* Secured Customer Routes */}
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Secured Barber Routes */}
            <Route 
              path="barber" 
              element={
                <ProtectedRoute allowedRoles={['barber']}>
                  <BarberDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Secured Admin Routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
