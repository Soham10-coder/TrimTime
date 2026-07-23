import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-300 dark:bg-brand-950 dark:text-brand-400 border-t border-brand-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="p-2 bg-accent-500 rounded-lg">
                <Scissors className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Trim<span className="text-accent-400">Time</span>
              </span>
            </div>
            <p className="text-sm text-brand-400">
              Premium online booking experience for modern haircut shops and groomers. Elevate your schedule, simplify bookings, and enjoy styling.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent-400 transition-colors">
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="hover:text-accent-400 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-accent-400 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#barbers" className="hover:text-accent-400 transition-colors">Browse Barbers</Link></li>
              <li><Link to="/" className="hover:text-accent-400 transition-colors">Featured Hairstyles</Link></li>
              <li><Link to="/#why-choose-us" className="hover:text-accent-400 transition-colors">Why Choose Us</Link></li>
              <li><Link to="/#pricing" className="hover:text-accent-400 transition-colors">Subscription Pricing</Link></li>
            </ul>
          </div>

          {/* Business Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Partners</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/barber/signup" className="hover:text-accent-400 transition-colors">Register as Barber Shop</Link></li>
              <li><Link to="/barber/login" className="hover:text-accent-400 transition-colors">Barber Dashboard Access</Link></li>
              <li><Link to="/" className="hover:text-accent-400 transition-colors">Merchant Guidelines</Link></li>
              <li><Link to="/" className="hover:text-accent-400 transition-colors">Partner FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-500 mt-0.5" />
                <span>101 Grooming Blvd, Suite 200, Mumbai, MH</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-500" />
                <span>+91 93077 94669</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-500" />
                <span>support@trimtime.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <hr className="border-brand-800 my-8"/>
        
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-brand-400 space-y-4 sm:space-y-0">
          <p>&copy; 2026 TrimTime Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-accent-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent-400 transition-colors">Cookie settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
