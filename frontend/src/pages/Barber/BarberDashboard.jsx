import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Calendar, Clock, DollarSign, Users, Scissors, Star, ToggleLeft, ToggleRight, Edit, Trash2, Plus, Settings, Sparkles, Check, X, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BarberDashboard() {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Dashboard Metrics
  const [bookings, setBookings] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings form states
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('20:00');
  const [weeklyHoliday, setWeeklyHoliday] = useState('6');
  const [holidayMode, setHolidayMode] = useState(false);
  const [experience, setExperience] = useState('5');
  const [description, setDescription] = useState('');
  
  // Service CRUD form states
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Fade Cut');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceFile, setServiceFile] = useState(null);

  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [serviceError, setServiceError] = useState('');

  useEffect(() => {
    fetchBarberDashboardData();
  }, []);

  const fetchBarberDashboardData = async () => {
    setLoading(true);
    try {
      const bRes = await api.get('/booking/barber');
      const hRes = await api.get(`/barber/hairstyles/${user.id}`);
      const pRes = await api.get(`/barber/profile/${user.id}`);

      if (bRes.ok && hRes.ok && pRes.ok) {
        setBookings(await bRes.json());
        setHairstyles(await hRes.json());
        
        const profile = await pRes.json();
        setReviews(profile.reviews || []);
        
        // Map settings
        setOpeningTime(profile.openingTime || '09:00');
        setClosingTime(profile.closingTime || '20:00');
        setWeeklyHoliday(profile.weeklyHoliday !== undefined ? String(profile.weeklyHoliday) : '6');
        setHolidayMode(profile.holidayMode || false);
        setExperience(profile.experience || '5');
        setDescription(profile.description || '');
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    
    const formData = new FormData();
    formData.append('openingTime', openingTime);
    formData.append('closingTime', closingTime);
    formData.append('weeklyHoliday', weeklyHoliday);
    formData.append('holidayMode', holidayMode);
    formData.append('experience', experience);
    formData.append('description', description);

    const res = await updateProfile(formData);
    if (res.success) {
      setSettingsSuccess('Schedule settings updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
      fetchBarberDashboardData();
    } else {
      alert("Failed to update settings.");
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceCategory('Fade Cut');
    setServicePrice('');
    setServiceDuration('30');
    setServiceDesc('');
    setServiceFile(null);
    setServiceModal(true);
  };

  const handleOpenEditService = (s) => {
    setEditingService(s);
    setServiceName(s.name);
    setServiceCategory(s.category);
    setServicePrice(s.price);
    setServiceDuration(String(s.duration));
    setServiceDesc(s.description || '');
    setServiceFile(null);
    setServiceModal(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceError('');

    const formData = new FormData();
    formData.append('name', serviceName);
    formData.append('category', serviceCategory);
    formData.append('price', servicePrice);
    formData.append('duration', serviceDuration);
    formData.append('description', serviceDesc);
    if (serviceFile) {
      formData.append('image', serviceFile);
    }

    try {
      let res;
      if (editingService) {
        // Edit service
        res = await api.put(`/barber/hairstyles/${editingService.id}`, formData);
      } else {
        // Add service
        res = await api.post('/barber/hairstyles', formData);
      }

      if (res.ok) {
        setServiceModal(false);
        fetchBarberDashboardData();
      } else {
        const data = await res.json();
        setServiceError(data.message || 'Operation failed');
      }
    } catch (err) {
      setServiceError('Error sending request.');
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Are you sure you want to remove this hairstyle service?")) return;
    try {
      const res = await api.delete(`/barber/hairstyles/${id}`);
      if (res.ok) {
        fetchBarberDashboardData();
      }
    } catch (e) {
      alert("Failed to delete hairstyle.");
    }
  };

  // Calculations for analytics
  const getTodayEarnings = () => {
    const today = new Date().toISOString().split('T')[0];
    const todays = bookings.filter(b => b.date === today && b.status === 'confirmed');
    return todays.reduce((sum, b) => sum + b.price, 0);
  };

  const getMonthlyEarnings = () => {
    const month = new Date().getMonth(); // 0-11
    const year = new Date().getFullYear();
    const monthly = bookings.filter(b => {
      if (b.status !== 'confirmed') return false;
      const bDate = new Date(b.date);
      return bDate.getMonth() === month && bDate.getFullYear() === year;
    });
    return monthly.reduce((sum, b) => sum + b.price, 0);
  };

  const getTodayBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date === today && b.status === 'confirmed').length;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* PROFILE HEAD */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm flex items-center justify-between mb-10">
        <div>
          <span className="text-xs text-brand-500 font-bold uppercase tracking-wider">Barber Dashboard</span>
          <h1 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50">{user.shopName}</h1>
          <p className="text-sm text-brand-600 dark:text-brand-400">Welcome back, {user.name} &bull; {user.email}</p>
        </div>
        {user.profilePic && (
          <img src={user.profilePic} className="w-16 h-16 rounded-full object-cover border" alt="Avatar" />
        )}
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <DollarSign className="w-5 h-5 text-green-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Today's Sales</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-100 font-display">₹{getTodayEarnings()}</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <DollarSign className="w-5 h-5 text-accent-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Monthly Sales</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-100 font-display">₹{getMonthlyEarnings()}</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Today's Slots</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-100 font-display">{getTodayBookings()} booked</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <ClipboardList className="w-5 h-5 text-indigo-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Upcoming Slots</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-100 font-display">
            {bookings.filter(b => b.status === 'confirmed').length} total
          </span>
        </div>
      </div>

      {/* DASHBOARD TABS SYSTEM */}
      <div className="flex border-b border-brand-200 dark:border-brand-800 mb-8 overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bookings' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointments Calendar
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'services' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Scissors className="w-4 h-4" />
          Manage Hairstyles
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Settings className="w-4 h-4" />
          Shop Settings
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reviews' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Star className="w-4 h-4" />
          Reviews List
        </button>
      </div>

      {/* --- TAB CONTENT PANELS --- */}
      <div>
        
        {/* TAB 1: BOOKINGS LIST */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent-500" />
              Appointment Records
            </h2>
            
            {bookings.length === 0 ? (
              <p className="text-center py-12 text-brand-400 text-sm">No client slots scheduled yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-50 dark:bg-brand-950 text-brand-500 uppercase text-xs font-bold border-b border-brand-200 dark:border-brand-800">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Hairstyle Service</th>
                      <th className="p-4">Price Paid</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-brand-100 dark:border-brand-800/40 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 text-brand-700 dark:text-brand-300">
                        <td className="p-4 font-bold font-mono text-xs">{b.bookingId}</td>
                        <td className="p-4 font-semibold">{b.customer.name} <br/><span className="font-normal text-xs text-brand-400">{b.customer.phone}</span></td>
                        <td className="p-4">{b.date} <br/><span className="text-xs font-semibold text-accent-600 dark:text-accent-400">{b.timeSlot}</span></td>
                        <td className="p-4">{b.hairstyle.name} <br/><span className="text-xs text-brand-400">{b.hairstyle.duration} mins</span></td>
                        <td className="p-4 font-bold text-brand-900 dark:text-brand-50">₹{b.price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/20' 
                              : b.status === 'cancelled'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/20'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE HAIRSTYLES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50">Hairstyles & Pricing</h2>
              <button
                onClick={handleOpenAddService}
                className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Hairstyle
              </button>
            </div>

            {hairstyles.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-brand-900 rounded-3xl border border-brand-200 dark:border-brand-800">
                <Scissors className="w-10 h-10 text-brand-300 dark:text-brand-700 mx-auto mb-3" />
                <h3 className="font-bold text-brand-800 dark:text-brand-200">No Services Added</h3>
                <p className="text-sm text-brand-500 mt-1">Clients can only book once you add hairstyle options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hairstyles.map((s) => (
                  <div key={s.id} className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                    <div className="h-44 bg-brand-100 overflow-hidden relative">
                      <img src={s.imageUrl || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Service pic" />
                      <span className="absolute bottom-3 left-3 bg-brand-900/90 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{s.category}</span>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold font-display text-brand-900 dark:text-brand-50 text-lg group-hover:text-accent-500 transition-colors">{s.name}</h3>
                        <p className="text-xs text-brand-500 mt-1 line-clamp-2">{s.description || 'Premium haircut customized to your style preference.'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-brand-100 dark:border-brand-800/40 flex items-center justify-between">
                        <span className="text-xs text-brand-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-accent-500" />
                          {s.duration} minutes
                        </span>
                        <span className="text-lg font-extrabold text-brand-900 dark:text-brand-50 font-display">₹{s.price}</span>
                      </div>

                      <div className="flex gap-2 mt-4 pt-2 border-t border-brand-100 dark:border-brand-800/40">
                        <button
                          onClick={() => handleOpenEditService(s)}
                          className="flex-1 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:text-accent-500 hover:border-accent-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="px-3 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHOP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent-500" />
              Schedule & Timing Customizations
            </h2>

            {settingsSuccess && (
              <div className="flex items-center gap-1.5 p-3.5 mb-6 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200">
                <Check className="w-4.5 h-4.5" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSettings} className="space-y-5">
              
              {/* Holiday Mode switch */}
              <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-brand-800 dark:text-brand-200 text-sm flex items-center gap-1.5">
                    Holiday Mode Activated
                  </h4>
                  <p className="text-xs text-brand-500 mt-0.5">Toggle to instantly suspend all client bookings slots</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHolidayMode(!holidayMode)}
                  className="focus:outline-none text-accent-500"
                >
                  {holidayMode ? (
                    <ToggleRight className="w-12 h-12 text-accent-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-brand-400" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Opening Hour</label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Closing Hour</label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Weekly Holiday</label>
                  <select
                    value={weeklyHoliday}
                    onChange={(e) => setWeeklyHoliday(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-700 dark:text-brand-300"
                  >
                    <option value="6">Sunday</option>
                    <option value="0">Monday</option>
                    <option value="1">Tuesday</option>
                    <option value="2">Wednesday</option>
                    <option value="3">Thursday</option>
                    <option value="4">Friday</option>
                    <option value="5">Saturday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Shop Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-sm transition-all"
              >
                Save Timing Profile
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: REVIEWS LIST */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm max-w-3xl">
            <h2 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent-500" />
              Customer Reviews Board
            </h2>

            {reviews.length === 0 ? (
              <p className="text-center py-12 text-brand-400 text-sm">No reviews posted yet.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((r, idx) => (
                  <div key={idx} className="border-b border-brand-100 dark:border-brand-800/40 pb-5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-brand-800 dark:text-brand-200">{r.customerName}</h4>
                      <span className="text-xs text-brand-400">{r.date}</span>
                    </div>
                    
                    <div className="flex gap-1.5 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-200'}`} />
                      ))}
                    </div>

                    <p className="text-sm text-brand-600 dark:text-brand-400 leading-relaxed italic">"{r.comment || 'Satisfactory haircut service.'}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- ADD/EDIT HAIRSTYLE SERVICE MODAL --- */}
      <AnimatePresence>
        {serviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-brand-900 max-w-md w-full p-6 rounded-3xl border border-brand-200 dark:border-brand-800 relative shadow-xl"
            >
              <button 
                onClick={() => setServiceModal(false)}
                className="absolute top-4 right-4 text-brand-400 hover:text-brand-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 mb-1">
                {editingService ? "Modify Hairstyle Service" : "Add Hairstyle Service"}
              </h3>
              <p className="text-sm text-brand-500 dark:text-brand-400 mb-6">List service names, durations and pricing tags</p>

              {serviceError && (
                <div className="flex items-center gap-1.5 p-3.5 bg-red-50 text-red-600 text-xs rounded-xl mb-4">
                  <X className="w-4 h-4" />
                  <span>{serviceError}</span>
                </div>
              )}

              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Pompadour Fade"
                    className="w-full px-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Price (INR)</label>
                    <input
                      type="number"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full px-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Duration (minutes)</label>
                    <select
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-700 dark:text-brand-300"
                    >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">60 mins</option>
                      <option value="90">90 mins</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Hairstyle Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-700 dark:text-brand-300"
                  >
                    <option value="Fade Cut">Fade Cut</option>
                    <option value="French Crop">French Crop</option>
                    <option value="Buzz Cut">Buzz Cut</option>
                    <option value="Undercut">Undercut</option>
                    <option value="Beard">Beard Styling</option>
                    <option value="Coloring">Hair Coloring</option>
                    <option value="Spa">Hair Spa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    placeholder="Brief detail of grooming steps..."
                    className="w-full px-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Hairstyle Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setServiceFile(e.target.files[0])}
                    className="w-full text-xs text-brand-500 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Save Hairstyle
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
