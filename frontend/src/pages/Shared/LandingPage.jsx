import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Star, Scissors, Clock, Calendar, CheckCircle2, ChevronDown, Award, ExternalLink, Map as MapIcon, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function BarberCard({ b, navigate }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const images = b.shopImages && b.shopImages.length > 0
    ? b.shopImages
    : (b.profilePic ? [b.profilePic] : ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop']);

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="glass-card overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 hover:shadow-lg dark:hover:shadow-brand-950/20 transition-all flex flex-col group relative"
    >
      <div className="relative h-48 bg-brand-200 dark:bg-brand-800 overflow-hidden select-none">
        <img
          src={images[activeImgIndex]}
          alt={b.shopName}
          className="w-full h-full object-cover transition-all duration-300"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeImgIndex 
                    ? 'w-4.5 bg-white' 
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {b.closedToday && (
          <div className="absolute top-4 left-4 px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold shadow-md z-10 uppercase tracking-wider">
            Closed Today
          </div>
        )}

        <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/95 dark:bg-brand-900/95 rounded-lg text-xs font-bold text-brand-900 dark:text-brand-50 shadow-md flex items-center gap-1 z-10">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{b.ratingCount > 0 && b.ratingAvg ? b.ratingAvg.toFixed(1) : "New"}</span>
          {b.ratingCount > 0 && <span className="text-brand-400 font-normal">({b.ratingCount})</span>}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 group-hover:text-accent-500 transition-colors">
            {b.shopName}
          </h3>
          <p className="text-xs text-brand-500 dark:text-brand-400 mt-1 flex items-start gap-1">
            <MapPin className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
            <span>{b.address || b.city}</span>
          </p>
        </div>

        <a
          href={b.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${b.lat || 18.5204},${b.lng || 73.8567}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-bold text-accent-600 flex items-center justify-between hover:bg-accent-50"
        >
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-500" /> View Shop Map Location</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        
        <div className="flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 border-t border-brand-100 dark:border-brand-800/60 pt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-accent-500" />
            {b.openingTime} - {b.closingTime}
          </span>
          <span className="flex items-center gap-1 font-medium bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-brand-300 px-2 py-0.5 rounded">
            <Award className="w-3 h-3 text-accent-500" />
            {(() => {
              const activeStaff = (b.staff || []).filter(s => s.status !== 'INACTIVE');
              const avgStaffExp = activeStaff.length > 0
                ? (activeStaff.reduce((acc, curr) => acc + parseFloat(curr.experience || 0), 0) / activeStaff.length).toFixed(1)
                : null;
              return avgStaffExp ? `${avgStaffExp} Yrs Staff Exp` : `${b.experience || 0} Yrs Exp`;
            })()}
          </span>
        </div>

        <button
          onClick={() => navigate(`/book/${b.id}`)}
          className="w-full py-2.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md mt-2"
        >
          Book Appointment
        </button>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchShop, setSearchShop] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSalonType, setFilterSalonType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [showMapView, setShowMapView] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGuide, setShowGuide] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBarbers();
    
    // Automatically prompt browser geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("User geolocation denied or unavailable:", error);
        }
      );
    }
  }, []);

  const fetchBarbers = async (city = '', shop = '', category = '', salonType = '', maxPriceVal = '') => {
    setLoading(true);
    try {
      let query = `?city=${city}&search=${shop}&category=${category}&salonType=${salonType}&maxPrice=${maxPriceVal}`;
      const res = await api.get(`/barber/browse${query}`);
      if (res.ok) {
        const data = await res.json();
        setBarbers(data);
      }
    } catch (e) {
      console.error("Failed to fetch barbers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBarbers(searchCity, searchShop, filterCategory, filterSalonType, maxPrice);
  };

  const getSortedBarbers = () => {
    let list = [...barbers];
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    } else if (sortBy === 'experience') {
      list.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.shopName.localeCompare(b.shopName));
    }
    return list;
  };

  const faqs = [
    { q: "How do I book an appointment?", a: "Simply browse our list of verified barbers, select a shop, choose your preferred hairstyle, pick an available slot, make your secure payment online, and your booking is instantly confirmed!" },
    { q: "Can I cancel or reschedule my slot?", a: "Yes, you can cancel your appointment up to 24 hours prior to the slot through your Customer Dashboard for a full automated refund. Cancellations under 24 hours are non-refundable." },
    { q: "How do shop owners register?", a: "Click on the 'List Your Shop' button in the navbar. Fill in the required fields (experience, location, pictures, PAN/Aadhaar proof) and submit. Once verified by our admin, your shop will go live!" },
    { q: "Is online payment safe?", a: "Absolutely. We route all payments through Razorpay, which supports UPI, Credit/Debit cards, Net Banking, and secure wallets, fully backed by verification webhooks." }
  ];

  // Default map center
  const defaultCenter = userCoords
    ? userCoords
    : (barbers.length > 0 && barbers[0].lat ? [barbers[0].lat, barbers[0].lng] : [18.5204, 73.8567]);

  return (
    <div className="relative overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-20 lg:py-32 flex flex-col items-center text-center px-4 bg-gradient-to-b from-accent-50/70 to-brand-50 dark:from-brand-950 dark:to-brand-900 transition-colors">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-accent-200 dark:bg-accent-950/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-yellow-300 dark:bg-amber-950/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <span className="px-4 py-1.5 bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-400 text-xs font-bold rounded-full uppercase tracking-wider">
            Barber Booking, Reimagined
          </span>
          {user ? (
            <h1 className="mt-6 font-display text-2xl sm:text-3.5xl font-bold text-brand-900 dark:text-brand-50">
              Welcome back to <span className="text-accent-500">TrimTime</span>
            </h1>
          ) : (
            <h1 className="mt-6 font-display text-4xl sm:text-6xl font-extrabold text-brand-900 dark:text-brand-50 leading-tight tracking-tight">
              Grooming On Your Schedule. <br/>
              Book In <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-500">Trim Time</span>.
            </h1>
          )}

          {user ? (
            <p className="mt-2 text-sm text-brand-500 dark:text-brand-400 max-w-lg mx-auto">
              Your personalized hub to manage styling sessions, appointments, and salon schedules.
            </p>
          ) : (
            <p className="mt-6 text-lg sm:text-xl text-brand-600 dark:text-brand-300 max-w-2xl mx-auto leading-relaxed">
              Discover top-rated local barbers, select specialized hairstyles, check real-time dynamic schedules, and confirm bookings instantly.
            </p>
          )}

          {!user ? (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a 
                href="#search-barber" 
                className="px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white rounded-xl font-bold shadow-lg shadow-accent-500/10 hover:shadow-accent-500/25 transition-all text-base transform hover:-translate-y-0.5"
              >
                Book Appointment Now
              </a>
              <Link 
                to="/barber/signup" 
                className="px-8 py-4 bg-white dark:bg-brand-900 hover:bg-brand-100 dark:hover:bg-brand-800 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 rounded-xl font-bold transition-all text-base transform hover:-translate-y-0.5"
              >
                Register as Barber
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-8 max-w-3xl mx-auto">
              <div className="flex justify-center">
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'} 
                  className="px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white rounded-xl font-bold shadow-lg shadow-accent-500/10 hover:shadow-accent-500/25 transition-all text-base transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Award className="w-5 h-5 text-yellow-300" /> Go to Your Dashboard
                </Link>
              </div>

              {/* POST-LOGIN INTERACTIVE STEP GUIDES */}
              <div className="text-left bg-white/60 dark:bg-brand-900/60 backdrop-blur border border-brand-200 dark:border-brand-800 p-6 sm:p-8 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent-500" /> {user.role === 'barber' ? 'Salon Guide' : user.role === 'admin' ? 'Admin Guide' : 'Customer Guide'}
                  </h3>
                  <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-xs bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-300 font-bold px-3 py-1.5 rounded-xl transition-all"
                  >
                    {showGuide ? "Hide Guide" : "Show Guide"}
                  </button>
                </div>

                {showGuide && user.role === 'customer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">1. Find a Barber Shop</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Scroll down to use our filters to search for the best salons in your city.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">2. Select Multiple Services</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Pick a shop, choose multiple grooming services (haircuts, facial, nails) and add them to your booking.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">3. Choose Stylist & Slots</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Select your favorite stylist, picking the available date & time slot for your appointment.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">4. Apply Coupons & Checkout</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Input discount coupons at checkout, complete payments via Razorpay, and view your OTP code!</p>
                    </div>
                  </div>
                )}

                {showGuide && user.role === 'barber' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">1. Configure Your Services</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Go to the Catalog Settings tab on your dashboard to select services from the Master Pool and set your pricing.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">2. Add Shop Stylists</span>
                      <p className="text-brand-500 font-medium leading-relaxed">List your stylists under the Staff Management tab to enable customers to select them during booking.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">3. Manage Shop Appointments</span>
                      <p className="text-brand-500 font-medium leading-relaxed">View all client reservations in real-time, update their status, or track daily shop schedule load.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">4. Verify Customer Check-In OTP</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Input the customer's 6-digit OTP code when they arrive at the salon to validate their presence.</p>
                    </div>
                  </div>
                )}

                {showGuide && user.role === 'admin' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">1. Approve Barber Salons</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Review incoming barber shop requests and approve their profiles to make them live on the app.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">2. Manage Master Catalog</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Oversee and update the core catalog of 79+ services and upload S3 cover images.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">3. Create Promos & Coupons</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Generate discount coupons (fixed or percentage-based) and distribute them to customers.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1">
                      <span className="text-accent-500 font-extrabold block text-sm">4. Monitor Platform Analytics</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Observe bookings, user registrations, revenue counts, and performance metrics per salon.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* 2. DYNAMIC SEARCH SECTION */}
      <section id="search-barber" className="max-w-7xl mx-auto px-4 py-12 -mt-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-panel p-6 sm:p-8 rounded-2xl shadow-xl border border-brand-200 dark:border-brand-800"
        >
          <h2 className="text-xl font-bold text-brand-900 dark:text-brand-50 mb-6 font-display">Find Your Ideal Barber Shop</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            {/* ROW 1: PRIMARY INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-5">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
                <input
                  type="text"
                  placeholder="Search City (e.g. Pune)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50 font-semibold"
                />
              </div>

              <div className="relative md:col-span-5">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
                <input
                  type="text"
                  placeholder="Shop Name (e.g. Luxe Cut)"
                  value={searchShop}
                  onChange={(e) => setSearchShop(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full md:col-span-2 py-3 bg-brand-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-500 text-white rounded-xl font-bold transition-all text-sm shadow-md"
              >
                Search Salons
              </button>
            </div>

            {/* ROW 2: FILTERS & SORT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-brand-100 dark:border-brand-800/60">
              <div className="relative">
                <Scissors className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-700 dark:text-brand-300 appearance-none font-bold"
                >
                  <option value="">All Services</option>
                  <option value="Men's Hair Services">Men's Hair Services</option>
                  <option value="Women's Hair Services">Women's Hair Services</option>
                  <option value="Kids Hair Services">Kids Hair Services</option>
                  <option value="Men Grooming">Men's Grooming & Shaving</option>
                  <option value="Skin & Facial">Skin & Facials</option>
                  <option value="Makeup">Makeup & Styling</option>
                  <option value="Nails">Nails & Manicure</option>
                  <option value="Hair Removal">Waxing & Hair Removal</option>
                  <option value="Spa">Spa & Head Massages</option>
                  <option value="Eyebrows & Eyelashes">Eyebrows & Eyelashes</option>
                  <option value="Bridal">Bridal Packages</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <Store className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
                <select
                  value={filterSalonType}
                  onChange={(e) => setFilterSalonType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-700 dark:text-brand-300 appearance-none font-bold"
                >
                  <option value="">All Salon Types</option>
                  <option value="Men's Salon">Men's Salons</option>
                  <option value="Women's Salon">Women's Salons</option>
                  <option value="Unisex Salon">Unisex Salons</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-[10px] text-brand-450 font-bold uppercase">Max ₹</span>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-16 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-700 dark:text-brand-300 appearance-none font-bold"
                >
                  <option value="">Any Price</option>
                  <option value="150">Max: ₹150</option>
                  <option value="250">Max: ₹250</option>
                  <option value="400">Max: ₹400</option>
                  <option value="600">Max: ₹600</option>
                  <option value="1000">Max: ₹1000</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-accent-700 dark:text-accent-400 appearance-none font-extrabold"
                >
                  <option value="">Sort By: Default</option>
                  <option value="rating">Sort By: Top Rated</option>
                  <option value="experience">Sort By: Experience</option>
                  <option value="name">Sort By: Name (A-Z)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="w-4 h-4 text-accent-500" />
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </section>

      {/* 3. BARBER RESULTS LIST */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="barbers">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50">Verified Barber Shops</h2>
          <span className="text-sm font-medium text-brand-500 dark:text-brand-400">{barbers.length} active listings</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-brand-200 dark:border-brand-800 rounded-2xl p-4 animate-pulse space-y-4">
                <div className="bg-brand-200 dark:bg-brand-800 h-48 rounded-xl w-full"></div>
                <div className="h-6 bg-brand-200 dark:bg-brand-800 rounded w-2/3"></div>
                <div className="h-4 bg-brand-200 dark:bg-brand-800 rounded w-1/2"></div>
                <div className="h-10 bg-brand-200 dark:bg-brand-800 rounded w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : barbers.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-brand-900/50 rounded-2xl border border-brand-200 dark:border-brand-800">
            <Scissors className="w-12 h-12 text-brand-300 dark:text-brand-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-800 dark:text-brand-200">No Shops Found</h3>
            <p className="text-brand-500 dark:text-brand-400 mt-1">Try resetting your filters or searching a different city.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {getSortedBarbers().slice((currentPage - 1) * 6, (currentPage - 1) * 6 + 6).map((b) => (
                <BarberCard key={b.id} b={b} navigate={navigate} />
              ))}
            </motion.div>

            {Math.ceil(getSortedBarbers().length / 6) > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2.5 bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.ceil(getSortedBarbers().length / 6) }, (_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentPage === idx + 1
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-350'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === Math.ceil(getSortedBarbers().length / 6)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getSortedBarbers().length / 6), prev + 1))}
                  className="p-2.5 bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. INTERACTIVE SALONS MAP SECTION */}
      {user && barbers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-200 dark:border-brand-800 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-accent-500" /> Interactive City Salons Map
                </h3>
                <p className="text-xs text-brand-500">Click any map pin to view shop details, address, and Google Maps directions.</p>
              </div>
              <button
                onClick={() => setShowMapView(!showMapView)}
                className="px-3.5 py-1.5 bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-xl"
              >
                {showMapView ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMapView && (
              <div className="w-full h-80 rounded-2xl overflow-hidden border shadow-inner relative z-0">
                <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true} className="w-full h-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {barbers.map((b) => (
                    b.lat && b.lng && (
                      <Marker key={b.id} position={[b.lat, b.lng]}>
                        <Popup>
                          <div className="p-1 text-xs space-y-1 font-sans">
                            <strong className="block font-bold text-sm text-brand-900">{b.shopName}</strong>
                            <p className="text-brand-600">{b.address}, {b.city}</p>
                            <div className="pt-2 flex gap-2">
                              <button
                                onClick={() => navigate(`/book/${b.id}`)}
                                className="px-2.5 py-1 bg-amber-500 text-white rounded text-[10px] font-bold"
                              >
                                Book Now
                              </button>
                              <a
                                href={b.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-stone-800 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                              >
                                Maps <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. WHY CHOOSE US */}
      <section className="bg-brand-100/50 dark:bg-brand-900/30 py-20 transition-colors" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3.5xl font-bold font-display text-brand-900 dark:text-brand-50">Why Choose TrimTime?</h2>
            <p className="mt-4 text-brand-600 dark:text-brand-400">We make haircut scheduling premium, simple, and entirely transparent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-brand-900 p-8 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-800 text-center">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-950 text-accent-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-900 dark:text-brand-50 font-display mb-3">Top Verified Stylists</h3>
              <p className="text-brand-600 dark:text-brand-400 text-sm">Every barber shop is fully vetted, checked for certifications, and validated with background checks before going live.</p>
            </div>
            
            <div className="bg-white dark:bg-brand-900 p-8 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-800 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/20 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-900 dark:text-brand-50 font-display mb-3">Dynamic Live Slots</h3>
              <p className="text-brand-600 dark:text-brand-400 text-sm">See accurate schedules. Bookings automatically account for hairstyle durations and buffer times to prevent double bookings.</p>
            </div>

            <div className="bg-white dark:bg-brand-900 p-8 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-800 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-900 dark:text-brand-50 font-display mb-3">Secure Razorpay Checkouts</h3>
              <p className="text-brand-600 dark:text-brand-400 text-sm">Pay securely via UPI, Card, Net Banking or Wallets. Instant automated billing invoices and simple 24-hr refunds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQs ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center font-display text-brand-900 dark:text-brand-50 mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-brand-200 dark:border-brand-800 rounded-xl overflow-hidden bg-white/30 dark:bg-brand-900/30">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center font-semibold text-brand-800 dark:text-brand-200 hover:bg-brand-100/50 dark:hover:bg-brand-800/30 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-brand-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4 pt-1 text-sm text-brand-600 dark:text-brand-400 leading-relaxed border-t border-brand-100 dark:border-brand-800/40"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
