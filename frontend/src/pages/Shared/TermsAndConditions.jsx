import React from 'react';
import { ShieldCheck, FileText, CheckCircle, Scale, Clock, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 border-b border-brand-200 dark:border-brand-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300 text-xs font-bold rounded-full uppercase tracking-wider">
          <Scale className="w-4 h-4" /> Legal & Terms
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-900 dark:text-brand-50">
          Terms & Conditions
        </h1>
        <p className="text-xs text-brand-500 max-w-xl mx-auto">
          Last Updated: August 2026. Please read these terms carefully before using the TrimTime platform.
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-6 text-sm text-brand-700 dark:text-brand-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent-500" /> 1. Platform Overview
          </h2>
          <p>
            TrimTime operates an online salon discovery and appointment scheduling marketplace connecting customers with verified salon partners and barber stylists. By accessing or using our website and mobile platform, you agree to comply with these terms.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-500" /> 2. Appointment Booking & Check-In OTP
          </h2>
          <p>
            Customers can select salon services, preferred barber staff members, and real-time open 1-hour time slots. Upon payment completion, a 6-digit Check-In OTP is generated for the customer. This code must be presented at the salon upon arrival for check-in verification.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-500" /> 3. Customer Responsibilities
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Customers must arrive 5 minutes prior to their booked appointment time slot.</li>
            <li>Inaccurate or fraudulent bookings are strictly prohibited and subject to account suspension.</li>
            <li>Zero-tolerance policy for abusive behavior toward salon staff or stylists.</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-500" /> 4. Payments & Service Fees
          </h2>
          <p>
            All online payments are processed securely through Razorpay. Platform service fees and salon payouts are calculated automatically. Offline walk-in bookings reserved directly at the salon are settled in cash or store UPI.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50">5. Contact Support</h2>
          <p className="text-xs">
            If you have questions regarding these terms, please contact our support team at <a href="mailto:support@trimtime.in" className="text-accent-500 font-bold">support@trimtime.in</a> or call <span className="font-mono font-bold">+91 98765 43210</span>.
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
