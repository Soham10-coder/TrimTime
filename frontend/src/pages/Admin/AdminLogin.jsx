import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, AlertCircle, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
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
      if (role !== 'admin') {
        setError(`Access Denied: This portal is restricted to platform Administrators. Please use the ${role === 'barber' ? 'Barber' : 'Customer'} Login page.`);
        await logout();
        return;
      }
      navigate('/admin');
    } else {
      setError(res.message || 'Invalid administrator email or password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-slate-700 to-slate-500 rounded-2xl text-white mb-4 shadow-lg shadow-slate-500/10">
            <ShieldCheck className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white tracking-tight">Admin Console</h2>
          <p className="text-sm text-slate-400 mt-2">Operator sign-in for platform moderation and billing controls</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-950/50 text-red-400 text-sm rounded-xl border border-red-900/40">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                placeholder="admin@trimtime.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white font-medium"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-300">Secure Pin Code/Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/25 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Access Console
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <Link to="/login" className="text-slate-400 hover:text-white hover:underline">
              Customer Portal
            </Link>
            <span className="text-slate-800">|</span>
            <Link to="/barber/login" className="text-slate-400 hover:text-white hover:underline">
              Barber Portal
            </Link>
            <span className="text-slate-800">|</span>
            <Link to="/" className="text-slate-400 hover:text-white hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
