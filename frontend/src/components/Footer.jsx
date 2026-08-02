import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Mail, Phone, MapPin, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-brand-950 text-brand-600 dark:text-brand-400 border-t border-brand-200 dark:border-brand-850 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-brand-900 dark:text-brand-50">
              <div className="p-2 bg-gradient-to-r from-accent-600 to-accent-500 rounded-xl text-white shadow-md">
                <Scissors className="h-5 w-5" />
              </div>
              <span className="font-display text-2xl font-black tracking-tight">
                Trim<span className="text-accent-500">Time</span>
              </span>
            </div>
            <p className="text-xs text-brand-500 dark:text-brand-400 leading-relaxed font-medium">
              India's premier salon & grooming booking platform. Book top-rated barbers, pick open slots, and enjoy 0 wait time.
            </p>
            
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Razorpay Secured Payments</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black text-brand-900 dark:text-brand-100 uppercase tracking-wider mb-4">Discover</h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="/#search-barber" className="hover:text-accent-500 transition-colors">Browse Partner Salons</a></li>
              <li><a href="/#how-it-works" className="hover:text-accent-500 transition-colors">How TrimTime Works</a></li>
              <li><a href="/#why-choose-us" className="hover:text-accent-500 transition-colors">Why Choose Us</a></li>
              <li><Link to="/login" className="hover:text-accent-500 transition-colors">Customer Portal Login</Link></li>
            </ul>
          </div>

          {/* Business & Partner Links */}
          <div>
            <h3 className="text-xs font-black text-brand-900 dark:text-brand-100 uppercase tracking-wider mb-4">For Salon Partners</h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link to="/barber/signup" className="hover:text-accent-500 transition-colors flex items-center gap-1">
                  <span>List Your Salon Shop</span>
                  <ExternalLink className="w-3 h-3 text-accent-500" />
                </Link>
              </li>
              <li><Link to="/login" className="hover:text-accent-500 transition-colors">Partner Dashboard Access</Link></li>
              <li><Link to="/partner-policy" className="hover:text-accent-500 transition-colors">Salon Partner Terms & Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-black text-brand-900 dark:text-brand-100 uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-xs font-semibold">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                <span>TrimTime Tech HQ, MG Road, Pune, Maharashtra 411001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <a href="mailto:support@trimtime.in" className="hover:text-accent-500 transition-colors">
                  support@trimtime.in
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        <hr className="border-brand-200 dark:border-brand-850 my-8"/>
        
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-brand-500 dark:text-brand-400 space-y-4 sm:space-y-0 font-medium">
          <p>&copy; 2026 TrimTime Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-bold">
            <Link to="/terms" className="hover:text-accent-500 transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-accent-500 transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-accent-500 transition-colors">Cancellation & Refund Policy</Link>
            <Link to="/partner-policy" className="hover:text-accent-500 transition-colors">Partner Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
