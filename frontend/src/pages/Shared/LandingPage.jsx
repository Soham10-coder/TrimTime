import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Star, Scissors, Clock, Calendar, CheckCircle2, ChevronDown, Award, 
  ExternalLink, Map as MapIcon, ChevronLeft, ChevronRight, Store, ShieldCheck, Sparkles, 
  Zap, Users, ArrowRight, Navigation, Flame
} from 'lucide-react';
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

const POPULAR_CATEGORIES = [
  { id: 'Men\'s Hair Services', name: 'Haircut & Fades', icon: '✂️' },
  { id: 'Men Grooming', name: 'Beard & Shave', icon: '🧔' },
  { id: 'Women\'s Hair Services', name: 'Women Styling', icon: '💇‍♀️' },
  { id: 'Skin & Facial', name: 'Facials & Glow', icon: '✨' },
  { id: 'Hair Color', name: 'Hair Color', icon: '🧪' },
  { id: 'Spa', name: 'Massage & Spa', icon: '💆‍♂️' },
  { id: 'Nails', name: 'Nails & Care', icon: '💅' },
  { id: 'Bridal', name: 'Groom & Bridal', icon: '🤵' }
];

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
      className="bg-white dark:bg-brand-900 overflow-hidden rounded-3xl border border-brand-200/80 dark:border-brand-800/80 hover:shadow-2xl dark:hover:shadow-brand-950/40 transition-all duration-300 flex flex-col group relative"
    >
      <div className="relative h-56 bg-brand-100 dark:bg-brand-800 overflow-hidden select-none">
        <img
          src={images[activeImgIndex]}
          alt={b.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-white/20"
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
                    ? 'w-5 bg-accent-400' 
                    : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {b.closedToday ? (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-500/90 backdrop-blur-md text-white rounded-full text-[10px] font-extrabold shadow-md z-10 uppercase tracking-wider">
            Closed Today
          </div>
        ) : (
          <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-[10px] font-extrabold shadow-md z-10 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Open Now
          </div>
        )}

        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1 z-10 border border-white/20">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{b.ratingCount > 0 && b.ratingAvg ? b.ratingAvg.toFixed(1) : "New"}</span>
          {b.ratingCount > 0 && <span className="text-gray-300 font-normal">({b.ratingCount})</span>}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-accent-600 dark:text-accent-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
            <span>Verified Partner Salon</span>
          </div>
          
          <h3 className="text-xl font-extrabold font-display text-brand-900 dark:text-brand-50 group-hover:text-accent-500 transition-colors line-clamp-1">
            {b.shopName}
          </h3>
          <p className="text-xs text-brand-500 dark:text-brand-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
            <span className="truncate">{b.address || b.city}</span>
          </p>
        </div>

        <a
          href={b.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${b.lat || 18.5204},${b.lng || 73.8567}`}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs font-bold text-accent-600 dark:text-accent-400 flex items-center justify-between hover:bg-accent-50 dark:hover:bg-brand-900 transition-all"
        >
          <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-accent-500" /> GPS Map Location</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        
        <div className="flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 border-t border-brand-100 dark:border-brand-850 pt-3">
          <span className="flex items-center gap-1 font-medium text-brand-500">
            <Clock className="w-3.5 h-3.5 text-accent-500" />
            {b.openingTime} - {b.closingTime}
          </span>
          <span className="flex items-center gap-1 font-bold bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 px-2.5 py-1 rounded-xl text-[11px]">
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
          className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-accent-500/20 active:scale-98 flex items-center justify-center gap-2 mt-2"
        >
          <span>Book Appointment</span>
          <ArrowRight className="w-4 h-4" />
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
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchBarbers(searchCity, searchShop, filterCategory, filterSalonType, maxPrice);
  };

  const handleCategoryClick = (catId) => {
    const newCat = filterCategory === catId ? '' : catId;
    setFilterCategory(newCat);
    setCurrentPage(1);
    fetchBarbers(searchCity, searchShop, newCat, filterSalonType, maxPrice);
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
    { q: "How do I book an appointment on TrimTime?", a: "Simply browse our list of verified partner salons, choose your favorite shop and styling services, pick an available real-time time slot, pay securely via Razorpay, and receive your instant check-in OTP code!" },
    { q: "Can I cancel or reschedule my booking?", a: "Yes! You can cancel your appointment up to 24 hours prior to the slot through your Customer Dashboard for an automated 100% full refund." },
    { q: "How do salon owners register their shop?", a: "Click on 'List Your Salon' in the header navigation or the Partner Banner below. Fill in your shop details, photos, and staff roster. Once verified, your salon shop goes live to thousands of nearby customers!" },
    { q: "Is online payment safe?", a: "100% safe. All transactions are routed securely through Razorpay supporting UPI (GPay, PhonePe, Paytm), Credit/Debit cards, and Net Banking." }
  ];

  // Default map center
  const defaultCenter = userCoords
    ? userCoords
    : (barbers.length > 0 && barbers[0].lat ? [barbers[0].lat, barbers[0].lng] : [18.5204, 73.8567]);

  return (
    <div className="relative overflow-hidden bg-brand-50/50 dark:bg-brand-950 transition-colors">
      
      {/* 1. HERO SECTION (Fresha & Airbnb Style) */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 flex flex-col items-center text-center px-4 bg-gradient-to-b from-accent-50/80 via-brand-50/50 to-transparent dark:from-brand-900/80 dark:via-brand-950/50 dark:to-transparent">
        {/* Background Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-accent-400/20 dark:bg-accent-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto z-10"
        >
          {/* Startup Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 shadow-md rounded-full mb-6">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-ping" />
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-extrabold text-brand-900 dark:text-brand-50 tracking-wide uppercase">
              India's Premier Salon & Grooming Marketplace
            </span>
          </div>

          {user ? (
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-900 dark:text-brand-50 tracking-tight leading-tight">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400">{user.name}</span>!
            </h1>
          ) : (
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-brand-900 dark:text-brand-50 leading-[1.1] tracking-tight">
              Book Top Salons & Stylists. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-accent-500 to-amber-500">Zero Wait Time.</span>
            </h1>
          )}

          {user ? (
            <p className="mt-3 text-sm sm:text-base text-brand-600 dark:text-brand-400 max-w-xl mx-auto font-medium">
              Manage your hair sessions, explore nearby salons, or access your active dashboard.
            </p>
          ) : (
            <p className="mt-6 text-base sm:text-xl text-brand-600 dark:text-brand-300 max-w-2xl mx-auto font-medium leading-relaxed">
              Discover top-rated barbers, pick customized grooming services, select real-time open slots, and confirm appointments instantly.
            </p>
          )}

          {!user ? (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a 
                href="#search-barber" 
                className="px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white rounded-2xl font-extrabold shadow-xl shadow-accent-500/25 transition-all text-sm uppercase tracking-wider transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Book Appointment Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link 
                to="/barber/signup" 
                className="px-8 py-4 bg-white dark:bg-brand-900 hover:bg-brand-100 dark:hover:bg-brand-850 text-brand-900 dark:text-brand-100 border border-brand-200 dark:border-brand-750 rounded-2xl font-extrabold transition-all text-sm uppercase tracking-wider transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-accent-500" />
                <span>List Your Salon</span>
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-6 max-w-3xl mx-auto">
              <div className="flex justify-center">
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'} 
                  className="px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white rounded-2xl font-extrabold shadow-xl shadow-accent-500/25 transition-all text-sm uppercase tracking-wider transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Award className="w-5 h-5 text-yellow-300" /> Go to Your Dashboard
                </Link>
              </div>

              {/* POST-LOGIN INTERACTIVE STEP GUIDES */}
              <div className="text-left bg-white/80 dark:bg-brand-900/80 backdrop-blur-md border border-brand-200 dark:border-brand-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
                <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-800 pb-4">
                  <h3 className="text-lg font-extrabold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent-500" /> {user.role === 'barber' ? 'Salon Owner Quick Guide' : user.role === 'admin' ? 'Admin Quick Guide' : 'Customer Quick Guide'}
                  </h3>
                  <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-xs bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-800 dark:text-brand-200 font-bold px-3.5 py-1.5 rounded-xl transition-all"
                  >
                    {showGuide ? "Hide Guide" : "Show Guide"}
                  </button>
                </div>

                {showGuide && user.role === 'customer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">1. Find a Salon Shop</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Filter by city, pricing, or salon type (Men, Women, Unisex) below.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">2. Select Multiple Services</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Pick haircuts, beard trims, or facial sessions in one single booking.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">3. Choose Stylist & Time</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Select your favorite barber staff member and open 1-hour time slots.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">4. Secure Payment & OTP</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Pay via Razorpay and receive your 6-digit OTP code for instant check-in!</p>
                    </div>
                  </div>
                )}

                {showGuide && user.role === 'barber' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">1. Configure Services Catalog</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Set your pricing and service list under Catalog Settings.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">2. Manage Staff Shifts & Breaks</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Add staff members with custom shift hours and lunch breaks.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">3. Book Walk-In Customers</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Reserve 1-hour offline slots for walk-in clients directly from your dashboard.</p>
                    </div>
                    <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl space-y-1 border border-brand-100 dark:border-brand-850">
                      <span className="text-accent-500 font-extrabold block text-sm">4. Verify Check-In OTP</span>
                      <p className="text-brand-500 font-medium leading-relaxed">Verify customer 6-digit check-in codes upon salon arrival.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* 2. TRUST STATS & PROOF BAR (Fresha & Booksy Style) */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 mb-12 relative z-20">
        <div className="bg-white dark:bg-brand-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-200/80 dark:border-brand-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-brand-100 dark:border-brand-800 last:border-0">
            <div className="flex justify-center text-accent-500 mb-1">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-brand-900 dark:text-brand-50">10,000+</div>
            <div className="text-xs font-bold text-brand-500 uppercase tracking-wider">Happy Customers</div>
          </div>
          <div className="space-y-1 md:border-r border-brand-100 dark:border-brand-800 last:border-0">
            <div className="flex justify-center text-amber-500 mb-1">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-brand-900 dark:text-brand-50">4.9 ★</div>
            <div className="text-xs font-bold text-brand-500 uppercase tracking-wider">Average Rating</div>
          </div>
          <div className="space-y-1 border-r border-brand-100 dark:border-brand-800 last:border-0">
            <div className="flex justify-center text-emerald-500 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-brand-900 dark:text-brand-50">100%</div>
            <div className="text-xs font-bold text-brand-500 uppercase tracking-wider">Verified Salons</div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-center text-purple-500 mb-1">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-brand-900 dark:text-brand-50">0 Mins</div>
            <div className="text-xs font-bold text-brand-500 uppercase tracking-wider">Salon Waiting Time</div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC SEARCH & FILTERS BOX (Booksy / Airbnb Style) */}
      <section id="search-barber" className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-brand-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-200/80 dark:border-brand-800/80 space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-brand-100 dark:border-brand-850 pb-4">
            <div>
              <h2 className="text-2xl font-black font-display text-brand-900 dark:text-brand-50">Find & Book Nearby Salons</h2>
              <p className="text-xs text-brand-500 mt-0.5">Filter by city, salon type, category, or maximum price.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{barbers.length} Salons Live</span>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            {/* ROW 1: PRIMARY INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-5">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-accent-500" />
                <input
                  type="text"
                  placeholder="Enter City (e.g. Pune, Mumbai, Delhi)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50 transition-all"
                />
              </div>

              <div className="relative md:col-span-5">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-accent-500" />
                <input
                  type="text"
                  placeholder="Search Salon Name (e.g. Luxe Cut Studio)"
                  value={searchShop}
                  onChange={(e) => setSearchShop(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full md:col-span-2 py-3.5 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl font-extrabold transition-all text-xs uppercase tracking-wider shadow-lg shadow-accent-500/20 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

            {/* ROW 2: FILTERS & SORT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="relative">
                <Scissors className="absolute left-3.5 top-3.5 h-4 w-4 text-brand-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs focus:ring-2 focus:ring-accent-500 text-brand-800 dark:text-brand-200 appearance-none font-bold cursor-pointer"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <Store className="absolute left-3.5 top-3.5 h-4 w-4 text-brand-400" />
                <select
                  value={filterSalonType}
                  onChange={(e) => setFilterSalonType(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs focus:ring-2 focus:ring-accent-500 text-brand-800 dark:text-brand-200 appearance-none font-bold cursor-pointer"
                >
                  <option value="">All Salon Types</option>
                  <option value="Men's Salon">Men's Salons</option>
                  <option value="Women's Salon">Women's Salons</option>
                  <option value="Unisex Salon">Unisex Salons</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[10px] text-brand-400 font-extrabold uppercase">Max ₹</span>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-16 pr-8 py-3 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs focus:ring-2 focus:ring-accent-500 text-brand-800 dark:text-brand-200 appearance-none font-bold cursor-pointer"
                >
                  <option value="">Any Price</option>
                  <option value="150">Max: ₹150</option>
                  <option value="250">Max: ₹250</option>
                  <option value="400">Max: ₹400</option>
                  <option value="600">Max: ₹600</option>
                  <option value="1000">Max: ₹1000</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs focus:ring-2 focus:ring-accent-500 text-accent-600 dark:text-accent-400 appearance-none font-extrabold cursor-pointer"
                >
                  <option value="">Sort By: Default</option>
                  <option value="rating">Sort By: Top Rated ★</option>
                  <option value="experience">Sort By: Barber Experience</option>
                  <option value="name">Sort By: Name (A-Z)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-accent-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </section>

      {/* 4. POPULAR CATEGORIES CAROUSEL (Urban Company & Airbnb Style) */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-extrabold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" /> Popular Services & Treatments
            </h3>
            <p className="text-xs text-brand-500 mt-0.5">Click any category to filter salons offering that service.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {POPULAR_CATEGORIES.map((cat) => {
            const isSelected = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`p-4 rounded-3xl border text-center transition-all duration-300 flex flex-col items-center justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-500 text-white border-accent-500 shadow-xl scale-105 ring-2 ring-accent-300'
                    : 'bg-white dark:bg-brand-900 border-brand-200/80 dark:border-brand-800 hover:border-accent-400 hover:shadow-md text-brand-900 dark:text-brand-50'
                }`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-bold line-clamp-1">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. BARBER RESULTS LIST */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="barbers">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black font-display text-brand-900 dark:text-brand-50">Verified Partner Salons</h2>
            <p className="text-xs text-brand-500 mt-0.5">Handpicked premium shops with live online slot booking.</p>
          </div>
          <span className="px-3.5 py-1.5 bg-brand-100 dark:bg-brand-850 rounded-full text-xs font-extrabold text-brand-700 dark:text-brand-300">
            {barbers.length} active listings
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-brand-200 dark:border-brand-800 rounded-3xl p-5 animate-pulse space-y-4 bg-white dark:bg-brand-900">
                <div className="bg-brand-200 dark:bg-brand-800 h-52 rounded-2xl w-full"></div>
                <div className="h-6 bg-brand-200 dark:bg-brand-800 rounded-xl w-2/3"></div>
                <div className="h-4 bg-brand-200 dark:bg-brand-800 rounded-xl w-1/2"></div>
                <div className="h-12 bg-brand-200 dark:bg-brand-800 rounded-2xl w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : barbers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-brand-900 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-3">
            <Scissors className="w-12 h-12 text-brand-300 dark:text-brand-700 mx-auto" />
            <h3 className="text-lg font-bold text-brand-800 dark:text-brand-200">No Partner Salons Found</h3>
            <p className="text-xs text-brand-500 dark:text-brand-400 max-w-sm mx-auto">Try resetting your filters or searching for a different city.</p>
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
                  className="p-3 bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-800 dark:text-brand-200 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.ceil(getSortedBarbers().length / 6) }, (_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                      currentPage === idx + 1
                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20 scale-105'
                        : 'bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-800 dark:text-brand-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === Math.ceil(getSortedBarbers().length / 6)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getSortedBarbers().length / 6), prev + 1))}
                  className="p-3 bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-800 dark:text-brand-200 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 6. INTERACTIVE SALONS MAP SECTION */}
      {barbers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-200/80 dark:border-brand-800/80 p-6 sm:p-8 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-850 pb-4">
              <div>
                <h3 className="text-xl font-extrabold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-accent-500" /> Interactive City Salons Map
                </h3>
                <p className="text-xs text-brand-500 mt-0.5">Click any map marker to view shop photos, full address, and GPS directions.</p>
              </div>
              <button
                onClick={() => setShowMapView(!showMapView)}
                className="px-4 py-2 bg-brand-100 dark:bg-brand-800 hover:bg-brand-200 text-brand-800 dark:text-brand-200 text-xs font-bold rounded-xl transition-all"
              >
                {showMapView ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMapView && (
              <div className="w-full h-96 rounded-2xl overflow-hidden border border-brand-200 dark:border-brand-800 shadow-inner relative z-0">
                <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true} className="w-full h-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {barbers.map((b) => (
                    b.lat && b.lng && (
                      <Marker key={b.id} position={[b.lat, b.lng]}>
                        <Popup>
                          <div className="p-1 text-xs space-y-1.5 font-sans">
                            <strong className="block font-bold text-sm text-brand-900">{b.shopName}</strong>
                            <p className="text-brand-600">{b.address}, {b.city}</p>
                            <div className="pt-2 flex gap-2">
                              <button
                                onClick={() => navigate(`/book/${b.id}`)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                Book Appointment
                              </button>
                              <a
                                href={b.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                              >
                                GPS Maps <ExternalLink className="w-2.5 h-2.5" />
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

      {/* 7. HOW IT WORKS 3-STEP BREAKDOWN (Urban Company Style) */}
      <section className="bg-gradient-to-b from-brand-100/60 to-brand-50/20 dark:from-brand-900/40 dark:to-brand-950 py-20 transition-colors" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3.5 py-1 bg-accent-100 dark:bg-accent-950 text-accent-600 dark:text-accent-400 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
              Seamless 3-Step Process
            </span>
            <h2 className="text-3.5xl font-black font-display text-brand-900 dark:text-brand-50 mt-3">How TrimTime Works</h2>
            <p className="mt-3 text-brand-600 dark:text-brand-400 text-sm font-medium">Book top-rated grooming sessions in less than 60 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl shadow-sm border border-brand-200/80 dark:border-brand-800/80 text-center space-y-4 relative">
              <div className="w-14 h-14 bg-accent-500 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-lg shadow-accent-500/20">
                1
              </div>
              <h3 className="text-xl font-extrabold text-brand-900 dark:text-brand-50 font-display">Discover Salons</h3>
              <p className="text-brand-600 dark:text-brand-400 text-xs leading-relaxed">
                Browse verified local salons by city, reviews, services, or distance. Explore shop photos and customer ratings.
              </p>
            </div>
            
            <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl shadow-sm border border-brand-200/80 dark:border-brand-800/80 text-center space-y-4 relative">
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="text-xl font-extrabold text-brand-900 dark:text-brand-50 font-display">Choose Stylist & Slot</h3>
              <p className="text-brand-600 dark:text-brand-400 text-xs leading-relaxed">
                Select your favorite stylist, pick your preferred services, and choose an open 1-hour time slot on the live calendar.
              </p>
            </div>

            <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl shadow-sm border border-brand-200/80 dark:border-brand-800/80 text-center space-y-4 relative">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-lg shadow-emerald-500/20">
                3
              </div>
              <h3 className="text-xl font-extrabold text-brand-900 dark:text-brand-50 font-display">Zero-Wait Check-In</h3>
              <p className="text-brand-600 dark:text-brand-400 text-xs leading-relaxed">
                Pay securely via Razorpay, receive your instant 6-digit OTP code, and walk straight into your haircut session!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SALON PARTNER GROWTH BANNER (Fresha Partner & Booksy Vibe) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-950 to-brand-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-brand-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl text-center lg:text-left z-10">
            <span className="px-3.5 py-1.5 bg-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-wider rounded-full border border-accent-500/30">
              For Salon Owners & Barber Partners
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-tight">
              Grow Your Salon Business With TrimTime
            </h2>
            <p className="text-sm text-brand-300 leading-relaxed">
              Automate your online bookings, manage staff schedules, accept walk-in clients, eliminate double bookings, and track daily revenue with 0 setup fee.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-brand-300 justify-center lg:justify-start pt-2">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Setup & Listing</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Walk-In & Online Sync</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant UPI Payouts</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 z-10 w-full lg:w-auto">
            <Link
              to="/barber/signup"
              className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-accent-500/30 transition-all text-center"
            >
              List Your Salon Shop
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider border border-white/20 transition-all text-center"
            >
              Partner Login
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FAQs ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black font-display text-brand-900 dark:text-brand-50">Frequently Asked Questions</h2>
          <p className="text-xs text-brand-500 mt-1">Everything you need to know about booking on TrimTime.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-brand-200/80 dark:border-brand-800 rounded-2xl overflow-hidden bg-white dark:bg-brand-900 shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-sm text-brand-900 dark:text-brand-50 hover:bg-brand-50/50 dark:hover:bg-brand-850/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-accent-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4 pt-1 text-xs text-brand-600 dark:text-brand-400 leading-relaxed border-t border-brand-100 dark:border-brand-850"
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
