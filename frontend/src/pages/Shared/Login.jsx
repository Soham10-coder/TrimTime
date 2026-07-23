import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Scissors, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, logout } = useContext(AuthContext);
  const [email, setEmail] = useState(''); // Can be email or mobile phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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
      if (role !== 'customer') {
        setError(`This login portal is only for Customers. Please use the ${role === 'admin' ? 'Admin' : 'Barber'} Login page.`);
        await logout();
        return;
      }
      navigate(from, { replace: true });
    } else {
      if (res.code === 'UNVERIFIED') {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(res.message || 'Invalid email/mobile or password');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50 to-brand-100 dark:from-brand-900 dark:to-brand-950 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-brand-900 p-8 rounded-2xl shadow-xl border border-brand-200 dark:border-brand-800"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-2xl text-white mb-4">
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-bold text-brand-900 dark:text-brand-50">Customer Login</h2>
          <p className="text-sm text-brand-500 dark:text-brand-400 mt-2">Access your appointments & rewards</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800/40">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1.5">Email Address or Mobile Number</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-400" />
              <input
                type="text"
                placeholder="you@example.com or 9876543210"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-brand-700 dark:text-brand-300">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-500"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-brand-400 hover:text-brand-600 dark:hover:text-brand-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-accent-500/10 hover:shadow-accent-500/25 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-600 dark:text-brand-400 space-y-2">
          <div>
            Need to verify your email?{' '}
            <Link to="/verify-otp" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline inline-flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Verify OTP Here
            </Link>
          </div>
          <div>
            New to TrimTime?{' '}
            <Link to="/signup" className="font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-500">
              Create Customer Account
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-brand-100 dark:border-brand-800 text-center text-xs text-brand-500 space-y-2">
          <div>
            Are you a Barber Partner?{' '}
            <Link to="/barber/login" className="font-bold text-accent-600 dark:text-accent-400 hover:underline">
              Barber Portal Login
            </Link>
          </div>
          <div>
            System Administrator?{' '}
            <Link to="/admin/login" className="font-bold text-accent-600 dark:text-accent-400 hover:underline">
              Admin Portal Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
