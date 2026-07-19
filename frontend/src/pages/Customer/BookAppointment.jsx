import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import PaymentModal from '../../components/PaymentModal';
import { Scissors, Clock, Calendar, Check, ArrowRight, User, Sparkles, Receipt, AlertCircle, ShieldCheck, MapPin, UserCheck, ExternalLink, Lock, AlertTriangle, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function BookAppointment() {
  const { barberId } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Stepper state: 1 -> Select Barber Staff, 2 -> Select Service, 3 -> Select Date, 4 -> Select Time Slot, 5 -> Checkout
  const [step, setStep] = useState(1);

  // Entities
  const [barber, setBarber] = useState(null);
  const [hairstyles, setHairstyles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // Selection States
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // States
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponError, setCouponError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [countdown, setCountdown] = useState(600);

  useEffect(() => {
    fetchBarberData();
  }, [barberId]);

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
        const pData = await pRes.json();
        setBarber(pData);
        setHairstyles(await hRes.json());
        setStaffList(pData.staff || []);
      }
    } catch (e) {
      console.error("Error fetching booking profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date, staff) => {
    if (!selectedHairstyle) return;
    setSlotsLoading(true);
    try {
      const staffParam = staff ? `&staffId=${staff.id || staff.name}` : '';
      const res = await api.get(`/booking/slots?barberId=${barberId}&date=${date}&hairstyleId=${selectedHairstyle.id}${staffParam}`);
      if (res.ok) {
        setSlots(await res.json());
      }
    } catch (e) {
      console.error("Failed to load slots:", e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleStaffSelect = (st) => {
    setSelectedStaff(st);
    setStep(2);
  };

  const handleHairstyleSelect = (hs) => {
    setSelectedHairstyle(hs);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    fetchSlots(dateStr, selectedStaff);
    setStep(4);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(5);
  };

  const handleSwitchToCustomer = () => {
    logout();
    navigate('/login', { state: { from: { pathname: `/book/${barberId}` } } });
  };

  const handleOpenPaymentModal = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${barberId}` } } });
      return;
    }
    if (user.role === 'barber' || user.role === 'admin') {
      setError('Barber accounts cannot book appointments. Please log in with a Customer account.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleFinalizeBookingAfterPayment = async (paymentDetails) => {
    setCheckoutLoading(true);
    setError('');

    try {
      const payload = {
        barberId,
        hairstyleId: selectedHairstyle.id,
        staffId: selectedStaff?.id || selectedStaff?.name || '1',
        staffName: selectedStaff?.name || 'Senior Stylist',
        date: selectedDate,
        timeSlot: selectedSlot.time,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        paymentMethod: paymentDetails?.method || 'UPI',
        transactionId: paymentDetails?.transactionId || `TXN_${Date.now()}`
      };
      
      const res = await api.post('/booking/create', payload);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize booking');
      }

      const bookingData = data.booking;
      
      setBookingResult({
        id: bookingData.bookingId,
        checkInOtp: bookingData.checkInOtp,
        staffName: bookingData.staffName,
        price: bookingData.price,
        platformFee: bookingData.platformFee,
        totalAmount: bookingData.totalAmount,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        qrCode: bookingData.qrCode || "",
        transactionId: payload.transactionId,
        paymentMethod: payload.paymentMethod
      });
      
      setIsPaymentModalOpen(false);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setCheckoutLoading(false);

    } catch (err) {
      setError(err.message);
      setIsPaymentModalOpen(false);
      setCheckoutLoading(false);
    }
  };

  const getNextDays = () => {
    const days = [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const current = new Date();
    
    for (let i = 0; i < 10; i++) {
      const nextDate = new Date(current);
      nextDate.setDate(current.getDate() + i);
      
      const dateStr = nextDate.toISOString().split('T')[0];
      const weekday = nextDate.getDay();
      
      let isClosed = false;
      if (barber && barber.weeklyHoliday !== null) {
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

  const getServicePrice = () => {
    if (!selectedHairstyle) return 0;
    return selectedHairstyle.price;
  };

  const getPlatformFee = () => {
    const servicePrice = getServicePrice();
    const feeRate = barber?.platformFeePercent || 10.0;
    return Math.round(servicePrice * (feeRate / 100.0));
  };

  const getTotalPayable = () => {
    return getServicePrice() + getPlatformFee();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (bookingResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-brand-900 p-8 rounded-3xl shadow-xl border border-brand-200 dark:border-brand-800 space-y-6"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">
              Payment Paid via {bookingResult.paymentMethod || 'UPI'} &bull; {bookingResult.transactionId}
            </span>
            <h1 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50 mt-2">Booking Confirmed!</h1>
            <p className="text-xs text-brand-500 mt-0.5">Ref ID: <span className="font-bold text-brand-800 dark:text-brand-200">{bookingResult.id}</span></p>
          </div>

          <div className="p-5 bg-accent-50 dark:bg-brand-950 border border-accent-200 dark:border-accent-800/40 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> In-Person Check-In OTP
            </span>
            <div className="text-3xl font-extrabold font-mono text-brand-900 dark:text-brand-50 tracking-widest">
              {bookingResult.checkInOtp || '849201'}
            </div>
            <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold leading-snug">
              Tell this 6-digit OTP to the salon barber upon your arrival to validate your appointment.
            </p>
          </div>

          <a
            href={barber?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${barber?.lat || 18.5204},${barber?.lng || 73.8567}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <MapPin className="w-4 h-4" /> View Shop Location on Google Maps <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="p-4 bg-brand-50 dark:bg-brand-950/60 rounded-2xl text-left text-xs space-y-1.5 font-semibold">
            <p className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Barber Shop:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">{barber?.shopName}</span>
            </p>
            <p className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Address:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">{barber?.address || barber?.city}</span>
            </p>
            <p className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Assigned Stylist:</span> <span className="text-accent-600 font-bold">{bookingResult.staffName}</span>
            </p>
            <p className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Service:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">{selectedHairstyle?.name}</span>
            </p>
            <p className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Date & Time:</span> <span className="text-brand-900 dark:text-brand-50 font-mono font-bold">{bookingResult.date} at {bookingResult.timeSlot}</span>
            </p>
            <div className="pt-2 border-t flex justify-between text-brand-900 dark:text-brand-50 font-bold">
              <span>Total Paid:</span> <span className="text-green-600 font-extrabold text-sm">₹{bookingResult.totalAmount}</span>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-brand-900 text-white dark:bg-accent-600 font-bold rounded-2xl text-xs">
            Go to My Bookings
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* SHOP HEADER WITH GOOGLE MAPS LINK BUTTON INSIDE CARD */}
      <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 overflow-hidden flex-shrink-0">
            <img src={barber?.profilePic || '/placeholder.jpg'} alt={barber?.shopName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-900 dark:text-brand-50">{barber?.shopName}</h1>
            <p className="text-xs text-brand-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" /> {barber?.address || barber?.city}
            </p>
          </div>
        </div>

        <a
          href={barber?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${barber?.lat || 18.5204},${barber?.lng || 73.8567}`}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <MapPin className="w-4 h-4" /> View Shop Location on Google Maps <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* STEPPER HEADER */}
      <div className="flex justify-between text-xs font-bold border-b pb-3 text-brand-400">
        <span className={step >= 1 ? 'text-accent-500 font-extrabold' : ''}>1. Select Stylist</span>
        <span className={step >= 2 ? 'text-accent-500 font-extrabold' : ''}>2. Select Service</span>
        <span className={step >= 3 ? 'text-accent-500 font-extrabold' : ''}>3. Select Date</span>
        <span className={step >= 4 ? 'text-accent-500 font-extrabold' : ''}>4. Select Time</span>
        <span className={step >= 5 ? 'text-accent-500 font-extrabold' : ''}>5. Checkout & Payment</span>
      </div>

      {/* STEP 1: SELECT BARBER STAFF MEMBER */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-accent-500" /> Choose Your Preferred Barber Stylist
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffList.length === 0 ? (
              <div 
                onClick={() => handleStaffSelect({ name: barber?.ownerName || 'Senior Barber', role: 'Owner & Master Stylist' })} 
                className="p-5 bg-white dark:bg-brand-900 border-2 hover:border-accent-500 rounded-3xl cursor-pointer shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-base">
                  {barber?.ownerName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-900 dark:text-brand-50">{barber?.ownerName || 'Senior Barber'}</h3>
                  <p className="text-xs text-accent-600 font-semibold">Owner & Master Stylist</p>
                </div>
              </div>
            ) : (
              staffList.map((st, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleStaffSelect(st)}
                  className={`p-5 bg-white dark:bg-brand-900 border-2 rounded-3xl cursor-pointer transition-all flex items-center justify-between ${
                    selectedStaff?.name === st.name ? 'border-accent-500 shadow-md ring-2 ring-accent-500/20' : 'hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-base overflow-hidden">
                      {st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-brand-900 dark:text-brand-50">{st.name}</h3>
                      <p className="text-xs text-accent-600 font-semibold">{st.role}</p>
                      <p className="text-[10px] text-brand-400">Shift: {st.shift || '09:00 AM - 08:00 PM'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-400" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT SERVICE */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-accent-500" /> Choose Grooming Service / Facial
            </h2>
            <button onClick={() => setStep(1)} className="text-xs text-accent-500 font-bold">Change Stylist</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hairstyles.map((hs) => (
              <div 
                key={hs.id}
                onClick={() => handleHairstyleSelect(hs)}
                className={`p-5 bg-white dark:bg-brand-900 border-2 rounded-3xl cursor-pointer transition-all space-y-2 ${
                  selectedHairstyle?.id === hs.id ? 'border-accent-500 ring-2 ring-accent-500/20' : 'hover:border-brand-300'
                }`}
              >
                {hs.imageUrl && (
                  <div className="w-full h-32 rounded-2xl overflow-hidden bg-brand-100 mb-2">
                    <img src={hs.imageUrl} alt={hs.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 bg-accent-100 text-accent-700 text-[10px] font-bold rounded-full uppercase">{hs.category || 'Grooming'}</span>
                  <span className="text-lg font-extrabold text-brand-900 dark:text-brand-50">₹{hs.price}</span>
                </div>
                <h3 className="font-bold text-sm text-brand-900 dark:text-brand-50">{hs.name}</h3>
                <p className="text-xs text-brand-500">{hs.description}</p>
                <div className="pt-2 border-t text-[11px] text-brand-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {hs.duration || 30} mins
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SELECT DATE */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-500" /> Select Appointment Date
            </h2>
            <button onClick={() => setStep(2)} className="text-xs text-accent-500 font-bold">Change Service</button>
          </div>

          <div className="flex overflow-x-auto gap-3 pb-2">
            {getNextDays().map((d) => (
              <button
                key={d.dateStr}
                disabled={d.isClosed}
                onClick={() => handleDateSelect(d.dateStr)}
                className={`min-w-[70px] p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  d.isClosed ? 'opacity-40 bg-brand-100 cursor-not-allowed' :
                  selectedDate === d.dateStr ? 'bg-accent-500 text-white border-accent-600 shadow-md' : 'bg-white dark:bg-brand-900 hover:border-accent-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{d.dayName}</span>
                <span className="text-xl font-extrabold font-display">{d.dayNum}</span>
                <span className="text-[10px]">{d.month}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: SELECT TIME SLOT */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-500" /> Available Time Slots ({selectedDate})
            </h2>
            <button onClick={() => setStep(3)} className="text-xs text-accent-500 font-bold">Change Date</button>
          </div>

          {slotsLoading ? (
            <div className="py-12 text-center text-xs text-brand-400">Loading open slots...</div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-400 bg-white dark:bg-brand-900 rounded-3xl border">No available slots for this date/stylist. Please select another date.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map((s) => (
                <button
                  key={s.time}
                  onClick={() => handleSlotSelect(s)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                    selectedSlot?.time === s.time ? 'bg-accent-500 text-white border-accent-600 shadow' : 'bg-white dark:bg-brand-900 hover:border-accent-400'
                  }`}
                >
                  {s.displayTime}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: CHECKOUT WITH FULL PAYMENT GATEWAY */}
      {step === 5 && (
        <div className="max-w-md mx-auto bg-white dark:bg-brand-900 p-8 rounded-3xl border shadow-xl space-y-6">
          <h2 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 text-center">Appointment Summary</h2>

          {/* BARBER ROLE WARNING BANNER */}
          {user && (user.role === 'barber' || user.role === 'admin') && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Barber Account Logged In</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                You are currently logged in as a <b>Barber Shop Account</b>. Barber accounts manage salons and cannot book appointments.
              </p>
              <button
                type="button"
                onClick={handleSwitchToCustomer}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm mt-1"
              >
                <LogIn className="w-3.5 h-3.5" /> Log In with Customer Account
              </button>
            </div>
          )}

          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">{error}</div>}

          <div className="space-y-3 text-xs border-b pb-4">
            <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
              <span>Barber Stylist:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">{selectedStaff?.name || 'Senior Stylist'}</span>
            </div>
            <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
              <span>Service:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">{selectedHairstyle?.name}</span>
            </div>
            <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
              <span>Date & Time:</span> <span className="text-brand-900 dark:text-brand-50 font-mono font-bold">{selectedDate} at {selectedSlot?.displayTime}</span>
            </div>
          </div>

          <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Service Fee:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">₹{getServicePrice()}</span>
            </div>
            <div className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Online Convenience Charge (10%):</span> <span className="text-amber-600 font-bold">₹{getPlatformFee()}</span>
            </div>
            <div className="pt-2 border-t flex justify-between text-base font-extrabold text-brand-900 dark:text-brand-50">
              <span>Total Amount Payable:</span> <span className="text-green-600">₹{getTotalPayable()}</span>
            </div>
          </div>

          <button
            onClick={handleOpenPaymentModal}
            disabled={checkoutLoading || (user && user.role !== 'customer')}
            className={`w-full py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex justify-center items-center gap-2 ${
              user && user.role !== 'customer' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Proceed to Secure Payment (₹{getTotalPayable()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FULL PAYMENT GATEWAY MODAL */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingData={{
          shopName: barber?.shopName,
          hairstyleName: selectedHairstyle?.name,
          date: selectedDate,
          totalAmount: getTotalPayable()
        }}
        onPaymentSuccess={handleFinalizeBookingAfterPayment}
      />

    </div>
  );
}
