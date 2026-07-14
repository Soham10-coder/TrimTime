import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Scissors, User, LogOut, Sun, Moon, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm transition-all duration-300">
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
            <span className="font-display text-xl font-bold tracking-tight text-brand-900 dark:text-brand-50">
              Trim<span className="text-accent-500">Time</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-brand-600 dark:text-brand-300 hover:text-accent-500 font-medium transition-colors">
              Home
            </Link>
            <Link to="/#barbers" className="text-brand-600 dark:text-brand-300 hover:text-accent-500 font-medium transition-colors">
              Browse Barbers
            </Link>
            
            {/* Conditional dashboard route depending on role */}
            {user && (
              <Link 
                to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'} 
                className="text-brand-600 dark:text-brand-300 hover:text-accent-500 font-medium flex items-center gap-1.5 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {!user && (
              <Link to="/barber/signup" className="text-brand-600 dark:text-brand-300 hover:text-accent-500 font-medium transition-colors">
                List Your Shop
              </Link>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-brand-500 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-brand-200 dark:border-brand-700 rounded-lg text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 hover:text-accent-500 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Log In / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-brand-500 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-600 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors"
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
            className="md:hidden glass-panel border-t border-brand-100 dark:border-brand-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-brand-700 dark:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-800"
              >
                Home
              </Link>
              <Link 
                to="/#barbers" 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-brand-700 dark:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-800"
              >
                Browse Barbers
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-accent-500 hover:bg-brand-100 dark:hover:bg-brand-800"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-brand-100 dark:hover:bg-brand-800"
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
                    className="block px-3 py-2 rounded-md text-base font-medium text-brand-700 dark:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-800"
                  >
                    List Your Shop
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-center mt-4 bg-accent-500 text-white font-semibold py-2.5 rounded-lg shadow-sm"
                  >
                    Log In
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
