import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import MapLocationPicker from '../../components/MapLocationPicker';
import { 
  Calendar, Clock, DollarSign, Users, Scissors, Star, ToggleLeft, ToggleRight, 
  Edit, Trash2, Plus, Settings, Sparkles, Check, X, ClipboardList, ShieldCheck, 
  MapPin, ExternalLink, CheckCircle2, AlertCircle, Image as ImageIcon, UserCheck, Locate 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BarberDashboard() {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'otp_validate', 'bookings', 'staff', 'services', 'reviews', 'settings'
  
  // Dashboard Metrics
  const [bookings, setBookings] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // In-Person OTP Validation states
  const [otpInput, setOtpInput] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpErrorMsg, setOtpErrorMsg] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Shop Settings form states (Opening, Closing, Weekly holiday, Location)
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('20:00');
  const [weeklyHoliday, setWeeklyHoliday] = useState('6');
  const [holidayMode, setHolidayMode] = useState(false);
  const [experience, setExperience] = useState('5');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  
  // Service CRUD form states
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Haircut');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceFile, setServiceFile] = useState(null);

  // Barber Staff CRUD form states
  const [staffModal, setStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Senior Barber & Stylist');
  const [staffShift, setStaffShift] = useState('09:00 AM - 08:00 PM');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffHoliday, setStaffHoliday] = useState('Sunday');
  const [staffPhoto, setStaffPhoto] = useState(null);

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
        
        const pData = await pRes.json();
        setProfile(pData);
        setReviews(pData.reviews || []);
        setStaffList(pData.staff || []);
        
        // Map shop settings
        setOpeningTime(pData.openingTime || '09:00');
        setClosingTime(pData.closingTime || '20:00');
        setWeeklyHoliday(pData.weeklyHoliday !== undefined ? String(pData.weeklyHoliday) : '6');
        setHolidayMode(pData.holidayMode || false);
        setExperience(pData.experience || '5');
        setDescription(pData.description || '');
        setLat(pData.lat || 18.5204);
        setLng(pData.lng || 73.8567);
        setAddress(pData.address || '');
        setCity(pData.city || '');
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      setGeoLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6));
          setLng(position.coords.longitude.toFixed(6));
          setGeoLocating(false);
          alert(`GPS Location Detected! Latitude: ${position.coords.latitude.toFixed(6)}, Longitude: ${position.coords.longitude.toFixed(6)}`);
        },
        (error) => {
          setGeoLocating(false);
          alert("Could not fetch GPS location. Please allow browser location access or select location on map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleMapLocationSelect = (newLat, newLng) => {
    setLat(parseFloat(newLat).toFixed(6));
    setLng(parseFloat(newLng).toFixed(6));
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setOtpSuccessMsg('');
    setOtpErrorMsg('');
    setOtpLoading(true);

    try {
      const res = await api.post('/barber/validate-otp', { otp: otpInput });
      const data = await res.json();
      setOtpLoading(false);

      if (res.ok) {
        setOtpSuccessMsg(data.message || 'OTP Verified! Customer checked in and appointment completed.');
        setOtpInput('');
        fetchBarberDashboardData();
      } else {
        setOtpErrorMsg(data.message || 'Invalid Check-In OTP. Please try again.');
      }
    } catch (err) {
      setOtpLoading(false);
      setOtpErrorMsg('Network error validating OTP.');
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
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('address', address);
    formData.append('city', city);

    const res = await updateProfile(formData);
    if (res.success) {
      setSettingsSuccess('Shop hours & interactive map location updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
      fetchBarberDashboardData();
    } else {
      alert("Failed to update settings.");
    }
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffRole('Senior Barber & Stylist');
    setStaffShift('09:00 AM - 08:00 PM');
    setStaffPhone('');
    setStaffHoliday('Sunday');
    setStaffPhoto(null);
    setStaffModal(true);
  };

  const handleOpenEditStaff = (st) => {
    setEditingStaff(st);
    setStaffName(st.name);
    setStaffRole(st.role || 'Barber Stylist');
    setStaffShift(st.shift || '09:00 AM - 08:00 PM');
    setStaffPhone(st.phone || '');
    setStaffHoliday(st.holiday || 'Sunday');
    setStaffPhoto(null);
    setStaffModal(true);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', staffName);
    formData.append('role', staffRole);
    formData.append('shift', staffShift);
    formData.append('phone', staffPhone);
    formData.append('holiday', staffHoliday);
    if (staffPhoto) formData.append('photo', staffPhoto);

    try {
      const res = await api.post('/barber/staff', formData);
      if (res.ok) {
        setStaffModal(false);
        fetchBarberDashboardData();
      } else {
        alert("Failed to save staff member.");
      }
    } catch (err) {
      alert("Error saving staff member.");
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceCategory('Haircut');
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
        res = await api.put(`/barber/hairstyles/${editingService.id}`, formData);
      } else {
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
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      const res = await api.delete(`/barber/hairstyles/${id}`);
      if (res.ok) fetchBarberDashboardData();
    } catch (e) {
      alert("Failed to delete service.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const grossRevenue = profile?.grossRevenue || 0;
  const platformFeePercent = profile?.platformFeePercent || 10.0;
  const platformCommission = profile?.platformCommission || 0;
  const netRevenue = profile?.netRevenue || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* HEADER BAR WITH SHOP HOURS & MAP LINK */}
      <div className="glass-panel p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-500">Salon Operations Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-brand-900 dark:text-brand-50 mt-0.5">{profile?.shopName || 'My Salon'}</h1>
          <div className="text-xs text-brand-500 mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent-500" /> {address || city || 'Shop Location'}</span>
            <span className="flex items-center gap-1 font-mono"><Clock className="w-3.5 h-3.5 text-accent-500" /> Open: {openingTime} - {closingTime}</span>
            {profile?.googleMapsUrl && (
              <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer" className="text-accent-500 hover:underline flex items-center gap-0.5 font-bold">
                Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <button onClick={() => setActiveTab('otp_validate')} className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
          <ShieldCheck className="w-4 h-4" /> Validate In-Person OTP
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-2 border-b pb-3 text-xs font-bold">
        {[
          { key: 'overview', label: 'Financial Overview', icon: DollarSign },
          { key: 'otp_validate', label: 'In-Person OTP Check-In', icon: ShieldCheck },
          { key: 'bookings', label: `Bookings Hub (${bookings.length})`, icon: Calendar },
          { key: 'staff', label: `Barber Staff (${staffList.length})`, icon: UserCheck },
          { key: 'services', label: `Services Catalog (${hairstyles.length})`, icon: Scissors },
          { key: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { key: 'settings', label: 'Shop Operating Hours & Map Location', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-2xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.key 
                  ? 'bg-brand-900 text-white dark:bg-accent-600 shadow' 
                  : 'bg-white dark:bg-brand-900 border text-brand-700 dark:text-brand-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FINANCIAL REVENUE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Net Earnings (Net Revenue)</span>
              <h2 className="text-4xl font-extrabold font-display mt-1">₹{netRevenue}</h2>
              <p className="text-[11px] text-white/80 mt-2">After {platformFeePercent}% online booking charge</p>
            </div>

            <div className="p-6 bg-white dark:bg-brand-900 border rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Gross Online Revenue</span>
              <h2 className="text-3xl font-extrabold font-display text-brand-900 dark:text-brand-50 mt-1">₹{grossRevenue}</h2>
              <p className="text-[11px] text-brand-400 mt-2">Total amount paid by customers online</p>
            </div>

            <div className="p-6 bg-white dark:bg-brand-900 border rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Platform Charge ({platformFeePercent}%)</span>
              <h2 className="text-3xl font-extrabold font-display text-amber-500 mt-1">₹{platformCommission}</h2>
              <p className="text-[11px] text-brand-400 mt-2">Online booking convenience fee</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IN-PERSON OTP VALIDATION */}
      {activeTab === 'otp_validate' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-brand-900 p-8 rounded-3xl border shadow-xl space-y-6">
          <div className="text-center">
            <div className="inline-flex p-3 bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-400 rounded-2xl mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50">In-Person Customer Check-In OTP</h3>
            <p className="text-xs text-brand-500 mt-1">When customer arrives at your salon, ask for their 6-digit Check-In OTP to validate attendance.</p>
          </div>

          {otpSuccessMsg && (
            <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-2xl border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          {otpErrorMsg && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{otpErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleValidateOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-700 dark:text-brand-300 mb-1.5 uppercase tracking-wider">Enter 6-Digit Check-In OTP *</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="e.g. 849201"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-center text-2xl font-mono tracking-widest p-4 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-2xl font-bold text-brand-900 dark:text-brand-50"
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex justify-center items-center gap-2"
            >
              {otpLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Validate & Complete Appointment"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: BOOKINGS HUB */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-brand-900 rounded-3xl border overflow-hidden shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-base font-bold font-display text-brand-900 dark:text-brand-50">Salon Appointments Schedule</h3>
            <span className="text-xs text-brand-500 font-semibold">{bookings.length} Total Bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 dark:bg-brand-950 border-b text-brand-500 uppercase font-bold">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Assigned Barber</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">OTP</th>
                  <th className="p-4">Net Price</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-brand-400">No appointments logged yet.</td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-50/50">
                      <td className="p-4 font-bold text-brand-900 dark:text-brand-50">{b.customer?.name}</td>
                      <td className="p-4 font-semibold text-accent-600">{b.staffName || 'Senior Stylist'}</td>
                      <td className="p-4 font-medium">{b.hairstyle?.name}</td>
                      <td className="p-4 font-mono">{b.date} at {b.timeSlot}</td>
                      <td className="p-4 font-mono font-bold text-brand-900 dark:text-brand-50">{b.checkInOtp || 'N/A'}</td>
                      <td className="p-4 font-bold text-green-600">₹{b.price}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-accent-100 text-accent-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-BARBER STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-brand-900 p-6 rounded-3xl border">
            <div>
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50">Salon Barber Staff Roster</h3>
              <p className="text-xs text-brand-500">Edit shift hours and set independent weekly holidays according to each barber.</p>
            </div>
            <button onClick={handleOpenAddStaff} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Add Barber Staff
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-xs text-brand-400 bg-white dark:bg-brand-900 rounded-3xl border">
                No barber staff configured yet. Click "+ Add Barber Staff" to add your team.
              </div>
            ) : (
              staffList.map((s, idx) => (
                <div key={idx} className="bg-white dark:bg-brand-900 p-5 rounded-3xl border shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 font-extrabold flex items-center justify-center text-lg overflow-hidden">
                        {s.photoUrl ? <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-brand-900 dark:text-brand-50">{s.name}</h4>
                        <p className="text-xs text-accent-600 font-semibold">{s.role}</p>
                      </div>
                    </div>
                    <button onClick={() => handleOpenEditStaff(s)} className="p-1.5 text-brand-500 hover:text-accent-500">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t text-xs space-y-1">
                    <p className="flex justify-between text-brand-600 dark:text-brand-400">
                      <span>Shift Hours:</span> <span className="font-mono font-bold text-brand-900 dark:text-brand-50">{s.shift || '09:00 AM - 08:00 PM'}</span>
                    </p>
                    <p className="flex justify-between text-brand-600 dark:text-brand-400">
                      <span>Weekly Holiday:</span> <span className="font-bold text-amber-600">{s.holiday || 'Sunday'}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SERVICES CATALOG */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-brand-900 p-6 rounded-3xl border">
            <div>
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50">Services, Hairstyles & Facials Catalog</h3>
              <p className="text-xs text-brand-500">Service photos are stored securely in AWS S3 buckets.</p>
            </div>
            <button onClick={handleOpenAddService} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hairstyles.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-xs text-brand-400 bg-white dark:bg-brand-900 rounded-3xl border">
                No services added yet. Click "+ Add Service" to add male/female haircuts, facials, or hair treatments.
              </div>
            ) : (
              hairstyles.map((s) => (
                <div key={s.id} className="bg-white dark:bg-brand-900 p-5 rounded-3xl border shadow-sm space-y-3">
                  {s.imageUrl && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden bg-brand-100">
                      <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 bg-accent-100 text-accent-700 text-[10px] font-bold rounded-full uppercase">{s.category || 'Grooming'}</span>
                    <span className="text-lg font-extrabold text-brand-900 dark:text-brand-50">₹{s.price}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand-900 dark:text-brand-50">{s.name}</h4>
                    <p className="text-xs text-brand-500 mt-0.5">{s.description}</p>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center text-xs">
                    <span className="text-brand-400 font-semibold">{s.duration || 30} mins</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEditService(s)} className="p-1.5 text-brand-600 hover:text-accent-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteService(s.id)} className="p-1.5 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SHOP OPERATING HOURS & INTERACTIVE MAP LOCATION PICKER */}
      {activeTab === 'settings' && (
        <form onSubmit={handleUpdateSettings} className="bg-white dark:bg-brand-900 p-6 rounded-3xl border max-w-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50">Interactive Map Location & Shop Hours</h3>
              <p className="text-xs text-brand-500">Click or drag the marker on the map to choose your exact shop location.</p>
            </div>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={geoLocating}
              className="px-3 py-1.5 bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-400 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-accent-200"
            >
              <Locate className="w-3.5 h-3.5" /> {geoLocating ? 'Detecting...' : '📍 GPS Auto Detect'}
            </button>
          </div>

          {settingsSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl">{settingsSuccess}</div>}

          {/* INTERACTIVE MAP PICKER COMPONENT */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-700 dark:text-brand-300">Click on Map to Pick Shop Location Pin *</label>
            <MapLocationPicker 
              lat={lat} 
              lng={lng} 
              onLocationSelect={handleMapLocationSelect} 
            />
            <p className="text-[11px] text-brand-400">Selected Coordinates: Lat <span className="font-mono font-bold text-brand-900 dark:text-brand-50">{lat}</span>, Lng <span className="font-mono font-bold text-brand-900 dark:text-brand-50">{lng}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-500 mb-1">Shop Opening Time *</label>
              <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl text-xs font-mono font-bold" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-500 mb-1">Shop Closing Time *</label>
              <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl text-xs font-mono font-bold" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-500 mb-1">Full Shop Address *</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 102 MG Road, Bandra West, Mumbai" className="w-full p-2.5 bg-brand-50 border rounded-xl text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-500 mb-1">City *</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className="w-full p-2.5 bg-brand-50 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-500 mb-1">Shop Holiday</label>
              <select value={weeklyHoliday} onChange={(e) => setWeeklyHoliday(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl text-xs font-bold">
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

          <button type="submit" className="px-6 py-2.5 bg-accent-500 text-white font-bold rounded-xl text-xs shadow-md">
            Save Shop Location & Hours
          </button>
        </form>
      )}

      {/* ADD / EDIT STAFF MODAL */}
      <AnimatePresence>
        {staffModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-brand-900 max-w-md w-full p-6 rounded-3xl shadow-2xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base font-display">{editingStaff ? 'Edit Barber Staff Shift & Holiday' : 'Add Barber Staff Member'}</h3>
                <button onClick={() => setStaffModal(false)}><X className="w-5 h-5 text-brand-400" /></button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Staff Member Name *</label>
                  <input type="text" required value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Vikram Sharma" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Role / Specialty</label>
                  <input type="text" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} placeholder="Senior Fade & Beard Specialist" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Shift Hours *</label>
                    <input type="text" value={staffShift} onChange={(e) => setStaffShift(e.target.value)} placeholder="09:00 AM - 05:00 PM" className="w-full p-2.5 bg-brand-50 border rounded-xl font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Individual Holiday *</label>
                    <select value={staffHoliday} onChange={(e) => setStaffHoliday(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl font-bold">
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Staff Photo (S3 Bucket Upload)</label>
                  <input type="file" accept="image/*" onChange={(e) => setStaffPhoto(e.target.files[0])} className="w-full p-2 bg-brand-50 border rounded-xl" />
                </div>

                <button type="submit" className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl shadow mt-2">
                  {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SERVICE MODAL */}
      <AnimatePresence>
        {serviceModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-brand-900 max-w-md w-full p-6 rounded-3xl shadow-2xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base font-display">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                <button onClick={() => setServiceModal(false)}><X className="w-5 h-5 text-brand-400" /></button>
              </div>

              {serviceError && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">{serviceError}</div>}

              <form onSubmit={handleServiceSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Service Name *</label>
                  <input type="text" required value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Executive Haircut / Herbal Facial" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl">
                      <option value="Haircut">Male/Female Haircut</option>
                      <option value="Beard">Beard Styling</option>
                      <option value="Facial">Facial Treatment</option>
                      <option value="Hair Treatment">Hair Spa & Treatment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Price (₹) *</label>
                    <input type="number" required value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="350" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration (Minutes)</label>
                  <input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="30" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Photo (S3 Bucket Upload)</label>
                  <input type="file" accept="image/*" onChange={(e) => setServiceFile(e.target.files[0])} className="w-full p-2 bg-brand-50 border rounded-xl" />
                </div>

                <button type="submit" className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl shadow mt-2">
                  Save Service
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
