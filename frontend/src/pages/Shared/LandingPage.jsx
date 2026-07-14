import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Star, Scissors, Clock, Calendar, CheckCircle2, ChevronDown, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

export default function LandingPage() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchShop, setSearchShop] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async (city = '', shop = '', category = '') => {
    setLoading(true);
    try {
      let query = `?city=${city}&search=${shop}&category=${category}`;
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
    fetchBarbers(searchCity, searchShop, filterCategory);
  };

  // Faq list
  const faqs = [
    { q: "How do I book an appointment?", a: "Simply browse our list of verified barbers, select a shop, choose your preferred hairstyle, pick an available slot, make your secure payment online, and your booking is instantly confirmed!" },
    { q: "Can I cancel or reschedule my slot?", a: "Yes, you can cancel your appointment up to 24 hours prior to the slot through your Customer Dashboard for a full automated refund. Cancellations under 24 hours are non-refundable." },
    { q: "How do shop owners register?", a: "Click on the 'List Your Shop' button in the navbar. Fill in the required fields (experience, location, pictures, PAN/Aadhaar proof) and submit. Once verified by our admin, your shop will go live!" },
    { q: "Is online payment safe?", a: "Absolutely. We route all payments through Razorpay, which supports UPI, Credit/Debit cards, Net Banking, and secure wallets, fully backed by verification webhooks." }
  ];

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
          <h1 className="mt-6 font-display text-4xl sm:text-6xl font-extrabold text-brand-900 dark:text-brand-50 leading-tight tracking-tight">
            Grooming On Your Schedule. <br/>
            Book In <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-500">Trim Time</span>.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-brand-600 dark:text-brand-300 max-w-2xl mx-auto leading-relaxed">
            Discover top-rated local barbers, select specialized hairstyles, check real-time dynamic schedules, and confirm bookings instantly.
          </p>

          {/* Call to Actions */}
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
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* City Search */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
              <input
                type="text"
                placeholder="Search City (e.g. Pune)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
              />
            </div>

            {/* Shop Name Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
              <input
                type="text"
                placeholder="Shop Name (e.g. Luxe Cut)"
                value={searchShop}
                onChange={(e) => setSearchShop(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
              />
            </div>

            {/* Hairstyle Category Selector */}
            <div className="relative">
              <Scissors className="absolute left-3 top-3.5 h-5 w-5 text-brand-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-brand-900/70 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-700 dark:text-brand-300 appearance-none"
              >
                <option value="">All Services</option>
                <option value="Fade Cut">Fade Cuts</option>
                <option value="Buzz Cut">Buzz Cuts</option>
                <option value="Beard">Beard Trimming</option>
                <option value="Coloring">Hair Coloring</option>
                <option value="Spa">Hair Spa</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-brand-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-500 text-white rounded-xl font-bold transition-all text-sm shadow-md"
            >
              Apply Search Filters
            </button>
          </form>
        </motion.div>
      </section>

      {/* 3. BARBER RESULTS LIST */}
      <section className="max-w-7xl mx-auto px-4 py-12" id="barbers">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50">Verified Barber Shops</h2>
          <span className="text-sm font-medium text-brand-500 dark:text-brand-400">{barbers.length} active listings</span>
        </div>

        {loading ? (
          // Loading Skeletons
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
          // Barber Grid
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {barbers.map((b) => (
              <motion.div
                key={b.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="glass-card overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 hover:shadow-lg dark:hover:shadow-brand-950/20 transition-all flex flex-col group"
              >
                {/* Shop Photo */}
                <div className="relative h-48 bg-brand-200 dark:bg-brand-800 overflow-hidden">
                  <img
                    src={b.shopImages[0] || b.profilePic || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop'}
                    alt={b.shopName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/95 dark:bg-brand-900/95 rounded-lg text-xs font-bold text-brand-900 dark:text-brand-50 shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{b.ratingAvg ? b.ratingAvg.toFixed(1) : "New"}</span>
                    {b.ratingCount > 0 && <span className="text-brand-400 font-normal">({b.ratingCount})</span>}
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 group-hover:text-accent-500 transition-colors">
                    {b.shopName}
                  </h3>
                  <p className="text-sm text-brand-500 dark:text-brand-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                    <span>{b.address}, {b.city}</span>
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 border-t border-brand-100 dark:border-brand-800/60 pt-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent-500" />
                      {b.openingTime} - {b.closingTime}
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-brand-300 px-2 py-0.5 rounded">
                      <Award className="w-3 h-3 text-accent-500" />
                      {b.experience} Yrs Exp
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-brand-600 dark:text-brand-400 line-clamp-2">
                    {b.description || "Premium styling, shaves, and grooming options customized for you."}
                  </p>

                  <div className="mt-5 pt-3">
                    <button
                      onClick={() => navigate(`/book/${b.id}`)}
                      className="w-full py-2.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md group-hover:shadow-accent-500/10"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 4. WHY CHOOSE US */}
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

      {/* 5. FAQs ACCORDION */}
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
