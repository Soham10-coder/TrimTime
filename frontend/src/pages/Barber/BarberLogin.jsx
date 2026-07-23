import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Scissors, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BarberLogin() {
  const { login, logout } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const role = res.user.role;
      if (role !== 'barber') {
        setError(`This portal is restricted to Barber Partners. Please use the ${role === 'admin' ? 'Admin' : 'Customer'} Login page.`);
        await logout();
        return;
      }
      navigate('/barber');
    } else {
      if (res.code === 'UNVERIFIED') {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(res.message || 'Invalid email/mobile or password');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-900 to-brand-950 text-brand-100 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-brand-900 p-8 rounded-2xl shadow-2xl border border-brand-800"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-2xl text-white mb-4 shadow-lg shadow-amber-500/20">
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white">Barber Partner Login</h2>
          <p className="text-sm text-brand-400 mt-2">Manage your shop catalog, hours, and bookings</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-950/40 text-red-400 text-sm rounded-xl border border-red-800/40">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-300 mb-1.5">Barber Email or Phone</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-500" />
              <input
                type="text"
                placeholder="partner@trimtime.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-950 border border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-brand-300">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-amber-500 hover:text-amber-400"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-brand-950 border border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-brand-500 hover:text-brand-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Partner Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-brand-800 text-center text-xs text-brand-400 space-y-3">
          <div>
            Need to register your shop?{' '}
            <Link to="/barber/signup" className="font-bold text-amber-500 hover:underline">
              Join TrimTime Network
            </Link>
          </div>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <Link to="/login" className="text-brand-300 hover:text-white hover:underline">
              Customer Login
            </Link>
            <span className="text-brand-700">|</span>
            <Link to="/admin/login" className="text-brand-300 hover:text-white hover:underline">
              Admin Portal
            </Link>
            <span className="text-brand-700">|</span>
            <Link to="/" className="text-brand-300 hover:text-white hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
