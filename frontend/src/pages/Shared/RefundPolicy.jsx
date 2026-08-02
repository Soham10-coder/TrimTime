import React from 'react';
import { RefreshCw, CheckCircle, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 border-b border-brand-200 dark:border-brand-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full uppercase tracking-wider">
          <RefreshCw className="w-4 h-4" /> Cancellation & Refund Policy
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-900 dark:text-brand-50">
          Cancellation & Refund Policy
        </h1>
        <p className="text-xs text-brand-500 max-w-xl mx-auto">
          Transparent, automated refund rules for all TrimTime online salon bookings.
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-6 text-sm text-brand-700 dark:text-brand-300 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-500" /> 1. Full 100% Automated Refund
          </h2>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
            <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">
              Anytime 24-Hour Advance Cancellation Rule:
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-300">
              Customers can cancel any appointment up to <strong>24 hours prior to the slot time</strong> directly through their Customer Dashboard. A <strong>100% full refund</strong> will be initiated automatically to your original payment method (GPay, PhonePe, Card, NetBanking).
            </p>
          </div>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> 2. Refund Processing Time
          </h2>
          <p>
            Once a cancellation is requested, our automated system processes the refund immediately. Refund credit usually reflects in your bank account or UPI app within <strong>24 hours</strong>.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> 3. Late Cancellations & No-Shows
          </h2>
          <p className="text-xs">
            Cancellations made less than 24 hours prior to the booked slot time are non-refundable to protect the stylist's reserved time and salon operations. If a salon partner cancels an appointment due to unforeseen circumstances, a 100% full refund is issued immediately regardless of time.
          </p>
        </section>

        <section className="space-y-2 border-t border-brand-100 dark:border-brand-850 pt-6">
          <h2 className="text-lg font-bold text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" /> 4. Need Assistance?
          </h2>
          <p className="text-xs">
            If your refund does not reflect within 24 hours, contact our billing team at <a href="mailto:support@trimtime.in" className="text-amber-600 font-bold">support@trimtime.in</a> with your Booking ID.
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
