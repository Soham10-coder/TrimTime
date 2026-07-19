import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Calendar, Clock, MapPin, Receipt, Star, X, AlertTriangle, ShieldCheck, StarOff, ExternalLink, UserCheck } from 'lucide-react';
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
            <p style="margin: 4px 0;"><b>Check-In OTP:</b> ${b.checkInOtp || 'N/A'}</p>
            <p style="margin: 4px 0;"><b>Date Booked:</b> ${b.date}</p>
            <p style="margin: 4px 0;"><b>Time Slot:</b> ${b.timeSlot}</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description (Hairstyle Service)</th>
              <th>Assigned Stylist</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${b.hairstyle.name}</td>
              <td>${b.staffName || 'Senior Stylist'}</td>
              <td style="text-align: right;">₹${(b.totalAmount || b.price).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-price" style="margin-top: 10px;">
            <span>Total Paid:</span>
            <span>₹${(b.totalAmount || b.price).toFixed(2)}</span>
          </div>
        </div>

        <div style="clear: both;"></div>

        <div class="footer">
          <p>Thank you for using TrimTime. Please tell your 6-digit Check-In OTP to the salon upon arrival.</p>
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
    return user ? user.loyaltyPoints || 30 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

      {/* 2. APPOINTMENTS HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50">Active Appointments & Location</h2>
          
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
                  className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
                    <div className="flex gap-4 items-start">
                      <img src={b.barber.profilePic || '/placeholder.jpg'} className="w-14 h-14 rounded-2xl object-cover" alt="Shop avatar" />
                      <div>
                        <span className="text-[10px] font-bold text-accent-500 uppercase tracking-widest">{b.hairstyle.name}</span>
                        <h3 className="font-bold text-lg text-brand-900 dark:text-brand-50 font-display">{b.barber.shopName}</h3>
                        <p className="text-xs text-accent-600 font-semibold flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5" /> Stylist: {b.staffName || 'Senior Barber'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-brand-900 dark:text-brand-50 text-xl block">₹{b.totalAmount || b.price}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 dark:bg-green-950/40 px-2.5 py-0.5 rounded-full">Paid Online</span>
                    </div>
                  </div>

                  {/* LOCATION & GOOGLE MAPS NAVIGATION CARD */}
                  <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Shop Location Address</span>
                      <p className="text-xs font-bold text-brand-900 dark:text-brand-50 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" /> {b.barber.address || 'Shop Location'}
                      </p>
                    </div>

                    {b.barber.googleMapsUrl && (
                      <a
                        href={b.barber.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Navigate on Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* 6-DIGIT CHECK-IN OTP CARD */}
                  {b.checkInOtp && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">In-Person Check-In OTP</span>
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">Tell this OTP to barber upon arrival</p>
                      </div>
                      <span className="text-2xl font-extrabold font-mono text-brand-900 dark:text-brand-50 tracking-widest bg-white dark:bg-brand-900 px-4 py-1 rounded-xl border">
                        {b.checkInOtp}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-3 text-xs text-brand-600 dark:text-brand-400 font-mono">
                      <span>📅 {b.date}</span>
                      <span>⏰ {b.timeSlot}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadInvoice(b)}
                        className="px-3.5 py-1.5 bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 hover:text-accent-500 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Invoice
                      </button>
                      <button
                        onClick={() => setCancelModalId(b.id)}
                        className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold"
                      >
                        Cancel
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
                    <img src={b.barber.profilePic || '/placeholder.jpg'} className="w-12 h-12 rounded-xl object-cover grayscale" alt="Shop avatar" />
                    <div>
                      <h4 className="font-bold text-brand-800 dark:text-brand-200 font-display">{b.barber.shopName}</h4>
                      <p className="text-xs text-brand-500 mt-1">{b.hairstyle.name} &bull; {b.date} &bull; {b.timeSlot}</p>
                      
                      <span className={`inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        b.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-4">
                    <span className="font-bold text-brand-800 dark:text-brand-200 font-display">₹{b.totalAmount || b.price}</span>
                    
                    {b.status === 'completed' && (
                      <button
                        onClick={() => setRatingBooking({ id: b.id, barberId: b.barber_id || b.barberId || 'mockid', shopName: b.barber.shopName })}
                        className="px-3.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" /> Rate Barber
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* SIDE BAR / SEARCH SALONS CARD */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 space-y-4">
            <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50">Quick Location Navigation</h3>
            <p className="text-xs text-brand-500">Clicking "Navigate on Google Maps" opens live GPS turn-by-turn directions directly to your booked salon's door.</p>
            <div className="p-4 bg-accent-50 dark:bg-brand-950 rounded-2xl border border-accent-200 text-xs font-bold text-accent-700">
              📍 Automatic Distance Engine: Calculates real-time distance from your current location to all salons.
            </div>
          </div>
        </div>

      </div>

      {/* RATING MODAL */}
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

              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 mb-1">
                Rate {ratingBooking.shopName}
              </h3>
              <p className="text-xs text-brand-500 mb-6">How was your haircut & grooming experience?</p>

              {reviewSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl mb-4">{reviewSuccess}</div>}
              {reviewError && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl mb-4">{reviewError}</div>}

              <form onSubmit={submitReview} className="space-y-4">
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= ratingStars 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-brand-300 dark:text-brand-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-700 dark:text-brand-300 mb-1">Your Review Comment</label>
                  <textarea
                    rows="3"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Describe your experience with the barber..."
                    className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCEL MODAL */}
      <AnimatePresence>
        {cancelModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-brand-900 max-w-sm w-full p-6 rounded-3xl border border-brand-200 dark:border-brand-800 text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50">Cancel Appointment?</h3>
              <p className="text-xs text-brand-500">Cancellations made 24+ hours before the slot are eligible for a 100% full online refund.</p>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCancelModalId(null)} className="flex-1 py-2.5 bg-brand-100 text-brand-700 rounded-xl text-xs font-bold">Keep Booking</button>
                <button onClick={() => handleCancel(cancelModalId)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow">Confirm Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
