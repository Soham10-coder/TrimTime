import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Calendar, Clock, MapPin, Receipt, Star, X, AlertTriangle, ShieldCheck, StarOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalId, setCancelModalId] = useState(null);
  
  // Rating Modal states
  const [ratingBooking, setRatingBooking] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  
  useEffect(() => {
    fetchCustomerBookings();
  }, []);

  const fetchCustomerBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/booking/customer');
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (e) {
      console.error("Failed to load customer bookings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const res = await api.post('/booking/cancel', { bookingId });
      if (res.ok) {
        alert("Booking cancelled successfully! A refund has been processed if applicable.");
        fetchCustomerBookings();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (e) {
      alert("Error cancelling booking.");
    } finally {
      setCancelModalId(null);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    
    try {
      const res = await api.post('/barber/rate', {
        barberId: ratingBooking.barberId,
        rating: ratingStars,
        comment: ratingComment
      });
      
      if (res.ok) {
        setReviewSuccess('Thank you! Your review has been submitted.');
        setTimeout(() => {
          setRatingBooking(null);
          setRatingComment('');
        }, 1500);
      } else {
        const data = await res.json();
        setReviewError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewError('Failed to send review.');
    }
  };

  // Generate printable HTML invoice
  const downloadInvoice = (b) => {
    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
      <html>
      <head>
        <title>Invoice - ${b.bookingId}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c1917; padding: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #d97706; }
          .title { font-size: 28px; text-align: right; text-transform: uppercase; color: #78716c; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .details div { width: 45%; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { background: #f5f5f4; text-align: left; padding: 12px; font-weight: bold; border-bottom: 1px solid #d6d3d1; }
          .table td { padding: 12px; border-bottom: 1px solid #e7e5e4; }
          .total-box { float: right; width: 30%; font-size: 16px; border-top: 2px solid #d6d3d1; padding-top: 15px; margin-top: 20px; }
          .total-box div { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .total-price { font-size: 20px; font-weight: bold; color: #d97706; }
          .footer { text-align: center; margin-top: 80px; font-size: 12px; color: #a8a29e; border-t: 1px solid #e7e5e4; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">TrimTime Platform</div>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #78716c;">Online Grooming Partner</p>
          </div>
          <div class="title">Invoice Receipt</div>
        </div>

        <div class="details">
          <div>
            <h4 style="margin: 0 0 8px 0; color: #78716c;">Shop Location:</h4>
            <strong style="font-size: 16px;">${b.barber.shopName}</strong>
            <p style="margin: 4px 0;">${b.barber.address}</p>
          </div>
          <div style="text-align: right;">
            <h4 style="margin: 0 0 8px 0; color: #78716c;">Invoice Details:</h4>
            <p style="margin: 4px 0;"><b>Invoice ID:</b> #${b.bookingId}</p>
            <p style="margin: 4px 0;"><b>Date Booked:</b> ${b.date}</p>
            <p style="margin: 4px 0;"><b>Time Slot:</b> ${b.timeSlot}</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description (Hairstyle Service)</th>
              <th>Duration</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${b.hairstyle.name}</td>
              <td>${b.hairstyle.duration} minutes</td>
              <td style="text-align: right;">₹${b.price.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div>
            <span>Subtotal:</span>
            <span>₹${b.price.toFixed(2)}</span>
          </div>
          <div>
            <span>Discount Applied:</span>
            <span>- ₹${(b.price - b.price).toFixed(2)}</span>
          </div>
          <div class="total-price" style="margin-top: 10px;">
            <span>Total Paid:</span>
            <span>₹${b.price.toFixed(2)}</span>
          </div>
        </div>

        <div style="clear: both;"></div>

        <div class="footer">
          <p>Thank you for using TrimTime. Please present the QR code in your dashboard to redeem this service.</p>
          <p>&copy; 2026 TrimTime Inc. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const getPointsBalance = () => {
    // Check if points exist or mock
    return user ? user.loyaltyPoints || 30 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter Active vs Past bookings
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* 1. CUSTOMER PROFILE HEADER */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-full flex items-center justify-center text-white text-2xl font-bold font-display">
            {user?.name ? user.name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50">{user?.name}</h1>
            <p className="text-sm text-brand-500 dark:text-brand-400">{user?.email}</p>
          </div>
        </div>
        
        {/* Loyalty Points tracker card */}
        <div className="bg-brand-900 dark:bg-brand-800 text-white p-4 rounded-2xl flex items-center gap-4 border border-brand-800">
          <div className="p-2.5 bg-accent-500/20 text-accent-500 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-brand-400 font-bold uppercase tracking-wider block">Loyalty Points Balance</span>
            <span className="text-2xl font-extrabold font-display text-accent-400">{getPointsBalance()} pts</span>
          </div>
        </div>
      </div>

      {/* 2. APPOINTMENTS TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Bookings Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50">Active Appointments</h2>
          
          {activeBookings.length === 0 ? (
            <div className="text-center py-12 bg-white/40 dark:bg-brand-900/40 rounded-2xl border border-brand-200 dark:border-brand-800 text-brand-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-brand-400" />
              <p className="text-sm font-semibold">No active bookings scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((b) => (
                <div 
                  key={b.id} 
                  className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="flex gap-4 items-start">
                    <img src={b.barber.profilePic || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=100'} className="w-14 h-14 rounded-xl object-cover" alt="Shop avatar" />
                    <div>
                      <span className="text-[10px] font-bold text-accent-500 uppercase tracking-widest">{b.hairstyle.name}</span>
                      <h3 className="font-bold text-brand-900 dark:text-brand-50 font-display mt-0.5">{b.barber.shopName}</h3>
                      
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-brand-600 dark:text-brand-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-accent-500" />{b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent-500" />{b.timeSlot} ({b.hairstyle.duration} mins)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-4">
                    <span className="font-bold text-brand-900 dark:text-brand-50 font-display text-lg">₹{b.price}</span>
                    
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => downloadInvoice(b)}
                        className="flex-grow sm:flex-grow-0 px-3 py-1.5 bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 hover:text-accent-500 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Invoice
                      </button>
                      <button
                        onClick={() => setCancelModalId(b.id)}
                        className="flex-grow sm:flex-grow-0 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold"
                      >
                        Cancel Slot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Bookings */}
          <h2 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50 pt-6">Grooming History</h2>
          {pastBookings.length === 0 ? (
            <p className="text-brand-400 text-sm italic">No past appointments recorded.</p>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((b) => (
                <div 
                  key={b.id} 
                  className="bg-brand-50/50 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800/60 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-80"
                >
                  <div className="flex gap-4">
                    <img src={b.barber.profilePic || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=100'} className="w-12 h-12 rounded-xl object-cover grayscale" alt="Shop avatar" />
                    <div>
                      <h4 className="font-bold text-brand-800 dark:text-brand-200 font-display">{b.barber.shopName}</h4>
                      <p className="text-xs text-brand-500 mt-1">{b.hairstyle.name} &bull; {b.date} &bull; {b.timeSlot}</p>
                      
                      {/* Status pill */}
                      <span className={`inline-block mt-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        b.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-4">
                    <span className="font-bold text-brand-800 dark:text-brand-200 font-display">₹{b.price}</span>
                    
                    {b.status === 'completed' && (
                      <button
                        onClick={() => setRatingBooking({ id: b.id, barberId: b.barber_id || b.barberId || 'mockid', shopName: b.barber.shopName })}
                        className="px-3.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        Rate Barber
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* SIDE BAR / MAP PLACEHOLDER */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800">
            <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 mb-3">Nearby Grooming Spots</h3>
            <div className="bg-brand-50 dark:bg-brand-950 h-52 rounded-2xl border flex flex-col items-center justify-center text-center p-4">
              <MapPin className="w-8 h-8 text-accent-500 mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">Google Maps Navigation</p>
              <p className="text-xs text-brand-500 dark:text-brand-500 mt-1">Distance calculation filters are slated for future release.</p>
            </div>
          </div>
        </div>

      </div>

      {/* --- RATING MODAL POPUP --- */}
      <AnimatePresence>
        {ratingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-brand-900 max-w-md w-full p-6 rounded-3xl border border-brand-200 dark:border-brand-800 relative shadow-xl"
            >
              <button 
                onClick={() => setRatingBooking(null)}
                className="absolute top-4 right-4 text-brand-400 hover:text-brand-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 mb-1">Rate Your Styling</h3>
              <p className="text-sm text-brand-500 dark:text-brand-400 mb-6">Write a review for {ratingBooking.shopName}</p>

              {reviewError && (
                <div className="flex items-center gap-1.5 p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-lg">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="flex items-center gap-1.5 p-3 mb-4 bg-green-50 text-green-600 text-xs rounded-lg">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <form onSubmit={submitReview} className="space-y-4">
                {/* Stars selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-2">Service Rating Score</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-brand-300 dark:text-brand-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-2">Write Review Comment</label>
                  <textarea
                    rows="3"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Tell us about the scissors precision, hairstyle alignment, or shop hygiene..."
                    className="w-full px-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Submit Review Feedback
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CANCELLATION POPUP DIALOG --- */}
      <AnimatePresence>
        {cancelModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-brand-900 max-w-sm w-full p-6 rounded-2xl shadow-xl text-center"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-900 dark:text-brand-50 font-display">Confirm Cancellation</h3>
              <p className="text-sm text-brand-600 dark:text-brand-400 mt-2">
                Are you sure you want to cancel this booking? If the appointment is in more than 24 hours, you will receive an automatic full refund.
              </p>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCancelModalId(null)}
                  className="flex-1 py-2 bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-brand-300 font-semibold rounded-xl text-sm hover:bg-brand-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCancel(cancelModalId)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm"
                >
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
