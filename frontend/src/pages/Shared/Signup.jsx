import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Scissors, Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const { registerCustomer } = useContext(AuthContext);
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

  // Password criteria check
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
      navigate('/verify-otp', { state: { email, type: 'signup' } });
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
                      ? 'bg-accent-500 text-white border-accent-600 shadow-sm'
                      : 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800 hover:border-accent-400'
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
                placeholder="Strong password required"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-brand-400 hover:text-brand-600 dark:hover:text-brand-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2.5 p-3 bg-brand-50 dark:bg-brand-950/60 rounded-xl border border-brand-200 dark:border-brand-800">
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-brand-600 dark:text-brand-400">
                  <span>Password Strength</span>
                  <span className={strengthScore === 5 ? "text-emerald-600 font-bold" : "text-amber-500"}>
                    {strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="w-full bg-brand-200 dark:bg-brand-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      strengthScore <= 2 ? 'bg-red-500 w-1/3' : strengthScore <= 4 ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
                    }`}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                  <span className={pwdCriteria.length ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-brand-400 flex items-center gap-1"}>
                    {pwdCriteria.length ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Min 8 Chars
                  </span>
                  <span className={pwdCriteria.uppercase ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-brand-400 flex items-center gap-1"}>
                    {pwdCriteria.uppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 1 Uppercase
                  </span>
                  <span className={pwdCriteria.lowercase ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-brand-400 flex items-center gap-1"}>
                    {pwdCriteria.lowercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 1 Lowercase
                  </span>
                  <span className={pwdCriteria.number && pwdCriteria.special ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-brand-400 flex items-center gap-1"}>
                    {pwdCriteria.number && pwdCriteria.special ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Digit & Symbol
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-brand-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
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
              className="mt-1 h-4 w-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500"
            />
            <label htmlFor="terms" className="text-xs text-brand-600 dark:text-brand-400 leading-snug">
              I agree to the <a href="#" className="underline text-accent-600 dark:text-accent-400">Terms & Conditions</a> and <a href="#" className="underline text-accent-600 dark:text-accent-400">Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-600 dark:text-brand-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
