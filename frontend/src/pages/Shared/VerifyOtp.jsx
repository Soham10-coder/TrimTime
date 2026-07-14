import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { KeyRound, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otpType = location.state?.type || 'signup';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer for Resend code button
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

    if (otp.length !== 6 || isNaN(otp)) {
      setError('Please enter a valid 6-digit verification code');
      setLoading(false);
      return;
    }

    const res = await verifyOtp(email, otp, otpType);
    setLoading(false);

    if (res.success) {
      setSuccess('Account verified successfully! Redirecting...');
      setTimeout(() => {
        if (otpType === 'reset') {
          // Reset password flow directs to Reset Password screen
          navigate('/reset-password', { state: { email, otp } });
        } else {
          // Signup directs to Login screen
          navigate('/login');
        }
      }, 2000);
    } else {
      setError(res.message || 'Verification failed. Please check the code.');
    }
  };

  const handleResend = async () => {
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
            Enter the 6-digit code sent to <br/>
            <span className="font-semibold text-brand-700 dark:text-brand-300">{email}</span>
          </p>
        </div>

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

        <div className="mt-8 text-center text-sm text-brand-600 dark:text-brand-400">
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
      </motion.div>
    </div>
  );
}
