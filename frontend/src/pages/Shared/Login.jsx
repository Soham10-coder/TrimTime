import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Scissors, Eye, EyeOff, AlertCircle, KeyRound, Store, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ defaultRole = 'customer' }) {
  const { login, logout } = useContext(AuthContext);
  
  // Tab/Role control state
  const [activeRole, setActiveRole] = useState(defaultRole);
  
  // Inputs states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Automatically reset inputs and errors when switching tabs
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setEmail('');
    setPassword('');
    setError('');
  };

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
      
      // Perform validation check to ensure user logged into the correct dashboard context
      if (activeRole === 'customer') {
        if (role !== 'customer') {
          setError(`This tab is only for Customers. Please switch to the ${role === 'admin' ? 'System Admin' : 'Barber Partner'} tab.`);
          await logout();
          return;
        }
        navigate(from, { replace: true });
      } else if (activeRole === 'barber') {
        if (role !== 'barber') {
          setError(`Access Denied: This tab is restricted to Barber Partners. Please switch to the ${role === 'admin' ? 'System Admin' : 'Customer'} tab.`);
          await logout();
          return;
        }
        navigate('/barber');
      } else if (activeRole === 'admin') {
        if (role !== 'admin') {
          setError(`Access Denied: This tab is restricted to Platform Administrators. Please switch to the ${role === 'barber' ? 'Barber Partner' : 'Customer'} tab.`);
          await logout();
          return;
        }
        navigate('/admin');
      }
    } else {
      setError(res.message || 'Invalid email/mobile or password');
    }
  };

  const successMsg = location.state?.successMsg || '';

  // Define themes dynamically based on active tab
  const getTheme = () => {
    switch (activeRole) {
      case 'barber':
        return {
          accentColor: 'from-amber-600 to-amber-500',
          focusRing: 'focus:ring-amber-500',
          btnShadow: 'shadow-amber-500/10 hover:shadow-amber-500/25',
          bgGradient: 'from-amber-50/50 to-brand-50 text-brand-900',
          cardBg: 'bg-white border-brand-200',
          headerIcon: <Store className="h-6 w-6 text-white" />,
          title: "Barber Partner Login",
          subtitle: "Manage your shop catalog, hours, and bookings",
          emailLabel: "Barber Email or Phone",
          passwordLabel: "Password",
          submitLabel: "Partner Sign In",
          submitIcon: <Sparkles className="w-4 h-4" />
        };
      case 'admin':
        return {
          accentColor: 'from-red-600 to-red-500',
          focusRing: 'focus:ring-red-500',
          btnShadow: 'shadow-red-500/10 hover:shadow-red-500/25',
          bgGradient: 'from-red-50/30 to-brand-50 text-slate-900',
          cardBg: 'bg-white border-brand-200',
          headerIcon: <ShieldCheck className="h-6 w-6 text-red-400" />,
          title: "Admin Console",
          subtitle: "Operator sign-in for platform moderation & controls",
          emailLabel: "Administrator Email",
          passwordLabel: "Secure Pin Code / Password",
          submitLabel: "Access Console",
          submitIcon: <Key className="w-4 h-4" />
        };
      case 'customer':
      default:
        return {
          accentColor: 'from-accent-600 to-accent-500',
          focusRing: 'focus:ring-accent-500',
          btnShadow: 'shadow-accent-500/10 hover:shadow-accent-500/25',
          bgGradient: 'from-accent-50/50 to-brand-50 text-brand-900',
          cardBg: 'bg-white border-brand-200',
          headerIcon: <Scissors className="h-6 w-6 text-white" />,
          title: "Customer Login",
          subtitle: "Access your appointments & rewards",
          emailLabel: "Email Address or Mobile Number",
          passwordLabel: "Password",
          submitLabel: "Log In",
          submitIcon: null
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b transition-all duration-500 ${theme.bgGradient}`}>
      
      {/* SEGMENTED TAB SWITCHER */}
      <div className="w-full max-w-md mb-6 p-1.5 bg-brand-200/50 dark:bg-brand-950/40 backdrop-blur-sm rounded-2xl flex gap-1 shadow-inner relative z-10 border border-brand-200/20">
        {[
          { key: 'customer', label: 'Customer', icon: Scissors },
          { key: 'barber', label: 'Barber Partner', icon: Store },
          { key: 'admin', label: 'Admin', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRole === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleRoleChange(tab.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
                isActive 
                  ? 'bg-white dark:bg-brand-900 text-accent-600 dark:text-accent-400 shadow-md scale-[1.02]' 
                  : 'text-brand-600 dark:text-brand-400 hover:text-brand-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* LOGIN CARD */}
      <motion.div 
        key={activeRole} // re-animate card on tab shift
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border transition-all duration-500 ${theme.cardBg}`}
      >
        <div className="text-center mb-8">
          <div className={`inline-flex p-3 bg-gradient-to-tr ${theme.accentColor} rounded-2xl mb-4 shadow-lg shadow-accent-500/10`}>
            {theme.headerIcon}
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">{theme.title}</h2>
          <p className="text-xs text-brand-500 dark:text-brand-455 mt-2">{theme.subtitle}</p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs rounded-xl border border-green-200 dark:border-green-800/40 font-semibold">
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-800/40 font-semibold">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-500 dark:text-brand-400 mb-1.5">{theme.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-brand-400" />
              <input
                type="text"
                placeholder={activeRole === 'customer' ? "you@example.com or 9876543210" : activeRole === 'barber' ? "partner@trimtime.com" : "admin@trimtime.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 ${theme.focusRing} text-brand-900 dark:text-brand-50`}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase text-brand-500 dark:text-brand-400">{theme.passwordLabel}</label>
              {activeRole !== 'admin' && (
                <Link 
                  to="/forgot-password" 
                  className={`text-xs font-bold hover:underline ${activeRole === 'barber' ? 'text-amber-500' : 'text-accent-600 dark:text-accent-400'}`}
                >
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-brand-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-11 py-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 ${theme.focusRing} text-brand-900 dark:text-brand-50`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-brand-400 hover:text-brand-600 dark:hover:text-brand-200"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 bg-gradient-to-r ${theme.accentColor} text-white font-bold rounded-xl text-xs transition-all shadow-md ${theme.btnShadow} flex justify-center items-center gap-2`}
          >
            {loading ? (
              <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {theme.submitIcon}
                <span>{theme.submitLabel}</span>
              </>
            )}
          </button>
        </form>

        {/* CUSTOM DE-CLUTTERED FOOTERS PER ROLE */}
        <div className="mt-6 pt-4 border-t border-brand-200/50 dark:border-brand-800 text-center text-xs space-y-2">
          {activeRole === 'customer' && (
            <div className="text-brand-500 dark:text-brand-400">
              New to TrimTime?{' '}
              <Link to="/signup" className="font-bold text-accent-600 dark:text-accent-400 hover:underline">
                Create Customer Account
              </Link>
            </div>
          )}

          {activeRole === 'barber' && (
            <div className="text-brand-500 dark:text-brand-400">
              Need to register your shop?{' '}
              <Link to="/barber/signup" className="font-bold text-amber-500 hover:underline">
                Join TrimTime Network
              </Link>
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="text-slate-500 text-[10px]">
              TrimTime Platform Console &bull; Operator Mode Only
            </div>
          )}
          
          <div className="pt-2">
            <Link to="/" className="text-brand-400 hover:text-brand-600 dark:hover:text-white hover:underline text-[10px] font-bold">
              &larr; Back to Homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
