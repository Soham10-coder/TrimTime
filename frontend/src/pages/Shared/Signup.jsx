import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Scissors, Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const { registerCustomer, googleLogin } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const inputEmail = prompt("Enter your Google Account email for 1-click Account Creation:", email || "customer@gmail.com");
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
        navigate('/', { replace: true });
      } else {
        setError(res.message || 'Google sign-up failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Google sign-up error occurred');
    }
  };

  const pwdCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const strengthScore = Object.values(pwdCriteria).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to create an account');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (strengthScore < 5) {
      setError('Password must meet all complexity requirements (min 8 chars, uppercase, lowercase, digit, special character)');
      setLoading(false);
      return;
    }

    const res = await registerCustomer(name, email, phone, password, gender);
    setLoading(false);

    if (res.success) {
      navigate('/verify-otp', { state: { email, type: 'signup', devOtp: res.devOtp } });
    } else {
      setError(res.message || 'Registration failed. Try again.');
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
          <h2 className="font-display text-3xl font-bold text-brand-900 dark:text-brand-50">Create Account</h2>
          <p className="text-sm text-brand-500 dark:text-brand-400 mt-2">Sign up for Luxe Style and Simple Bookings</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800/40">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-5 w-5 text-brand-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-brand-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-brand-400" />
              <input
                type="tel"
                placeholder="10 digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Gender *</label>
            <div className="grid grid-cols-3 gap-2">
              {['Male', 'Female', 'Prefer Not To Say'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                    gender === g
                      ? 'bg-brand-900 text-white border-brand-900 dark:bg-accent-600 dark:border-accent-600'
                      : 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-brand-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-brand-400 hover:text-brand-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-brand-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 rounded text-accent-500 focus:ring-accent-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              I agree to TrimTime's{' '}
              <Link to="/terms" target="_blank" className="text-accent-600 dark:text-accent-400 font-bold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" className="text-accent-600 dark:text-accent-400 font-bold hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Create Account"}
          </button>

          {/* Google Sign In Option */}
          <div className="mt-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-brand-200/80 dark:border-brand-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-extrabold text-brand-400 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-brand-200/80 dark:border-brand-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3 px-4 bg-white dark:bg-brand-900 hover:bg-brand-50 dark:hover:bg-brand-850 text-brand-900 dark:text-brand-100 border border-brand-200/90 dark:border-brand-750 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow"
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
        </form>

        <p className="mt-8 text-center text-sm text-brand-600 dark:text-brand-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
