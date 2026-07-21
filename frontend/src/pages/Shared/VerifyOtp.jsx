import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { KeyRound, Mail, AlertCircle, CheckCircle2, Sparkles, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useContext(AuthContext);
  const location = useLocation();

  const [email, setEmail] = useState(() => {
    return location.state?.email || localStorage.getItem('pending_verify_email') || '';
  });
  const [isEditingEmail, setIsEditingEmail] = useState(!email);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();
  const otpType = location.state?.type || 'signup';
  const devOtp = location.state?.devOtp || null;

  useEffect(() => {
    if (email) {
      localStorage.setItem('pending_verify_email', email);
    }
  }, [email]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (otp.length !== 6 || isNaN(otp)) {
      setError('Please enter a valid 6-digit verification code');
      setLoading(false);
      return;
    }

    const res = await verifyOtp(email, otp, otpType);
    setLoading(false);

    if (res.success) {
      localStorage.removeItem('pending_verify_email');
      setSuccess('Account verified successfully! Redirecting...');
      setTimeout(() => {
        if (otpType === 'reset') {
          navigate('/reset-password', { state: { email, otp } });
        } else {
          navigate('/login');
        }
      }, 1500);
    } else {
      setError(res.message || 'Verification failed. Please check the code.');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address to resend OTP.');
      return;
    }
    setError('');
    setSuccess('');
    const res = await resendOtp(email, otpType);
    if (res.success) {
      setSuccess('New verification code sent to your email.');
      setTimer(60);
    } else {
      setError(res.message || 'Failed to resend code');
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
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-bold text-brand-900 dark:text-brand-50">Verify Email</h2>
          <p className="text-sm text-brand-500 dark:text-brand-400 mt-2">
            Enter the 6-digit code sent to your registered email
          </p>
        </div>

        {/* Email Edit Header Box */}
        <div className="mb-6 p-3 bg-brand-50 dark:bg-brand-950 rounded-xl border border-brand-200 dark:border-brand-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Mail className="w-4 h-4 text-accent-500 flex-shrink-0" />
            {isEditingEmail ? (
              <input
                type="email"
                placeholder="Enter email to verify..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold focus:outline-none text-brand-900 dark:text-brand-50"
              />
            ) : (
              <span className="text-sm font-semibold text-brand-900 dark:text-brand-100 truncate">{email}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditingEmail(!isEditingEmail)}
            className="p-1.5 text-accent-600 dark:text-accent-400 hover:bg-brand-200/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditingEmail ? 'Save' : 'Change'}
          </button>
        </div>

        {/* DEV OTP HELPER BOX */}
        {devOtp && (
          <div className="p-4 mb-6 bg-accent-50 dark:bg-brand-950 text-accent-800 dark:text-accent-300 text-xs rounded-xl border border-accent-200 dark:border-accent-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-accent-600" />
              <span>Dev / Test Mode Verification Code</span>
            </div>
            <p className="text-[11px] text-brand-600 dark:text-brand-400">
              Your 6-digit OTP code is: <b className="font-mono text-sm tracking-widest text-brand-900 dark:text-brand-50">{devOtp}</b>
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800/40">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm rounded-xl border border-green-200 dark:border-green-800/40">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              placeholder="0 0 0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl font-bold tracking-[8px] py-3.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Confirm & Verify"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-600 dark:text-brand-400 space-y-3">
          <div>
            Didn't receive the email?{' '}
            {timer > 0 ? (
              <span className="text-brand-400 font-semibold">Resend code in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="font-semibold text-accent-600 dark:text-accent-400 hover:underline focus:outline-none"
              >
                Resend Code
              </button>
            )}
          </div>
          <div>
            <Link to="/login" className="text-xs font-semibold text-brand-500 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
