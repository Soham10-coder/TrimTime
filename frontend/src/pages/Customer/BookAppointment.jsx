import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api, formatImageUrl } from '../../utils/api';
import PaymentModal from '../../components/PaymentModal';
import { Scissors, Clock, Calendar, Check, ArrowRight, User, Sparkles, Receipt, AlertCircle, ShieldCheck, MapPin, UserCheck, ExternalLink, Lock, AlertTriangle, LogIn, ZoomIn, X, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const getServiceFallbackImage = (category) => {
  const fallbacks = {
    "Men's Hair Services": 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60',
    "Women's Hair Services": 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60',
    "Men Grooming": 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60',
    "Skin & Facial": 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop&q=60',
    "Hair Color": 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=60',
    "Spa": 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=60',
    "Nails": 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=60',
    "Bridal": 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
    'Haircut': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60',
    'Beard': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60',
    'Facial': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop&q=60',
    'Others': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60'
  };
  return fallbacks[category] || fallbacks['Others'];
};

export default function BookAppointment() {
  const { barberId } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Full-screen Image Lightbox Preview state
  const [previewImage, setPreviewImage] = useState(null);

  // Stepper state: 1 -> Select Barber Staff, 2 -> Select Service, 3 -> Select Date, 4 -> Select Time Slot, 5 -> Checkout
  const [step, setStep] = useState(1);

  // Entities
  const [barber, setBarber] = useState(null);
  const [hairstyles, setHairstyles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  
  // Selection States
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedHairstyles, setSelectedHairstyles] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // Main Navigation Tab State (Amazon / Airbnb Style)
  const [mainTab, setMainTab] = useState('booking'); // 'booking', 'reviews', 'info'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  
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
        setReviewsList(pData.reviews || []);
      }
    } catch (e) {
      console.error("Error fetching booking profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date, staff) => {
    if (selectedHairstyles.length === 0) return;
    setSlotsLoading(true);
    try {
      const staffParam = staff ? `&staffId=${staff.id || staff.name}` : '';
      const serviceIds = selectedHairstyles.map(h => h.id).join(',');
      const res = await api.get(`/booking/slots?barberId=${barberId}&date=${date}&hairstyleId=${serviceIds}${staffParam}`);
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
    setStep(3);
  };

  const handleHairstyleToggle = (hs) => {
    setSelectedHairstyles(prev => {
      const exists = prev.some(item => item.id === hs.id);
      if (exists) {
        return prev.filter(item => item.id !== hs.id);
      } else {
        return [...prev, hs];
      }
    });
    setSelectedSlot(null);
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

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    const servicePrice = getServicePrice();
    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round((appliedCoupon.value / 100) * servicePrice);
    } else {
      return appliedCoupon.value;
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/booking/apply-coupon', {
        couponCode: couponCode.trim().toUpperCase(),
        bookingAmount: getServicePrice()
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error(err);
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    }
  };

  const handleOpenPaymentModal = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${barberId}` } } });
      return;
    }
    if (user.role === 'barber' || user.role === 'admin') {
      setError('Barber accounts cannot book appointments. Please log in with a Customer account.');
      return;
    }

    setCheckoutLoading(true);
    setError('');

    try {
      const payload = {
        barberId,
        hairstyleId: selectedHairstyles.map(h => h.id).join(','),
        staffId: selectedStaff?.id || selectedStaff?.name || '1',
        staffName: selectedStaff?.name || 'Senior Stylist',
        date: selectedDate,
        timeSlot: selectedSlot.time,
        couponCode: appliedCoupon ? appliedCoupon.code : ''
      };
      
      const res = await api.post('/booking/create', payload);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize booking');
      }

      setCreatedBooking(data);
      setIsPaymentModalOpen(true);
      setCheckoutLoading(false);

    } catch (err) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  const handleFinalizeBookingAfterPayment = (paymentDetails) => {
    if (!createdBooking) return;
    const bookingData = createdBooking.booking;
    
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
      transactionId: paymentDetails?.transactionId || `TXN_${Date.now()}`,
      paymentMethod: paymentDetails?.method || 'ONLINE'
    });
    
    setIsPaymentModalOpen(false);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
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
      if (barber) {
        const pyWeekday = weekday === 0 ? 6 : weekday - 1;
        const weeklyHols = barber.weeklyHolidays || [];
        
        if (weeklyHols.length > 0) {
          if (weeklyHols.includes(pyWeekday)) {
            isClosed = true;
          }
        } else if (barber.weeklyHoliday !== null && barber.weeklyHoliday !== undefined) {
          if (pyWeekday === Number(barber.weeklyHoliday)) {
            isClosed = true;
          }
        }
        
        if (barber.closedDates && barber.closedDates.includes(dateStr)) {
          isClosed = true;
        }
        
        if (barber.holidayMode) {
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
    if (selectedHairstyles.length === 0) return 0;
    return selectedHairstyles.reduce((total, hs) => total + parseFloat(hs.price || 0), 0);
  };

  const getPlatformFee = () => {
    const servicePrice = getServicePrice();
    const discount = getDiscountAmount();
    const discountedPrice = Math.max(0, servicePrice - discount);
    const feeRate = barber?.platformFeePercent || 10.0;
    return Math.round(discountedPrice * (feeRate / 100.0));
  };

  const getTotalPayable = () => {
    const servicePrice = getServicePrice();
    const discount = getDiscountAmount();
    return Math.max(0, servicePrice - discount);
  };

  const getStaffHolidayInfo = (st, targetDateStr) => {
    if (!st || !st.holiday) return null;
    const daysName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    if (targetDateStr) {
      const parts = targetDateStr.split('-');
      if (parts.length === 3) {
        const targetObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const pyWeekday = (targetObj.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
        const targetWeekdayName = daysName[pyWeekday];
        const staffHolidayStr = st.holiday.trim();
        
        if (staffHolidayStr.toLowerCase() === targetWeekdayName.toLowerCase()) {
          return {
            isOnHoliday: true,
            staffName: st.name,
            dayName: targetWeekdayName,
            dateStr: targetDateStr
          };
        }
      }
    }
    return null;
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
              <span>Services:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">{selectedHairstyles.map(h => h.name).join(', ')}</span>
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMainTab('reviews')}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{barber?.ratingAvg > 0 ? barber.ratingAvg.toFixed(1) : (barber?.rating > 0 ? barber.rating.toFixed(1) : '4.9')} Rating</span>
            <span className="text-amber-700 font-normal">({reviewsList.length} reviews)</span>
          </button>

          <a
            href={barber?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${barber?.lat || 18.5204},${barber?.lng || 73.8567}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <MapPin className="w-4 h-4" /> View Location on Google Maps <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* AMAZON / AIRBNB STYLE TOP TABS */}
      <div className="flex border-b border-brand-200 gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-brand-500 overflow-x-auto">
        <button
          type="button"
          onClick={() => setMainTab('booking')}
          className={`pb-3 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            mainTab === 'booking'
              ? 'text-accent-600 font-extrabold border-b-2 border-accent-600'
              : 'hover:text-brand-900'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Services & Booking</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('reviews')}
          className={`pb-3 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            mainTab === 'reviews'
              ? 'text-accent-600 font-extrabold border-b-2 border-accent-600'
              : 'hover:text-brand-900'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>Customer Reviews & Ratings ({reviewsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('info')}
          className={`pb-3 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            mainTab === 'info'
              ? 'text-accent-600 font-extrabold border-b-2 border-accent-600'
              : 'hover:text-brand-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Shop Info & Hours</span>
        </button>
      </div>

      {/* 1. SERVICES & BOOKING TAB */}
      {mainTab === 'booking' && (
        <>
          {/* STEPPER HEADER */}
          <div className="flex justify-between text-xs font-bold border-b pb-3 text-brand-400">
            <button 
              onClick={() => setStep(1)}
              className={`focus:outline-none transition-all pb-1 ${step === 1 ? 'text-accent-500 font-extrabold border-b-2 border-accent-500' : 'text-brand-600 hover:text-accent-500'}`}
            >
              1. Select Services
            </button>
            <button 
              disabled={selectedHairstyles.length === 0}
              onClick={() => setStep(2)}
              className={`focus:outline-none transition-all pb-1 ${step === 2 ? 'text-accent-500 font-extrabold border-b-2 border-accent-500' : selectedHairstyles.length > 0 ? 'text-brand-700 hover:text-accent-500' : 'cursor-not-allowed opacity-50'}`}
            >
              2. Select Stylist
            </button>
            <button 
              disabled={selectedHairstyles.length === 0 || !selectedStaff}
              onClick={() => setStep(3)}
              className={`focus:outline-none transition-all pb-1 ${step === 3 ? 'text-accent-500 font-extrabold border-b-2 border-accent-500' : (selectedHairstyles.length > 0 && selectedStaff) ? 'text-brand-700 hover:text-accent-500' : 'cursor-not-allowed opacity-50'}`}
            >
              3. Select Date
            </button>
            <button 
              disabled={selectedHairstyles.length === 0 || !selectedStaff || !selectedDate}
              onClick={() => setStep(4)}
              className={`focus:outline-none transition-all pb-1 ${step === 4 ? 'text-accent-500 font-extrabold border-b-2 border-accent-500' : (selectedHairstyles.length > 0 && selectedStaff && selectedDate) ? 'text-brand-700 hover:text-accent-500' : 'cursor-not-allowed opacity-50'}`}
            >
              4. Select Time Slot
            </button>
            <button 
              disabled={selectedHairstyles.length === 0 || !selectedStaff || !selectedDate || !selectedSlot}
              onClick={() => setStep(5)}
              className={`focus:outline-none transition-all pb-1 ${step === 5 ? 'text-accent-500 font-extrabold border-b-2 border-accent-500' : (selectedHairstyles.length > 0 && selectedStaff && selectedDate && selectedSlot) ? 'text-brand-700 hover:text-accent-500' : 'cursor-not-allowed opacity-50'}`}
            >
              5. Checkout & Payment
            </button>
          </div>

      {/* STEP 1: SELECT SERVICE (MULTIPLE SELECT) */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-accent-500" /> Choose Grooming Services
            </h2>
          </div>

          {/* SERVICE CATEGORY SECTIONS TABS */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b">
            {['All', ...new Set(hairstyles.map(hs => hs.category).filter(Boolean))].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryTab === cat
                    ? 'bg-accent-500 text-white shadow-sm scale-105'
                    : 'bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-300'
                }`}
              >
                {cat === 'All' ? '🌟 All Services' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hairstyles
              .filter((hs) => selectedCategoryTab === 'All' || hs.category === selectedCategoryTab)
              .map((hs) => {
                const isSelected = selectedHairstyles.some(item => item.id === hs.id);
                return (
                  <div 
                    key={hs.id}
                    onClick={() => handleHairstyleToggle(hs)}
                    className={`p-5 bg-white dark:bg-brand-900 border-2 rounded-3xl cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                      isSelected ? 'border-accent-500 ring-2 ring-accent-500/20 bg-accent-50/10' : 'hover:border-brand-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-accent-500 text-white p-1 rounded-full shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div 
                      className="w-full h-32 rounded-2xl overflow-hidden bg-brand-100 mb-2 relative group cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({
                          url: formatImageUrl(hs.imageUrl) || getServiceFallbackImage(hs.category),
                          title: hs.name,
                          category: hs.category,
                          price: hs.price,
                          duration: hs.duration
                        });
                      }}
                    >
                      <img src={formatImageUrl(hs.imageUrl) || getServiceFallbackImage(hs.category)} alt={hs.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold backdrop-blur-[1px]">
                        <ZoomIn className="w-4 h-4" /> View Full Image
                      </div>
                    </div>
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
                );
              })}
          </div>

          {selectedHairstyles.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-extrabold rounded-2xl text-xs shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
              >
                <span>Continue to Stylist Selection ({selectedHairstyles.length} Selected • Total: ₹{getServicePrice()})</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SELECT BARBER STAFF MEMBER */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-accent-500" /> Choose Your Preferred Barber Stylist
            </h2>
            <button onClick={() => setStep(1)} className="text-xs text-accent-500 font-bold">Change Services</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffList.length === 0 ? (
              <div 
                onClick={() => handleStaffSelect({ name: barber?.ownerName || 'Senior Barber', role: 'Owner & Master Stylist' })} 
                className="p-5 bg-white border-2 hover:border-accent-500 rounded-3xl cursor-pointer shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-base">
                  {barber?.ownerName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-900">{barber?.ownerName || 'Senior Barber'}</h3>
                  <p className="text-xs text-accent-600 font-semibold">Owner & Master Stylist</p>
                </div>
              </div>
            ) : (
              staffList.map((st, idx) => {
                const hInfo = getStaffHolidayInfo(st, selectedDate);
                const isSelected = selectedStaff?.name === st.name;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleStaffSelect(st)}
                    className={`p-5 bg-white border-2 rounded-3xl cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'border-accent-500 shadow-md ring-2 ring-accent-500/20' : 'hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-base overflow-hidden flex-shrink-0">
                        {st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.name?.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-brand-900">{st.name}</h3>
                        <p className="text-xs text-accent-600 font-semibold">{st.role}</p>
                        <p className="text-[10px] text-brand-500 font-medium">Shift: {st.shift || '09:00 AM - 08:00 PM'}</p>
                        
                        {/* ON LEAVE / WEEKLY OFF BADGE */}
                        {st.holiday && (
                          <div className={`mt-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
                            hInfo?.isOnHoliday
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {hInfo?.isOnHoliday 
                                ? `ON LEAVE ON ${hInfo.dayName.toUpperCase()}S`
                                : `Weekly Off: ${st.holiday}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </div>
                );
              })
            )}
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
            <button onClick={() => setStep(2)} className="text-xs text-accent-500 font-bold">Change Stylist</button>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-none">
            {getNextDays().map((d) => {
              const isSelected = selectedDate === d.dateStr;
              const staffHolidayInfo = getStaffHolidayInfo(selectedStaff, d.dateStr);
              const isStaffOnLeave = staffHolidayInfo?.isOnHoliday;

              return (
                <button
                  key={d.dateStr}
                  disabled={d.isClosed}
                  onClick={() => handleDateSelect(d.dateStr)}
                  className={`min-w-[90px] p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 relative ${
                    d.isClosed 
                      ? 'opacity-50 bg-brand-100 cursor-not-allowed border-brand-200 text-brand-400' 
                      : isStaffOnLeave
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/40 shadow-xs'
                      : isSelected 
                      ? 'bg-accent-500 text-white border-accent-600 shadow-md scale-105 ring-2 ring-accent-300' 
                      : 'bg-white border-brand-200 hover:border-accent-400 text-brand-900'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-brand-500'}`}>{d.dayName}</span>
                  <span className="text-2xl font-black font-display leading-none my-0.5">{d.dayNum}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-brand-400'}`}>{d.month}</span>

                  {/* SHOP CLOSED BADGE */}
                  {d.isClosed && (
                    <span className="text-[9px] font-extrabold text-red-600 uppercase bg-red-100 px-1.5 py-0.5 rounded mt-1 border border-red-200">
                      Closed
                    </span>
                  )}

                  {/* STAFF ON LEAVE BADGE ON THE DATE BUTTON */}
                  {!d.isClosed && isStaffOnLeave && (
                    <span className="text-[9px] font-extrabold text-amber-800 uppercase bg-amber-200/90 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap border border-amber-300">
                      {selectedStaff?.name ? `${selectedStaff.name.split(' ')[0]} Off` : 'Staff Off'}
                    </span>
                  )}
                </button>
              );
            })}
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
            (() => {
              const hInfo = getStaffHolidayInfo(selectedStaff, selectedDate);
              if (hInfo?.isOnHoliday) {
                return (
                  <div className="py-10 px-6 text-center bg-amber-50/90 border-2 border-amber-300 rounded-3xl space-y-4 shadow-sm">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-amber-900 font-display">
                        {selectedStaff?.name} is on Weekly Off on {hInfo.dayName}s
                      </h3>
                      <p className="text-xs text-amber-800 font-medium mt-1 max-w-md mx-auto">
                        {selectedStaff?.name} takes his scheduled weekly off on {hInfo.dayName}s ({selectedDate}). Please select another barber or choose a different date.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" /> Select Different Stylist
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" /> Choose Different Date
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div className="py-12 text-center text-xs text-brand-500 bg-white rounded-3xl border border-brand-200">
                  No available slots for this date. Please select another date or stylist.
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map((s) => (
                <button
                  key={s.time}
                  disabled={s.available === false}
                  onClick={() => handleSlotSelect(s)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    s.available === false
                      ? s.isBreak
                        ? 'bg-amber-50 border-amber-300 text-amber-900 cursor-not-allowed opacity-80'
                        : 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-65'
                      : selectedSlot?.time === s.time
                      ? 'bg-accent-500 text-white border-accent-600 shadow'
                      : 'bg-white hover:border-accent-400 text-brand-900'
                  }`}
                >
                  <span>{s.displayTime}</span>
                  {s.available === false && (
                    <span className={`text-[9px] font-extrabold uppercase tracking-tight ${
                      s.isBreak ? 'text-amber-800' : 'text-red-500'
                    }`}>
                      {s.isBreak ? '☕ Lunch Break' : 'Booked'}
                    </span>
                  )}
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
            <div className="flex flex-col text-brand-600 dark:text-brand-400 font-semibold space-y-1">
              <span>Selected Services:</span>
              <ul className="list-disc pl-5 text-brand-900 dark:text-brand-50 font-bold text-xs space-y-0.5">
                {selectedHairstyles.map((hs) => (
                  <li key={hs.id}>
                    {hs.name} <span className="text-brand-500 font-normal">(₹{hs.price})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
              <span>Date & Time:</span> <span className="text-brand-900 dark:text-brand-50 font-mono font-bold">{selectedDate} at {selectedSlot?.displayTime}</span>
            </div>
          </div>

          {/* COUPON CODE INPUT & VALIDATION */}
          <div className="space-y-2 border-b pb-4">
            <label className="block text-xs font-bold text-brand-600 dark:text-brand-400">Have a Coupon Code?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. SAVE20"
                className="flex-1 px-3 py-2 bg-brand-50 dark:bg-brand-800 border rounded-xl text-xs font-bold font-mono focus:outline-none uppercase text-brand-900 dark:text-brand-50"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-xs font-bold"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {couponError}
              </p>
            )}
            {appliedCoupon && (
              <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Coupon "{appliedCoupon.code}" applied! ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`} discount)
              </p>
            )}
          </div>

          <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-brand-600 dark:text-brand-400">
              <span>Service Fee:</span> <span className="text-brand-900 dark:text-brand-50 font-bold">₹{getServicePrice()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Discount Applied:</span> <span>-₹{getDiscountAmount()}</span>
              </div>
            )}

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
      </>
      )}

      {/* 2. REVIEWS TAB (AMAZON / AIRBNB STYLE) */}
      {mainTab === 'reviews' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Rating Summary Box */}
          <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-2">
              <div className="text-5xl font-black font-display text-brand-900 flex items-center justify-center md:justify-start gap-3">
                <span>{barber?.ratingAvg > 0 ? barber.ratingAvg.toFixed(1) : (barber?.rating > 0 ? barber.rating.toFixed(1) : '4.9')}</span>
                <span className="text-2xl font-bold text-brand-400">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-brand-500 font-bold uppercase tracking-wider">
                Based on {reviewsList.length > 0 ? `${reviewsList.length} verified customer reviews` : 'Top-rated partner salon'}
              </p>
            </div>

            {/* Amazon-style Star Breakdown Bar Chart */}
            <div className="w-full md:w-72 space-y-2 text-xs font-bold text-brand-600">
              <div className="flex items-center gap-3">
                <span className="w-8 text-right">5 ★</span>
                <div className="flex-grow h-2.5 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="w-8 text-left font-mono">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 text-right">4 ★</span>
                <div className="flex-grow h-2.5 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="w-8 text-left font-mono">12%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 text-right">3 ★</span>
                <div className="flex-grow h-2.5 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '3%' }}></div>
                </div>
                <span className="w-8 text-left font-mono">3%</span>
              </div>
            </div>
          </div>

          {/* Individual Reviews Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black font-display text-brand-900">
                Customer Reviews & Feedback ({reviewsList.length})
              </h3>
              <button
                type="button"
                onClick={() => setMainTab('booking')}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-xs font-bold transition-all"
              >
                Book Appointment Now
              </button>
            </div>

            {reviewsList.length === 0 ? (
              <div className="bg-white border border-brand-200 rounded-3xl p-12 text-center text-brand-500 space-y-3">
                <MessageSquare className="w-10 h-10 text-brand-300 mx-auto" />
                <h4 className="font-bold text-sm text-brand-800">No written reviews submitted yet</h4>
                <p className="text-xs">Be the first customer to leave feedback after your appointment at {barber?.shopName}!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-white border border-brand-200 rounded-2xl p-5 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-500/10 text-accent-600 font-black text-sm flex items-center justify-center font-display border border-accent-500/20">
                          {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-brand-900 block">{rev.customerName || 'Verified Customer'}</span>
                          <span className="text-[10px] font-semibold text-brand-400">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-brand-700 leading-relaxed font-medium pl-1">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SHOP INFO TAB */}
      {mainTab === 'info' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-brand-200 rounded-3xl p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-[10px] font-extrabold text-accent-600 uppercase tracking-widest block mb-1">
                About The Salon
              </span>
              <h3 className="text-2xl font-black font-display text-brand-900">{barber?.shopName}</h3>
            </div>
            <p className="text-xs text-brand-600 leading-relaxed font-medium">
              {barber?.description || 'Premier salon lounge offering expert haircutting, precision beard styling, glowing facial therapies, and executive grooming packages.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200 text-xs space-y-1">
                <span className="text-brand-400 font-bold uppercase tracking-wider text-[10px]">Operating Shift Hours</span>
                <p className="font-extrabold text-brand-900">{barber?.openingTime || '09:00 AM'} - {barber?.closingTime || '08:00 PM'}</p>
              </div>

              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200 text-xs space-y-1">
                <span className="text-brand-400 font-bold uppercase tracking-wider text-[10px]">Weekly Holiday Off-Day</span>
                <p className="font-extrabold text-brand-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>
                    {(() => {
                      const daysName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                      if (barber?.weeklyHolidays && barber.weeklyHolidays.length > 0) {
                        return barber.weeklyHolidays.map(d => daysName[d]).join(', ');
                      }
                      if (barber?.weeklyHoliday !== undefined && barber.weeklyHoliday !== null && barber.weeklyHoliday !== '') {
                        const idx = Number(barber.weeklyHoliday);
                        if (!isNaN(idx) && idx >= 0 && idx < 7) return daysName[idx];
                      }
                      return 'Open All 7 Days';
                    })()}
                  </span>
                </p>
              </div>

              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200 text-xs space-y-1">
                <span className="text-brand-400 font-bold uppercase tracking-wider text-[10px]">Today's Shop Status</span>
                <p className="font-extrabold text-brand-900 flex items-center gap-1.5">
                  {barber?.closedToday || barber?.holidayMode ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-600 font-extrabold uppercase">Closed Today for Holiday</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-emerald-700 font-extrabold uppercase">Open & Taking Appointments</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200 text-xs space-y-1">
                <span className="text-brand-400 font-bold uppercase tracking-wider text-[10px]">Shop Address</span>
                <p className="font-extrabold text-brand-900 truncate">{barber?.address || barber?.city}</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={barber?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${barber?.lat || 18.5204},${barber?.lng || 73.8567}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all"
              >
                <MapPin className="w-4 h-4" /> Open Turn-by-Turn GPS Directions on Google Maps <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FULL PAYMENT GATEWAY MODAL */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingData={createdBooking ? {
          id: createdBooking.booking?.id,
          shopName: barber?.shopName,
          hairstyleName: selectedHairstyles.map(h => h.name).join(', '),
          date: selectedDate,
          totalAmount: createdBooking.booking?.totalAmount,
          isLivePayment: createdBooking.isLivePayment,
          razorpayKeyId: createdBooking.razorpayKeyId,
          razorpayOrderId: createdBooking.razorpayOrderId,
          customerName: user?.name,
          customerEmail: user?.email
        } : null}
        onPaymentSuccess={handleFinalizeBookingAfterPayment}
      />

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.85, opacity: 0 }} 
              className="relative max-w-3xl w-full bg-brand-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewImage(null)} 
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all z-10 border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-full max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src={previewImage.url} 
                  alt={previewImage.title} 
                  className="w-full h-full object-contain max-h-[70vh]" 
                />
              </div>

              <div className="p-6 bg-gradient-to-t from-brand-950 to-brand-900 flex justify-between items-center border-t border-white/10">
                <div>
                  <span className="px-3 py-1 bg-accent-500/20 text-accent-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {previewImage.category || 'Service'}
                  </span>
                  <h3 className="text-xl font-extrabold font-display mt-1 text-white">{previewImage.title}</h3>
                  {previewImage.duration && (
                    <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
                      ⏱️ {previewImage.duration} mins session
                    </p>
                  )}
                </div>
                {previewImage.price !== undefined && previewImage.price !== '' && (
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ₹{previewImage.price}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
