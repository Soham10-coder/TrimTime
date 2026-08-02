import React from 'react';
import { Lock, Shield, Eye, Database, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 border-b border-brand-200 dark:border-brand-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Data Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-900 dark:text-brand-50">
          Privacy Policy
        </h1>
        <p className="text-xs text-brand-500 max-w-xl mx-auto">
          We value your trust. Here is how TrimTime collects, uses, and safeguards your personal data.
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-6 text-sm text-brand-700 dark:text-brand-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-500" /> 1. Information We Collect
          </h2>
          <p>
            When you register on TrimTime as a customer or salon partner, we collect your name, phone number, email address, and optional profile picture. Location data (GPS coordinates) is requested only to help you find nearby salons on the interactive map.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" /> 2. How Your Data Is Used
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>To facilitate appointment bookings and generate instant 6-digit Check-In OTP codes.</li>
            <li>To send booking confirmation emails and SMS/OTP verification notifications.</li>
            <li>To allow salon owners to identify arriving customers for appointment check-ins.</li>
            <li>We NEVER sell or rent your personal information to third-party advertisers.</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> 3. Payment Security & Encryption
          </h2>
          <p>
            All financial transactions are handled securely by Razorpay. TrimTime does not store credit card numbers, CVV codes, or UPI PINs on our servers.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50">4. Privacy Inquiries</h2>
          <p className="text-xs">
            For data removal requests or privacy concerns, contact our Data Protection Officer at <a href="mailto:support@trimtime.in" className="text-emerald-600 font-bold">support@trimtime.in</a>.
          </p>
        </section>

      </div>

      <div className="text-center">
        <Link to="/" className="px-6 py-2.5 bg-brand-100 dark:bg-brand-800 text-brand-900 dark:text-brand-100 font-bold rounded-xl text-xs inline-block">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}
