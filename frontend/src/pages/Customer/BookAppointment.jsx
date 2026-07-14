import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Scissors, Clock, Calendar, Check, ArrowRight, User, Sparkles, Receipt, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function BookAppointment() {
  const { barberId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState(1);

  // Entities
  const [barber, setBarber] = useState(null);
  const [hairstyles, setHairstyles] = useState([]);
  
  // Selection States
  const [selectedHairstyle, setSelectedHairstyle] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponError, setCouponError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes checkout hold timer

  useEffect(() => {
    fetchBarberData();
  }, [barberId]);

  // Success countdown timer
  useEffect(() => {
    let timer = null;
    if (bookingResult && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bookingResult, countdown]);

  const fetchBarberData = async () => {
    setLoading(true);
    try {
      const pRes = await api.get(`/barber/profile/${barberId}`);
      const hRes = await api.get(`/barber/hairstyles/${barberId}`);
      if (pRes.ok && hRes.ok) {
        setBarber(await pRes.json());
        setHairstyles(await hRes.json());
      }
    } catch (e) {
      console.error("Error fetching booking profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    if (!selectedHairstyle) return;
    setSlotsLoading(true);
    try {
      const res = await api.get(`/booking/slots?barberId=${barberId}&date=${date}&hairstyleId=${selectedHairstyle.id}`);
      if (res.ok) {
        setSlots(await res.json());
      }
    } catch (e) {
      console.error("Failed to load slots:", e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleHairstyleSelect = (hs) => {
    setSelectedHairstyle(hs);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    fetchSlots(dateStr);
    setStep(3);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    
    try {
      // Validate coupon check on backend or simply list coupons
      const res = await api.get('/admin/coupons'); // Admin coupon list
      if (res.ok) {
        const coupons = await res.json();
        const found = coupons.find(c => c.code === couponCode && c.active);
        
        if (found) {
          const expiry = new Date(found.expiryDate);
          if (expiry > new Date()) {
            if (selectedHairstyle.price >= found.minBookingAmount) {
              setAppliedCoupon(found);
              return;
            } else {
              setCouponError(`Min booking amount of ₹${found.minBookingAmount} required.`);
            }
          } else {
            setCouponError('This coupon code has expired.');
          }
        } else {
          setCouponError('Invalid or inactive coupon code.');
        }
      }
    } catch (e) {
      setCouponError('Error applying coupon.');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      // Direct unauthenticated users to login, storing booking state to return
      navigate('/login', { state: { from: { pathname: `/book/${barberId}` } } });
      return;
    }

    setCheckoutLoading(true);
    setError('');

    try {
      // 1. Create booking order
      const payload = {
        barberId,
        hairstyleId: selectedHairstyle.id,
        date: selectedDate,
        timeSlot: selectedSlot.time,
        couponCode: appliedCoupon ? appliedCoupon.code : ''
      };
      
      const res = await api.post('/booking/create', payload);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize booking');
      }

      // 2. Load payment script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you connected to the internet?');
      }

      const rzpData = data.razorpay;
      const bookingData = data.booking;

      // 3. Trigger checkout window
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'TrimTime Startup',
        description: `Booking for ${selectedHairstyle.name}`,
        order_id: rzpData.orderId,
        handler: async function (response) {
          // Send verification signature back
          try {
            const verifyRes = await api.post('/booking/verify-payment', {
              bookingId: bookingData.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'razorpay'
            });

            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              setBookingResult({
                id: verifyData.bookingId,
                finalPrice: bookingData.price,
                qrCode: data.booking.qrCode || ""
              });
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            setError('Verification request failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#d97706'
        }
      };

      // Handle Mock Mode instantly for developers to bypass window constraints
      if (rzpData.mock) {
        console.log("Mocking Razorpay payment overlay...");
        // Auto trigger handler after 1.5 seconds
        setTimeout(async () => {
          try {
            const verifyRes = await api.post('/booking/verify-payment', {
              bookingId: bookingData.id,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
              razorpayOrderId: rzpData.orderId,
              razorpaySignature: 'mock_signature_from_client',
              paymentMethod: 'upi'
            });

            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              setBookingResult({
                id: verifyData.bookingId,
                finalPrice: bookingData.price,
                qrCode: data.booking.qrCode || ""
              });
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            } else {
              setError('Mock signature check failed.');
            }
          } catch (err) {
            setError('Mock verification failed.');
          } finally {
            setCheckoutLoading(false);
          }
        }, 1500);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      setCheckoutLoading(false);

    } catch (err) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  // Generate date selectors for the next 10 days
  const getNextDays = () => {
    const days = [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const current = new Date();
    
    for (let i = 0; i < 10; i++) {
      const nextDate = new Date(current);
      nextDate.setDate(current.getDate() + i);
      
      const dateStr = nextDate.toISOString().split('T')[0];
      const weekday = nextDate.getDay();
      
      // Sunday-Saturday is mapped 0-6 in Javascript
      // We stored weekly_holiday. Sunday (6 or 0).
      // If barber has a weekly holiday, flag that day as closed
      let isClosed = false;
      if (barber && barber.weeklyHoliday !== null) {
        // Map Javascript weekday to barber weeklyHoliday
        // JS: 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
        // Python target date: 0 Mon, 6 Sun.
        // Let's translate JS weekday to Python weekday:
        // JS 0 (Sun) -> Python 6
        // JS 1-6 (Mon-Sat) -> Python JS_val - 1
        const pyWeekday = weekday === 0 ? 6 : weekday - 1;
        if (pyWeekday === barber.weeklyHoliday) {
          isClosed = true;
        }
      }

      days.push({
        dateStr,
        dayName: daysName[weekday],
        dayNum: nextDate.getDate(),
        month: nextDate.toLocaleString('default', { month: 'short' }),
        isClosed
      });
    }
    return days;
  };

  const getFinalCheckoutPrice = () => {
    if (!selectedHairstyle) return 0;
    const base = selectedHairstyle.price;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        return Math.max(0, base - (appliedCoupon.value / 100) * base);
      } else {
        return Math.max(0, base - appliedCoupon.value);
      }
    }
    return base;
  };

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // SUCCESS PAGE STATE RENDER
  if (bookingResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-brand-900 p-8 rounded-3xl shadow-xl border border-brand-200 dark:border-brand-800"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <h1 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50">Booking Confirmed!</h1>
          <p className="text-brand-500 dark:text-brand-400 mt-2 text-sm">
            Booking Reference ID: <span className="font-bold text-brand-800 dark:text-brand-200">{bookingResult.id}</span>
          </p>

          {/* QR Code */}
          <div className="bg-brand-50 dark:bg-brand-950 p-4 rounded-2xl inline-block my-6 border border-dashed border-brand-200 dark:border-brand-800">
            <img 
              src={`data:image/png;base64,${bookingResult.qrCode}`} 
              alt="Scan QR" 
              className="w-48 h-48 mx-auto"
            />
          </div>

          {/* Appointment Hold Details */}
          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-sm p-4 rounded-xl mb-6">
            <p className="font-medium">Please show this QR Code at the counter when you arrive.</p>
            <p className="mt-1 text-xs text-brand-500">Hold Timer: {formatCountdown(countdown)}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-brand-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              Go to Customer Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-brand-300 font-semibold rounded-xl text-sm hover:bg-brand-200"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WIZARD CARD PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shop Header Details */}
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <img src={barber.profilePic || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200'} className="w-16 h-16 rounded-xl object-cover" alt="Shop avatar" />
            <div>
              <span className="text-xs text-brand-500 font-bold uppercase tracking-wider">{barber.city}</span>
              <h2 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50">{barber.shopName}</h2>
              <p className="text-sm text-brand-600 dark:text-brand-400">{barber.ownerName} &bull; {barber.address}</p>
            </div>
          </div>

          {/* STEP 1: HAIRSTYLE */}
          <div className={`bg-white dark:bg-brand-900 p-6 rounded-3xl border ${step === 1 ? 'border-accent-500 ring-1 ring-accent-500/30' : 'border-brand-200 dark:border-brand-800'} transition-all`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-900 dark:bg-accent-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Select Hairstyle Service
              </h3>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-sm font-semibold text-accent-500 hover:underline">
                  Change service ({selectedHairstyle?.name})
                </button>
              )}
            </div>

            <AnimatePresence>
              {step === 1 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {hairstyles.map((hs) => (
                    <div 
                      key={hs.id}
                      onClick={() => handleHairstyleSelect(hs)}
                      className="border border-brand-200 dark:border-brand-800 rounded-xl p-4 cursor-pointer hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-sm transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-accent-500 uppercase tracking-widest">{hs.category}</span>
                          <h4 className="font-bold text-brand-900 dark:text-brand-50 group-hover:text-accent-500 transition-colors mt-0.5">{hs.name}</h4>
                          <p className="text-xs text-brand-500 dark:text-brand-400 mt-1 line-clamp-2">{hs.description}</p>
                        </div>
                        {hs.imageUrl && <img src={hs.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="Hairstyle pic" />}
                      </div>

                      <div className="flex justify-between items-baseline mt-4 border-t border-brand-100 dark:border-brand-800/40 pt-3">
                        <span className="flex items-center gap-1 text-xs text-brand-500">
                          <Clock className="w-3.5 h-3.5" />
                          {hs.duration} mins
                        </span>
                        <span className="font-bold text-brand-900 dark:text-brand-50 font-display">₹{hs.price}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 2: CHOOSE DATE */}
          <div className={`bg-white dark:bg-brand-900 p-6 rounded-3xl border ${step === 2 ? 'border-accent-500 ring-1 ring-accent-500/30' : 'border-brand-200 dark:border-brand-800'} transition-all`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-900 dark:bg-accent-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Choose Booking Date
              </h3>
              {step > 2 && (
                <button onClick={() => setStep(2)} className="text-sm font-semibold text-accent-500 hover:underline">
                  Change date ({selectedDate})
                </button>
              )}
            </div>

            <AnimatePresence>
              {step === 2 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-3 overflow-x-auto pb-4 justify-start"
                >
                  {getNextDays().map((day) => (
                    <button
                      key={day.dateStr}
                      onClick={() => !day.isClosed && handleDateSelect(day.dateStr)}
                      disabled={day.isClosed}
                      className={`flex-shrink-0 w-16 py-3 border rounded-xl flex flex-col items-center justify-center transition-all ${
                        day.isClosed 
                          ? 'bg-brand-100/50 dark:bg-brand-900/50 border-brand-200 dark:border-brand-800 text-brand-400 dark:text-brand-600 cursor-not-allowed'
                          : selectedDate === day.dateStr
                            ? 'bg-accent-500 border-accent-500 text-white shadow-md'
                            : 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:border-accent-500 hover:text-accent-500'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-widest">{day.dayName}</span>
                      <span className="text-xl font-bold font-display mt-1">{day.dayNum}</span>
                      <span className="text-[10px] mt-0.5">{day.isClosed ? 'Closed' : day.month}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 3: AVAILABLE SLOTS */}
          <div className={`bg-white dark:bg-brand-900 p-6 rounded-3xl border ${step === 3 ? 'border-accent-500 ring-1 ring-accent-500/30' : 'border-brand-200 dark:border-brand-800'} transition-all`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-900 dark:bg-accent-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Select Available Time Slot
              </h3>
              {step > 3 && (
                <button onClick={() => setStep(3)} className="text-sm font-semibold text-accent-500 hover:underline">
                  Change slot ({selectedSlot?.displayTime})
                </button>
              )}
            </div>

            <AnimatePresence>
              {step === 3 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {slotsLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-center text-brand-500 py-6 text-sm">All slots booked or shop is closed on this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          onClick={() => handleSlotSelect(s)}
                          className="py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-semibold text-brand-700 dark:text-brand-300 hover:border-accent-500 hover:text-accent-500 transition-all text-center"
                        >
                          {s.displayTime}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* ORDER SUMMARY CART COLUMN */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm">
            <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2 border-b pb-4 mb-4">
              <ShoppingCart className="w-5 h-5 text-accent-500" />
              Booking Details
            </h3>

            {error && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-800/40">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-500">Service:</span>
                <span className="font-semibold text-brand-800 dark:text-brand-200">{selectedHairstyle ? selectedHairstyle.name : "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500">Duration:</span>
                <span className="font-semibold text-brand-800 dark:text-brand-200">{selectedHairstyle ? `${selectedHairstyle.duration} mins` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500">Date:</span>
                <span className="font-semibold text-brand-800 dark:text-brand-200">{selectedDate || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500">Time:</span>
                <span className="font-semibold text-brand-800 dark:text-brand-200">{selectedSlot ? selectedSlot.displayTime : "Not selected"}</span>
              </div>

              {selectedHairstyle && (
                <>
                  <hr className="border-brand-100 dark:border-brand-800/60 my-4"/>
                  
                  {/* Coupon Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-500 uppercase tracking-wider block">Promo Coupon</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        className="flex-grow uppercase font-semibold text-center tracking-wider text-xs px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                      />
                      {appliedCoupon ? (
                        <button
                          onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                          className="px-3 py-2 bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl text-xs font-semibold"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyCoupon}
                          className="px-3.5 py-2 bg-brand-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-500 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Promo applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}% discount` : `₹${appliedCoupon.value} flat off`}
                      </p>
                    )}
                  </div>

                  <hr className="border-brand-100 dark:border-brand-800/60 my-4"/>
                  
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-brand-800 dark:text-brand-200 font-bold text-base">Amount Payable:</span>
                    <div className="text-right">
                      {appliedCoupon && (
                        <p className="text-xs text-brand-400 line-through">₹{selectedHairstyle.price}</p>
                      )}
                      <p className="text-2xl font-extrabold font-display text-accent-500">₹{getFinalCheckoutPrice()}</p>
                    </div>
                  </div>

                  {step === 4 && (
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-2xl text-sm transition-all shadow-md flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
                    >
                      {checkoutLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>{user ? "Confirm & Pay Online" : "Log In to Confirm Booking"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
