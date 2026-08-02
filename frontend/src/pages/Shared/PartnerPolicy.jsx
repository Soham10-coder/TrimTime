import React from 'react';
import { Store, Percent, Calendar, CheckCircle2, DollarSign, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartnerPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 border-b border-brand-200 dark:border-brand-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300 text-xs font-bold rounded-full uppercase tracking-wider">
          <Store className="w-4 h-4" /> Salon Partner Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-900 dark:text-brand-50">
          Salon Partner Terms & Policy
        </h1>
        <p className="text-xs text-brand-500 max-w-xl mx-auto">
          Clear, transparent guidelines for salon owners and barber partners operating on TrimTime.
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-6 text-sm text-brand-700 dark:text-brand-300 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Percent className="w-5 h-5 text-accent-500" /> 1. Platform Fees & Direct Razorpay Split Payouts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-2xl space-y-1">
              <span className="text-accent-500 font-extrabold block text-sm">Online Bookings: Razorpay Route 90/10 Split</span>
              <p className="text-xs text-brand-600 dark:text-brand-400">
                Via Razorpay Route, customer payments are automatically split: <strong>10% platform fee</strong> goes to TrimTime HQ and <strong>90% net payout</strong> goes directly into your salon's linked bank account.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold block text-sm">Offline Walk-In Bookings: 0% Fee</span>
              <p className="text-xs text-brand-600 dark:text-brand-400">
                Bookings created via the "Book Walk-In" tool on your dashboard incur <strong>0% fee</strong>. You keep 100% of offline cash payments!
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-500" /> 2. Staff Shifts & Lunch Break Management
          </h2>
          <p>
            Salons must keep staff shift hours (Start Time, End Time) and Lunch Break schedules updated under the Staff Management tab to avoid scheduling conflicts. The platform automatically blocks out lunch breaks and holiday dates from customer slot selection.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent-500" /> 3. Check-In OTP Verification
          </h2>
          <p className="text-xs">
            Salon staff must verify the customer's 6-digit Check-In OTP code upon arrival. Verifying the OTP marks the appointment as "Completed" and triggers the payout calculation for that booking.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-accent-500" /> 4. Partner Standards & Quality
          </h2>
          <p className="text-xs">
            Salons must maintain clean, hygienic facilities and honor confirmed customer appointments. Repeated unexcused appointment refusals or poor rating scores below 3.0★ may lead to temporary shop suspension.
          </p>
        </section>

      </div>

      <div className="text-center">
        <Link to="/barber/signup" className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-extrabold rounded-xl text-xs inline-block shadow-md">
          List Your Salon Shop Now →
        </Link>
      </div>
    </div>
  );
}
