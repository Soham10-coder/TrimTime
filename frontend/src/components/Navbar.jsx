import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Scissors, User, LogOut, Sun, Moon, LayoutDashboard, ShieldCheck, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const theme = 'light';
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              whileHover={{ rotate: 15 }} 
              className="p-2 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-lg text-white"
            >
              <Scissors className="h-5 w-5" />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-tight text-brand-900">
              Trim<span className="text-accent-500">Time</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-3">
            <Link 
              to="/" 
              className="text-brand-800 hover:text-accent-600 font-extrabold flex items-center gap-1.5 transition-colors text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl hover:bg-brand-100/80"
            >
              <Home className="w-4 h-4 text-accent-500" />
              <span>Home</span>
            </Link>
            {user && (
              <Link 
                to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'} 
                className="text-accent-700 font-extrabold flex items-center gap-1.5 transition-colors text-xs uppercase tracking-wider bg-accent-500/10 px-3.5 py-2 rounded-xl border border-accent-500/30 hover:bg-accent-500/20"
              >
                <LayoutDashboard className="w-4 h-4 text-accent-500" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-extrabold text-brand-900 font-display">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 border border-brand-300 rounded-xl text-xs font-extrabold text-brand-800 hover:bg-brand-100 hover:text-accent-600 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/barber/signup"
                  className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-extrabold border border-brand-300 transition-all"
                >
                  Partner Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all uppercase tracking-wider"
                >
                  Log In / Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-800 hover:bg-brand-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-brand-200 shadow-xl overflow-hidden"
          >
            <div className="px-3 pt-3 pb-5 space-y-2 sm:px-4">
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-bold text-brand-800 hover:bg-brand-100"
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link 
                    to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-bold text-accent-600 hover:bg-brand-100"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-base font-bold text-red-600 hover:bg-brand-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/barber/signup" 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-bold text-brand-800 hover:bg-brand-100"
                  >
                    List Your Shop
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 text-center mt-2 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-extrabold rounded-xl shadow-md"
                  >
                    Log In / Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
