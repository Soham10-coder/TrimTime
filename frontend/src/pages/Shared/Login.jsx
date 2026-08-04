import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Scissors, Eye, EyeOff, AlertCircle, KeyRound, Store, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ defaultRole = 'customer' }) {
  const { login, logout, googleLogin } = useContext(AuthContext);
  
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

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const inputEmail = prompt("Enter your Google Account email for instant 1-click Sign In:", email || "customer@gmail.com");
      if (!inputEmail) {
        setLoading(false);
        return;
      }
      const res = await googleLogin({
        email: inputEmail,
        name: inputEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inputEmail}`
      });
      setLoading(false);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Google sign-in failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Google sign-in error occurred');
    }
  };

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
      if (res.code === 'UNVERIFIED') {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(res.message || 'Invalid email/mobile or password');
      }
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
      <div className="w-full max-w-md mb-6 p-1.5 bg-brand-200/60 backdrop-blur-sm rounded-2xl flex gap-1 shadow-inner relative z-10 border border-brand-200">
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
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all relative ${
                isActive 
                  ? 'bg-white text-brand-900 shadow-md scale-[1.02]' 
                  : 'text-brand-700 hover:text-brand-900'
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
        className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-brand-200 transition-all duration-500"
      >
        <div className="text-center mb-8">
          <div className={`inline-flex p-3 bg-gradient-to-tr ${theme.accentColor} rounded-2xl mb-4 shadow-lg shadow-accent-500/10`}>
            {theme.headerIcon}
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-900">{theme.title}</h2>
          <p className="text-xs text-brand-600 mt-2 font-medium">{theme.subtitle}</p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 text-green-800 text-xs rounded-xl border border-green-200 font-semibold">
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 font-semibold">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-700 mb-1.5">{theme.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-brand-400" />
              <input
                type="text"
                placeholder={activeRole === 'customer' ? "you@example.com or 9876543210" : activeRole === 'barber' ? "partner@trimtime.com" : "admin@trimtime.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${theme.focusRing} text-brand-900 font-medium`}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase text-brand-700">{theme.passwordLabel}</label>
              {activeRole !== 'admin' && (
                <Link 
                  to="/forgot-password" 
                  className={`text-xs font-bold hover:underline ${activeRole === 'barber' ? 'text-amber-600' : 'text-accent-600'}`}
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
                className={`w-full pl-11 pr-11 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${theme.focusRing} text-brand-900 font-medium`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-brand-400 hover:text-brand-600"
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

          {/* Google 1-Click Sign In Option for Customers */}
          {activeRole === 'customer' && (
            <div className="mt-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brand-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-extrabold text-brand-400 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-brand-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </form>

        {/* CUSTOM DE-CLUTTERED FOOTERS PER ROLE */}
        <div className="mt-6 pt-4 border-t border-brand-200 text-center text-xs space-y-2">
          {activeRole === 'customer' && (
            <div className="text-brand-600 font-medium">
              New to TrimTime?{' '}
              <Link to="/signup" className="font-bold text-accent-600 hover:underline">
                Create Customer Account
              </Link>
            </div>
          )}

          {activeRole === 'barber' && (
            <div className="text-brand-600 font-medium">
              Need to register your shop?{' '}
              <Link to="/barber/signup" className="font-bold text-amber-600 hover:underline">
                Join TrimTime Network
              </Link>
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="text-brand-500 text-[10px] font-medium">
              TrimTime Platform Console &bull; Operator Mode Only
            </div>
          )}
          
          <div className="pt-2">
            <Link to="/" className="text-brand-500 hover:text-brand-900 hover:underline text-[10px] font-extrabold">
              &larr; Back to Homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
