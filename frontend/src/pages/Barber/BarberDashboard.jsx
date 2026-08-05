import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import MapLocationPicker from '../../components/MapLocationPicker';
import { 
  Calendar, Clock, DollarSign, Users, Scissors, Star, ToggleLeft, ToggleRight, 
  Edit, Trash2, Plus, Settings, Sparkles, Check, X, ClipboardList, ShieldCheck, 
  MapPin, ExternalLink, CheckCircle2, AlertCircle, Image as ImageIcon, UserCheck, Locate, Save, RefreshCw, UserPlus, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const categoryDefaultImages = {
  Haircut: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1605497746444-052d5b3834ec?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1501696461415-6bd0860ab749?w=500&auto=format&fit=crop&q=60'
  ],
  Beard: [
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=500&auto=format&fit=crop&q=60'
  ],
  Facial: [
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=500&auto=format&fit=crop&q=60'
  ],
  'Hair Treatment': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60'
  ],
  'Hair Color': [
    'https://images.unsplash.com/photo-1605497746444-052d5b3834ec?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1620331789556-99222c954593?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=500&auto=format&fit=crop&q=60'
  ],
  Others: [
    'https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=60',
  ]
};

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

  // Master Catalog Configuration states
  const [catalogSettings, setCatalogSettings] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [cardEdits, setCardEdits] = useState({});

  const handleFieldChange = (masterServiceId, field, value) => {
    setCardEdits(prev => ({
      ...prev,
      [masterServiceId]: {
        ...prev[masterServiceId],
        [field]: value
      }
    }));
  };

  const getCardValue = (s, field) => {
    if (cardEdits[s.masterServiceId] && cardEdits[s.masterServiceId][field] !== undefined) {
      return cardEdits[s.masterServiceId][field];
    }
    return s[field];
  };

  // In-Person OTP Validation states
  const [otpInput, setOtpInput] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpErrorMsg, setOtpErrorMsg] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Shop Settings form states (Opening, Closing, Weekly holiday, Location)
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('20:00');
  const [weeklyHoliday, setWeeklyHoliday] = useState('6');
  const [weeklyHolidays, setWeeklyHolidays] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const [newClosedDate, setNewClosedDate] = useState('');
  const [shifts, setShifts] = useState([{ start: '09:00', end: '20:00' }]);
  const [holidayMode, setHolidayMode] = useState(false);
  const [experience, setExperience] = useState('5');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [shopImagesFiles, setShopImagesFiles] = useState([]);
  
  // Service CRUD form states
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Haircut');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [serviceLoyaltyPoints, setServiceLoyaltyPoints] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceFile, setServiceFile] = useState(null);
  const [selectedDefaultImage, setSelectedDefaultImage] = useState('');
  const [selectedDashboardCategory, setSelectedDashboardCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState(null);

  // Barber Staff CRUD form states
  const [staffModal, setStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Senior Barber & Stylist');
  const [staffShiftStart, setStaffShiftStart] = useState('09:00 AM');
  const [staffShiftEnd, setStaffShiftEnd] = useState('08:00 PM');
  const [staffBreakStart, setStaffBreakStart] = useState('01:00 PM');
  const [staffBreakEnd, setStaffBreakEnd] = useState('02:00 PM');
  const [staffShift, setStaffShift] = useState('09:00 AM - 08:00 PM');
  const [staffShifts, setStaffShifts] = useState([]);
  const [staffPhone, setStaffPhone] = useState('');
  const [staffHoliday, setStaffHoliday] = useState('Sunday');
  const [staffExperience, setStaffExperience] = useState('');
  const [staffPhoto, setStaffPhoto] = useState(null);

  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [serviceError, setServiceError] = useState('');

  // Walk-in / Offline Booking Modal state
  const [offlineModal, setOfflineModal] = useState(false);
  const [offlineCustName, setOfflineCustName] = useState('');
  const [offlineCustPhone, setOfflineCustPhone] = useState('');
  const [offlineDate, setOfflineDate] = useState(new Date().toISOString().split('T')[0]);
  const [offlineStaffId, setOfflineStaffId] = useState('');
  const [offlineStaffName, setOfflineStaffName] = useState('');
  const [offlineSelectedServices, setOfflineSelectedServices] = useState([]);
  const [offlineSlots, setOfflineSlots] = useState([]);
  const [offlineSelectedSlot, setOfflineSelectedSlot] = useState('');
  const [offlineSlotsLoading, setOfflineSlotsLoading] = useState(false);
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);

  useEffect(() => {
    fetchBarberDashboardData();
    fetchCatalogSettings();
  }, []);

  const handleOpenOfflineModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setOfflineCustName('');
    setOfflineCustPhone('');
    setOfflineDate(todayStr);
    setOfflineStaffId('');
    setOfflineStaffName('');
    setOfflineSlots([]);
    setOfflineSelectedSlot('');
    setOfflineModal(true);
    fetchOfflineSlots(todayStr, '');
  };

  const fetchOfflineSlots = async (dateStr, staffIdVal) => {
    if (!dateStr) {
      setOfflineSlots([]);
      return;
    }
    setOfflineSlotsLoading(true);
    try {
      let url = `/booking/slots?barberId=${user.id}&date=${dateStr}`;
      if (staffIdVal) {
        url += `&staffId=${staffIdVal}`;
      }
      const res = await api.get(url);
      if (res.ok) {
        setOfflineSlots(await res.json());
      } else {
        setOfflineSlots([]);
      }
    } catch (e) {
      console.error("Failed to fetch offline slots:", e);
      setOfflineSlots([]);
    } finally {
      setOfflineSlotsLoading(false);
    }
  };

  const handleOfflineDateChange = (newDate) => {
    setOfflineDate(newDate);
    setOfflineSelectedSlot('');
    fetchOfflineSlots(newDate, offlineStaffId);
  };

  const handleOfflineStaffChange = (staffIdVal) => {
    setOfflineStaffId(staffIdVal);
    const staffObj = staffList.find(st => String(st.id) === String(staffIdVal));
    setOfflineStaffName(staffObj ? staffObj.name : 'Senior Stylist');
    setOfflineSelectedSlot('');
    fetchOfflineSlots(offlineDate, staffIdVal);
  };

  const handleConfirmOfflineBooking = async (e) => {
    e.preventDefault();
    if (!offlineSelectedSlot) {
      alert("Please pick an available time slot!");
      return;
    }

    setOfflineSubmitting(true);
    try {
      const payload = {
        customerName: offlineCustName.trim() || 'Walk-in Customer',
        customerPhone: offlineCustPhone.trim(),
        date: offlineDate,
        timeSlot: offlineSelectedSlot,
        staffId: offlineStaffId || null,
        staffName: offlineStaffName || 'Senior Stylist'
      };

      const res = await api.post('/booking/create-offline', payload);
      const data = await res.json();

      if (res.ok) {
        alert("✅ Walk-in time slot booked successfully!");
        setOfflineModal(false);
        fetchBarberDashboardData();
      } else {
        alert(data.message || "Failed to book walk-in slot.");
      }
    } catch (e) {
      console.error("Error creating offline booking:", e);
      alert("Error booking walk-in slot.");
    } finally {
      setOfflineSubmitting(false);
    }
  };

  const fetchCatalogSettings = async () => {
    setCatalogLoading(true);
    try {
      const res = await api.get('/barber/catalog-settings');
      if (res.ok) {
        setCatalogSettings(await res.json());
      }
    } catch (e) {
      console.error("Failed to load catalog settings:", e);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchBarberDashboardData = async () => {
    setLoading(true);
    try {
      const barberId = user?.id || user?._id || user?.barberId;
      if (!barberId) return;

      const bRes = await api.get('/booking/barber');
      const hRes = await api.get(`/barber/hairstyles/${barberId}`);
      const pRes = await api.get(`/barber/profile/${barberId}`);

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
        setWeeklyHolidays(pData.weeklyHolidays || []);
        setClosedDates(pData.closedDates || []);
        setShifts(pData.shifts && pData.shifts.length > 0 ? pData.shifts : [{ start: pData.openingTime || '09:00', end: pData.closingTime || '20:00' }]);
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
    formData.append('weeklyHolidays', JSON.stringify(weeklyHolidays));
    formData.append('closedDates', JSON.stringify(closedDates));
    formData.append('shifts', JSON.stringify(shifts));
    formData.append('holidayMode', holidayMode);
    formData.append('experience', experience);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('address', address);
    formData.append('city', city);

    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }
    if (shopImagesFiles.length > 0) {
      for (let i = 0; i < shopImagesFiles.length; i++) {
        formData.append('shopImages', shopImagesFiles[i]);
      }
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setSettingsSuccess('Shop settings, location pin, and gallery pictures updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
      setProfilePicFile(null);
      setShopImagesFiles([]);
      fetchBarberDashboardData();
    } else {
      alert("Failed to update settings.");
    }
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffRole('Senior Barber & Stylist');
    setStaffShiftStart('09:00 AM');
    setStaffShiftEnd('08:00 PM');
    setStaffBreakStart('01:00 PM');
    setStaffBreakEnd('02:00 PM');
    setStaffShift('09:00 AM - 08:00 PM');
    setStaffShifts([]);
    setStaffPhone('');
    setStaffHoliday('Sunday');
    setStaffExperience('');
    setStaffPhoto(null);
    setStaffModal(true);
  };

  const handleOpenEditStaff = (st) => {
    setEditingStaff(st);
    setStaffName(st.name);
    setStaffRole(st.role || 'Barber Stylist');
    setStaffShiftStart(st.shift_start || st.shift?.split('-')[0]?.trim() || '09:00 AM');
    setStaffShiftEnd(st.shift_end || st.shift?.split('-')[1]?.trim() || '08:00 PM');
    setStaffBreakStart(st.break_start || '01:00 PM');
    setStaffBreakEnd(st.break_end || '02:00 PM');
    setStaffShift(st.shift || '09:00 AM - 08:00 PM');
    setStaffShifts(st.shifts || []);
    setStaffPhone(st.phone || '');
    setStaffHoliday(st.holiday || 'Sunday');
    setStaffExperience(st.experience || '');
    setStaffPhoto(null);
    setStaffModal(true);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', staffName);
    formData.append('role', staffRole);
    formData.append('shift_start', staffShiftStart);
    formData.append('shift_end', staffShiftEnd);
    formData.append('break_start', staffBreakStart);
    formData.append('break_end', staffBreakEnd);
    formData.append('shift', `${staffShiftStart} - ${staffShiftEnd}`);
    formData.append('shifts', JSON.stringify([{ start: staffShiftStart, end: staffShiftEnd }]));
    formData.append('phone', staffPhone);
    formData.append('holiday', staffHoliday);
    formData.append('experience', staffExperience);
    if (staffPhoto) formData.append('photo', staffPhoto);

    try {
      let res;
      if (editingStaff) {
        res = await api.put(`/barber/staff/${editingStaff.id}`, formData);
      } else {
        res = await api.post('/barber/staff', formData);
      }
      
      if (res.ok) {
        setStaffModal(false);
        setEditingStaff(null);
        fetchBarberDashboardData();
      } else {
        alert(editingStaff ? "Failed to update staff member." : "Failed to save staff member.");
      }
    } catch (err) {
      alert(editingStaff ? "Error updating staff member." : "Error saving staff member.");
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to remove this staff member? This will remove them from your roster permanently.")) {
      return;
    }
    try {
      const res = await api.delete(`/barber/staff/${staffId}`);
      if (res.ok) {
        fetchBarberDashboardData();
      } else {
        alert("Failed to delete staff member.");
      }
    } catch (e) {
      alert("Error deleting staff member.");
    }
  };  const handleToggleCatalogService = async (masterServiceId, enabled, price, duration, description, imageFile = null, clearCustomImage = false) => {
    try {
      const formData = new FormData();
      formData.append('masterServiceId', masterServiceId);
      formData.append('enabled', enabled ? 'true' : 'false');
      if (price !== undefined && price !== null) formData.append('price', String(price));
      if (duration !== undefined && duration !== null) formData.append('duration', String(duration));
      if (description !== undefined && description !== null) formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);
      if (clearCustomImage) formData.append('clearCustomImage', 'true');

      const res = await api.post('/barber/hairstyles/toggle', formData);
      if (res.ok) {
        fetchCatalogSettings();
        const hRes = await api.get(`/barber/hairstyles/${user.id}`);
        if (hRes.ok) {
          setHairstyles(await hRes.json());
        }
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update service status");
      }
    } catch (e) {
      console.error("Error toggling catalog service:", e);
    }
  };


  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceCategory('Haircut');
    setServicePrice('');
    setServiceDuration('30');
    setServiceLoyaltyPoints('');
    setServiceDesc('');
    setServiceFile(null);
    setSelectedDefaultImage('');
    setServiceModal(true);
  };

  const handleOpenEditService = (s) => {
    setEditingService(s);
    setServiceName(s.name);
    setServiceCategory(s.category);
    setServicePrice(s.price);
    setServiceDuration(String(s.duration));
    setServiceLoyaltyPoints(s.loyaltyPoints !== undefined && s.loyaltyPoints !== null ? String(s.loyaltyPoints) : '');
    setServiceDesc(s.description || '');
    setServiceFile(null);
    setSelectedDefaultImage('');
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
    formData.append('loyaltyPoints', serviceLoyaltyPoints);
    formData.append('description', serviceDesc);
    if (serviceFile) {
      formData.append('image', serviceFile);
    } else if (selectedDefaultImage) {
      formData.append('defaultImageUrl', selectedDefaultImage);
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

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleOpenOfflineModal} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all">
            <UserPlus className="w-4 h-4" /> + Book Walk-In Customer
          </button>
          <button onClick={() => setActiveTab('otp_validate')} className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
            <ShieldCheck className="w-4 h-4" /> Validate In-Person OTP
          </button>
        </div>
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
      {activeTab === 'overview' && (() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const prevMonth = prevMonthDate.getMonth();
        const prevMonthYear = prevMonthDate.getFullYear();

        let thisMonthNet = 0;
        let prevMonthNet = 0;
        let thisYearNet = 0;
        let totalNet = 0;
        const monthlyBreakdown = {};

        (bookings || []).forEach(b => {
          if (b.status === 'cancelled') return;

          const net = b.netAmount ?? (b.price ? Math.round(b.price * 0.9) : 0);
          totalNet += net;

          if (!b.date) return;
          const parts = b.date.split('-');
          if (parts.length < 2) return;
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;

          const monthKey = `${parts[0]}-${parts[1]}`;
          monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + net;

          if (y === currentYear) {
            thisYearNet += net;
            if (m === currentMonth) {
              thisMonthNet += net;
            }
          }

          if (y === prevMonthYear && m === prevMonth) {
            prevMonthNet += net;
          }
        });

        const sortedMonths = Object.keys(monthlyBreakdown).sort().reverse();
        const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const prevMonthLabel = prevMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">This Month ({currentMonthLabel})</span>
                <h2 className="text-3xl font-extrabold font-display mt-1">₹{thisMonthNet.toLocaleString()}</h2>
                <p className="text-[11px] text-white/80 mt-2">Net revenue earned this month</p>
              </div>

              <div className="p-6 bg-white dark:bg-brand-900 border rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Previous Month ({prevMonthLabel})</span>
                <h2 className="text-3xl font-extrabold font-display text-brand-900 dark:text-brand-50 mt-1">₹{prevMonthNet.toLocaleString()}</h2>
                <p className="text-[11px] text-brand-400 mt-2">Net revenue earned last month</p>
              </div>

              <div className="p-6 bg-white dark:bg-brand-900 border rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">This Year ({currentYear})</span>
                <h2 className="text-3xl font-extrabold font-display text-accent-600 mt-1">₹{thisYearNet.toLocaleString()}</h2>
                <p className="text-[11px] text-brand-400 mt-2">Net revenue earned in {currentYear}</p>
              </div>

              <div className="p-6 bg-white dark:bg-brand-900 border rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Total Net Revenue</span>
                <h2 className="text-3xl font-extrabold font-display text-emerald-600 mt-1">₹{totalNet.toLocaleString()}</h2>
                <p className="text-[11px] text-brand-400 mt-2">All-time net earnings</p>
              </div>
            </div>

            {/* Monthly Net Revenue History List */}
            <div className="bg-white dark:bg-brand-900 rounded-3xl border shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold font-display text-brand-900 dark:text-brand-50">Monthly Net Revenue History</h3>
              {sortedMonths.length === 0 ? (
                <p className="text-xs text-brand-400">No revenue records logged yet.</p>
              ) : (
                <div className="divide-y border-t">
                  {sortedMonths.map((mKey) => {
                    const [yStr, mStr] = mKey.split('-');
                    const d = new Date(parseInt(yStr), parseInt(mStr) - 1, 1);
                    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    const amount = monthlyBreakdown[mKey];
                    return (
                      <div key={mKey} className="py-3 flex justify-between items-center text-xs font-bold">
                        <span className="text-brand-800 dark:text-brand-200">{label}</span>
                        <span className="text-emerald-600 text-sm font-extrabold">₹{amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
                      <td className="p-4 font-bold text-brand-900 dark:text-brand-50">
                        <div>{b.customer?.name}</div>
                        {b.isOffline && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            WALK-IN (OFFLINE)
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-accent-600">{b.staffName || 'Senior Stylist'}</td>
                      <td className="p-4 font-medium">{b.hairstyle?.name}</td>
                      <td className="p-4 font-mono text-xs">
                        <div>{b.date} at {b.timeSlot}</div>
                        <div className="text-[10px] text-accent-500 font-semibold font-sans mt-0.5 flex items-center gap-1">
                          <span>⏱️ {b.hairstyle?.duration || 30} min session</span>
                          <span className="text-brand-300">|</span>
                          <span className="text-brand-400 font-bold">Ends: {(() => {
                            try {
                              const [time, modifier] = b.timeSlot.split(' ');
                              let [hours, minutes] = time.split(':').map(Number);
                              if (modifier === 'PM' && hours !== 12) hours += 12;
                              if (modifier === 'AM' && hours === 12) hours = 0;
                              
                              const totalMinutes = hours * 60 + minutes + (b.hairstyle?.duration || 30);
                              const endHours24 = Math.floor(totalMinutes / 60) % 24;
                              const endMinutes = totalMinutes % 60;
                              
                              const endHours12 = endHours24 % 12 || 12;
                              const ampm = endHours24 >= 12 ? 'PM' : 'AM';
                              return `${String(endHours12).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${ampm}`;
                            } catch (e) {
                              return 'N/A';
                            }
                          })()}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-brand-900 dark:text-brand-50">{b.checkInOtp || 'N/A'}</td>
                      <td className="p-4">
                        <div className="font-bold text-green-600">₹{b.netAmount ?? (b.price ? Math.round(b.price * 0.9) : 0)}</div>
                        <div className="text-[10px] text-brand-400 font-semibold font-sans">Net Payout (10% fee cut)</div>
                      </td>
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
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenEditStaff(s)} className="p-1.5 text-brand-500 hover:text-accent-500" title="Edit Staff">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteStaff(s.id)} className="p-1.5 text-red-500 hover:text-red-750" title="Delete Staff">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-xs space-y-1">
                    <p className="flex justify-between text-brand-600 dark:text-brand-400">
                      <span>Shift Hours:</span> <span className="font-mono font-bold text-brand-900 dark:text-brand-50">{s.shift_start && s.shift_end ? `${s.shift_start} - ${s.shift_end}` : (s.shift || '09:00 AM - 08:00 PM')}</span>
                    </p>
                    <p className="flex justify-between text-brand-600 dark:text-brand-400">
                      <span>Lunch / Rest Break:</span> <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{s.break_start && s.break_start !== 'None' ? `${s.break_start} - ${s.break_end}` : 'No Break'}</span>
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
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50">Salon Services Catalog Settings</h3>
              <p className="text-xs text-brand-500 mt-1">
                Select which services your salon offers from the Master Catalog. Configure your custom pricing, optional durations, and description notes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddService}
              className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              + Create Custom Service
            </button>
          </div>

          {/* CUSTOM SALON SERVICES SECTION */}
          {(() => {
            const customServices = (hairstyles || []).filter(h => h && (h.isCustom || h.is_custom));
            if (customServices.length === 0) return null;
            
            return (
              <div className="space-y-4 border border-brand-200 dark:border-brand-850 p-6 rounded-3xl bg-brand-50/50 dark:bg-brand-950/20">
                <h4 className="font-bold text-sm text-brand-900 dark:text-brand-50 flex items-center gap-1.5">
                  ✨ Custom Salon-Created Services ({customServices.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {customServices.map((s, idx) => {
                    if (!s) return null;
                    const imageSrc = formatImageUrl(s.imageUrl || s.image_url) || getServiceFallbackImage(s.category);
                    return (
                      <div key={s.id || s._id || idx} className="bg-white dark:bg-brand-900 rounded-2xl border border-brand-200 dark:border-brand-800 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div 
                          className="relative h-32 bg-brand-100 group cursor-pointer overflow-hidden"
                          onClick={() => setPreviewImage({
                            url: imageSrc,
                            title: s.name || 'Custom Service',
                            category: s.category || 'Others',
                            price: s.price || 0,
                            duration: s.duration || 30
                          })}
                        >
                          <img src={imageSrc} alt={s.name || 'Service'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold backdrop-blur-[1px]">
                            <ZoomIn className="w-4 h-4" /> View Full Image
                          </div>
                          <span className="absolute top-2.5 right-2.5 bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            Custom
                          </span>
                        </div>
                        
                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-xs text-brand-800 dark:text-brand-200">{s.name}</span>
                              <span className="font-mono font-bold text-xs text-accent-500">₹{s.price}</span>
                            </div>
                            <p className="text-[10px] text-brand-500 mt-1 line-clamp-2">{s.description || 'No description notes.'}</p>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-semibold text-brand-400 border-t pt-2">
                            <span>⏱️ {s.duration} Min</span>
                            {s.loyaltyPoints !== undefined && s.loyaltyPoints !== null && (
                              <span className="text-yellow-600">🏆 {s.loyaltyPoints} Pts</span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditService(s)}
                              className="py-1.5 bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 text-brand-700 dark:text-brand-250 font-bold rounded-lg text-[10px]"
                            >
                              Edit Service
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete "${s.name}"?`)) {
                                  try {
                                    const res = await api.delete(`/barber/hairstyles/${s.id}`);
                                    if (res.ok) {
                                      // Refresh both profile details and hairstyles
                                      fetchBarberDashboardData();
                                    } else {
                                      alert("Failed to delete custom service.");
                                    }
                                  } catch (e) {
                                    alert("Error deleting service.");
                                  }
                                }
                              }}
                              className="py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-[10px]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* SERVICES CATEGORY SWEEP SWITCHER */}
          <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-none border-b border-brand-100">
            {['All', ...new Set(catalogSettings.map(s => s.category).filter(Boolean))].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedDashboardCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDashboardCategory === cat
                    ? 'bg-accent-500 text-white shadow-sm scale-105'
                    : 'bg-brand-100 hover:bg-brand-200 dark:bg-brand-800 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-300'
                }`}
              >
                {cat === 'All' ? '🌟 All Categories' : cat}
              </button>
            ))}
          </div>

          {catalogLoading ? (
            <div className="p-12 text-center text-xs text-brand-400">Loading catalog settings...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {catalogSettings
                .filter((s) => selectedDashboardCategory === 'All' || s.category === selectedDashboardCategory)
                .map((s) => {
                  const localEnabled = getCardValue(s, 'enabled');
                  const localPrice = getCardValue(s, 'price') ?? '';
                  const localDuration = getCardValue(s, 'duration') ?? s.defaultDuration;
                  const localDescription = getCardValue(s, 'description') ?? '';
                  const localFile = cardEdits[s.masterServiceId]?.file;
                  const localClearImg = cardEdits[s.masterServiceId]?.clearImg;
                  const currentImage = localClearImg ? s.coverImage : (localFile ? URL.createObjectURL(localFile) : (s.customImageUrl || s.coverImage));
                  
                  const isModified = 
                    localEnabled !== s.enabled ||
                    String(localPrice) !== String(s.price ?? '') ||
                    String(localDuration) !== String(s.duration ?? s.defaultDuration) ||
                    localDescription !== (s.description ?? '') ||
                    localFile !== undefined ||
                    localClearImg !== undefined;

                  return (
                    <div
                      key={s.masterServiceId}
                      className={`bg-white dark:bg-brand-900 rounded-3xl border shadow-sm transition-all overflow-hidden flex flex-col justify-between ${
                        localEnabled 
                          ? 'border-accent-400 dark:border-accent-800 ring-1 ring-accent-400/20' 
                          : 'opacity-75 grayscale border-brand-200 dark:border-brand-800'
                      }`}
                    >
                      <div>
                        {/* Service Card Image */}
                        <div 
                          className="w-full h-40 relative bg-brand-100 group cursor-pointer overflow-hidden"
                          onClick={() => setPreviewImage({
                            url: currentImage,
                            title: s.name,
                            category: s.category,
                            price: localPrice,
                            duration: localDuration
                          })}
                        >
                          <img src={currentImage} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold backdrop-blur-[1px] z-10">
                            <ZoomIn className="w-4 h-4" /> View Full Image
                          </div>
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider z-20">
                            {s.category}
                          </div>
                          
                          {/* Enable/Disable Toggle overlay */}
                          <div 
                            className="absolute top-3 right-3 bg-white dark:bg-brand-950 px-2.5 py-1 rounded-xl shadow-lg border flex items-center gap-1.5 cursor-pointer z-30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={localEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                if (checked) {
                                  if (!localPrice || Number(localPrice) <= 0) {
                                    alert("Please fill in the price before enabling this service!");
                                    handleFieldChange(s.masterServiceId, 'enabled', false);
                                    return;
                                  }
                                  handleFieldChange(s.masterServiceId, 'enabled', true);
                                  handleToggleCatalogService(
                                    s.masterServiceId,
                                    true,
                                    localPrice,
                                    localDuration,
                                    localDescription,
                                    localFile,
                                    localClearImg
                                  );
                                } else {
                                  handleFieldChange(s.masterServiceId, 'enabled', false);
                                  if (s.salonServiceId) {
                                    handleToggleCatalogService(s.masterServiceId, false);
                                  }
                                }
                              }}
                              className="w-3.5 h-3.5 accent-accent-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-extrabold text-brand-800 dark:text-brand-200 cursor-pointer">
                              {localEnabled ? 'OFFERED' : 'DISABLED'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="p-5 space-y-4">
                          <div>
                            <h4 className="font-extrabold text-sm text-brand-900 dark:text-brand-50">{s.name}</h4>
                            <p className="text-[11px] text-brand-400 font-medium">Standard Duration: {s.defaultDuration} mins</p>
                          </div>

                          {/* Configuration inputs */}
                          <div className="space-y-3">
                            {/* Price field */}
                            <div>
                              <label className="block text-[10px] font-bold text-brand-500 mb-1">YOUR PRICE (₹) *</label>
                              <input
                                type="number"
                                required={localEnabled}
                                placeholder="Enter custom price"
                                value={localPrice}
                                onChange={(e) => handleFieldChange(s.masterServiceId, 'price', e.target.value)}
                                className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-bold text-brand-900 dark:text-brand-50 focus:ring-1 focus:ring-accent-500 outline-none"
                              />
                            </div>

                            {/* Duration override */}
                            <div>
                              <label className="block text-[10px] font-bold text-brand-500 mb-1">DURATION OVERRIDE (MINUTES)</label>
                              <input
                                type="number"
                                placeholder={`Default: ${s.defaultDuration} mins`}
                                value={localDuration}
                                onChange={(e) => handleFieldChange(s.masterServiceId, 'duration', e.target.value)}
                                className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-semibold text-brand-900 dark:text-brand-50 focus:ring-1 focus:ring-accent-500 outline-none"
                              />
                            </div>

                            {/* Description override */}
                            <div>
                              <label className="block text-[10px] font-bold text-brand-500 mb-1">CUSTOM DESCRIPTION NOTE</label>
                              <textarea
                                placeholder="Describe specific styling details or restrictions"
                                rows={2}
                                value={localDescription}
                                onChange={(e) => handleFieldChange(s.masterServiceId, 'description', e.target.value)}
                                className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-medium text-brand-900 dark:text-brand-50 focus:ring-1 focus:ring-accent-500 outline-none"
                              />
                            </div>

                            {/* Custom Image Upload field */}
                            <div>
                              <label className="block text-[10px] font-bold text-brand-500 mb-1">CUSTOM PHOTO (OPTIONAL OVERRIDE)</label>
                              <div className="flex gap-2 items-center">
                                <label className="flex-1 px-3 py-2 border border-brand-200 dark:border-brand-800 rounded-xl text-center text-xs font-bold bg-brand-50 hover:bg-brand-100 cursor-pointer transition-all">
                                  <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-brand-500" />
                                  {localFile ? localFile.name.substring(0, 15) + '...' : 'Upload Work Image'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleFieldChange(s.masterServiceId, 'file', e.target.files[0]);
                                        handleFieldChange(s.masterServiceId, 'clearImg', undefined);
                                      }
                                    }}
                                  />
                                </label>
                                {(s.customImageUrl || localFile) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleFieldChange(s.masterServiceId, 'file', null);
                                      handleFieldChange(s.masterServiceId, 'clearImg', true);
                                    }}
                                    className="px-2.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200/50"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      {localEnabled && isModified && (
                        <div className="p-4 border-t border-brand-100 bg-brand-50/50 dark:bg-brand-950/20">
                          <button
                            type="button"
                            onClick={() => {
                              if (!localPrice) {
                                alert("Price is required to enable and configure this service!");
                                return;
                              }
                              handleToggleCatalogService(
                                s.masterServiceId,
                                true,
                                localPrice,
                                localDuration,
                                localDescription,
                                localFile,
                                localClearImg
                              );
                            }}
                            className="w-full py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent-500/10 transition-all"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Configuration
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CUSTOMER REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border">
            <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Reviews & Ratings
            </h3>
            <p className="text-xs text-brand-500">Read what clients have to say about their haircut and service experiences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-xs text-brand-400 bg-white dark:bg-brand-900 rounded-3xl border">
                No customer reviews submitted yet.
              </div>
            ) : (
              reviews.map((r, idx) => (
                <div key={idx} className="bg-white dark:bg-brand-900 p-5 rounded-3xl border shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-brand-900 dark:text-brand-50">{r.customer_name || 'Anonymous Customer'}</h4>
                      <span className="text-[10px] text-brand-400 font-mono">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (r.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-brand-200 dark:text-brand-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-brand-600 dark:text-brand-450 bg-brand-50/50 dark:bg-brand-950/40 p-3 rounded-xl italic">
                    "{r.comment || 'No comment provided.'}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
       {/* TAB 7: SHOP OPERATING HOURS & INTERACTIVE MAP LOCATION PICKER */}
      {activeTab === 'settings' && (
        <form onSubmit={handleUpdateSettings} className="max-w-2xl space-y-6">
          
          {/* INTRO CARD */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 flex items-center gap-2">
                ⚙️ Salon Configurations & Business Hours
              </h3>
              <p className="text-xs text-brand-500 mt-1">
                Customize your salon profile info, maps geo-location, daily shift timings, weekly off-days, and custom vacation closures.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-xl text-xs shadow-md shadow-accent-500/10 transition-all flex items-center gap-1.5 self-stretch md:self-auto justify-center"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 text-xs font-bold rounded-2xl border border-green-200 dark:border-green-800 flex items-center gap-2 animate-pulse">
              🎉 {settingsSuccess}
            </div>
          )}

          {/* CARD 1: CORE SALON DETAILS */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-accent-500 border-b pb-2 flex items-center gap-1.5">
              📝 Salon Profile Details
            </h4>
            
            <div>
              <label className="block text-xs font-semibold text-brand-500 mb-1">Description / Salon Tagline</label>
              <textarea 
                rows="2" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Premium hair styling, grooming, beard styling, and hot towel shaves..." 
                className="w-full p-3 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs focus:ring-1 focus:ring-accent-500 transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-500 mb-1">Salon Experience (Years) *</label>
                <input 
                  type="number" 
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)} 
                  placeholder="5" 
                  className="w-full p-3 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs font-bold" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-500 mb-1">Shop Profile Avatar Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setProfilePicFile(e.target.files[0])} 
                  className="w-full p-2 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs" 
                />
              </div>
            </div>
          </div>

          {/* CARD 2: LOCATION MAP SETTINGS */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-accent-500 flex items-center gap-1.5">
                🗺️ Location Map Pin & Address
              </h4>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={geoLocating}
                className="px-2.5 py-1 bg-accent-50 hover:bg-accent-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-accent-600 dark:text-accent-400 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
              >
                <Locate className="w-3 h-3 animate-bounce" /> {geoLocating ? 'Detecting GPS...' : 'GPS Auto Detect'}
              </button>
            </div>

            <p className="text-[11px] text-brand-400">
              Drag or click the map to place a pin directly on your salon's entrance. This allows customers to get GPS navigation directions.
            </p>

            <div className="space-y-2.5">
              <MapLocationPicker 
                lat={lat} 
                lng={lng} 
                onLocationSelect={handleMapLocationSelect} 
              />
              <p className="text-[10px] text-brand-400 font-mono">
                Latitude: <span className="font-bold text-brand-800 dark:text-brand-300">{lat}</span> | Longitude: <span className="font-bold text-brand-800 dark:text-brand-300">{lng}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-brand-500 mb-1">Full Street Address *</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="e.g. 102 MG Road, Bandra West" 
                  className="w-full p-3 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-500 mb-1">City *</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Mumbai" 
                  className="w-full p-3 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs" 
                  required 
                />
              </div>
            </div>
          </div>



          {/* CARD 4: HOLIDAYS & VACATION DAYS */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-accent-500 border-b pb-2 flex items-center gap-1.5">
              📅 Standard Holidays & Vacation Days
            </h4>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-500">Weekly Off Days</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[
                  { label: 'Monday', val: 0 },
                  { label: 'Tuesday', val: 1 },
                  { label: 'Wednesday', val: 2 },
                  { label: 'Thursday', val: 3 },
                  { label: 'Friday', val: 4 },
                  { label: 'Saturday', val: 5 },
                  { label: 'Sunday', val: 6 },
                ].map((d) => {
                  const isChecked = weeklyHolidays.includes(d.val);
                  return (
                    <label key={d.val} className={`flex items-center justify-center p-2.5 rounded-xl text-[10px] font-bold border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/10'
                        : 'bg-brand-50/50 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-100'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setWeeklyHolidays(weeklyHolidays.filter((x) => x !== d.val));
                          } else {
                            setWeeklyHolidays([...weeklyHolidays, d.val]);
                          }
                        }}
                        className="hidden"
                      />
                      {d.label.slice(0, 3)}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <label className="block text-xs font-semibold text-brand-500">Block Custom Closed Vacation Days</label>
              <p className="text-[10px] text-brand-400">Add custom holiday dates (e.g. festivals or personal leaves) when your entire salon will be marked closed.</p>
              
              <div className="flex gap-2.5">
                <input
                  type="date"
                  value={newClosedDate}
                  onChange={(e) => setNewClosedDate(e.target.value)}
                  className="flex-1 p-3 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newClosedDate && !closedDates.includes(newClosedDate)) {
                      setClosedDates([...closedDates, newClosedDate]);
                      setNewClosedDate('');
                    }
                  }}
                  className="bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow transition-all whitespace-nowrap"
                >
                  Block Date
                </button>
              </div>

              {closedDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {closedDates.map((dateVal) => (
                    <span key={dateVal} className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-300 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-red-150">
                      {new Date(dateVal).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      <button
                        type="button"
                        onClick={() => setClosedDates(closedDates.filter((d) => d !== dateVal))}
                        className="text-red-500 hover:text-red-700 font-extrabold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CARD 5: GALLERY IMAGES */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-accent-500 border-b pb-2 flex items-center gap-1.5">
              🖼️ Hover Gallery Pictures
            </h4>
            
            {profile?.shopImages && profile.shopImages.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-brand-500">Active Gallery Photos:</label>
                <div className="grid grid-cols-3 gap-3">
                  {profile.shopImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border bg-brand-50 shadow-sm">
                      <img src={img} className="w-full h-full object-cover" alt={`Shop gallery ${idx + 1}`} />
                      <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full font-extrabold">
                        Photo #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-500 mb-1">Upload New Gallery Images (Select up to 3 pictures)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setShopImagesFiles(Array.from(e.target.files))} 
                className="w-full p-2 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs" 
              />
              <p className="text-[10px] text-brand-400 mt-1.5">
                Note: This uploads fresh custom gallery pictures that show in a sliding carousel when clients hover over your salon card.
              </p>
            </div>
          </div>
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
                    <label className="block font-semibold mb-1">Shift Start Time *</label>
                    <select value={staffShiftStart} onChange={(e) => setStaffShiftStart(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl font-bold">
                      <option value="07:00 AM">07:00 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Shift End Time *</label>
                    <select value={staffShiftEnd} onChange={(e) => setStaffShiftEnd(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl font-bold">
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Lunch Break Start</label>
                    <select value={staffBreakStart} onChange={(e) => setStaffBreakStart(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl font-bold">
                      <option value="None">No Break</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Lunch Break End</label>
                    <select value={staffBreakEnd} onChange={(e) => setStaffBreakEnd(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl font-bold">
                      <option value="None">No Break</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Weekly Holiday *</label>
                    <select value={staffHoliday} onChange={(e) => setStaffHoliday(e.target.value)} className="w-full p-2.5 bg-brand-50 border rounded-xl font-bold">
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                      <option value="None">No Weekly Holiday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Experience (in Years)</label>
                    <input type="number" min="0" value={staffExperience} onChange={(e) => setStaffExperience(e.target.value)} placeholder="e.g. 5" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
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
                      <select value={serviceCategory} onChange={(e) => {
                        setServiceCategory(e.target.value);
                      }} className="w-full p-2.5 bg-brand-50 border rounded-xl font-semibold font-display">
                        <option value="Haircut">Male/Female Haircut</option>
                        <option value="Beard">Beard Styling</option>
                        <option value="Facial">Facial Treatment</option>
                        <option value="Hair Treatment">Hair Spa & Treatment</option>
                        <option value="Hair Color">Hair Coloring & Highlights</option>
                        <option value="Others">Other Grooming</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Price (₹) *</label>
                      <input type="number" required value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="350" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Duration (Minutes)</label>
                      <input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="30" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Loyalty Points Reward</label>
                      <input type="number" value={serviceLoyaltyPoints} onChange={(e) => setServiceLoyaltyPoints(e.target.value)} placeholder="e.g. 15 (optional)" className="w-full p-2.5 bg-brand-50 border rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Service Photo (S3 Bucket Upload)</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      setServiceFile(e.target.files[0]);
                    }} className="w-full p-2 bg-brand-50 border rounded-xl" />
                  </div>

                  <button type="submit" className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl shadow mt-2">
                    Save Service
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* OFFLINE WALK-IN BOOKING MODAL */}
        <AnimatePresence>
          {offlineModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-brand-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-xl">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base font-display text-brand-900 dark:text-brand-50">Book Walk-In / Offline Customer</h3>
                      <p className="text-[11px] text-brand-400">Instantly reserve time slots for offline customers arriving at your salon</p>
                    </div>
                  </div>
                  <button onClick={() => setOfflineModal(false)}><X className="w-5 h-5 text-brand-400" /></button>
                </div>

                <form onSubmit={handleConfirmOfflineBooking} className="space-y-4 text-xs">
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-brand-700 dark:text-brand-300">Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patil (Walk-in)"
                        value={offlineCustName}
                        onChange={(e) => setOfflineCustName(e.target.value)}
                        className="w-full p-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-brand-700 dark:text-brand-300">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={offlineCustPhone}
                        onChange={(e) => setOfflineCustPhone(e.target.value)}
                        className="w-full p-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  {/* Date & Stylist Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-brand-700 dark:text-brand-300">Select Date *</label>
                      <input
                        type="date"
                        required
                        value={offlineDate}
                        onChange={(e) => handleOfflineDateChange(e.target.value)}
                        className="w-full p-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl font-bold font-mono text-brand-900 dark:text-brand-50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-brand-700 dark:text-brand-300">Select Assigned Barber / Stylist</label>
                      <select
                        value={offlineStaffId}
                        onChange={(e) => handleOfflineStaffChange(e.target.value)}
                        className="w-full p-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl font-semibold text-brand-900 dark:text-brand-50"
                      >
                        <option value="">Any Available Stylist</option>
                        {staffList.map((st) => (
                          <option key={st.id} value={st.id}>{st.name} ({st.role || 'Stylist'})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Slots Grid */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-brand-700 dark:text-brand-300">Select Time Slot *</label>
                      {offlineSlotsLoading && <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Checking live slots...</span>}
                    </div>

                    {offlineSlotsLoading ? (
                      <div className="p-4 bg-brand-50 text-center text-purple-600 rounded-2xl border text-xs font-bold animate-pulse">
                        Loading available 1-hour time slots...
                      </div>
                    ) : offlineSlots.length === 0 ? (
                      <div className="p-4 bg-brand-50 text-center text-brand-400 rounded-2xl border text-xs">
                        No slots available for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                        {offlineSlots.map((s, idx) => {
                          const isAvailable = s.available !== false;
                          const isSelected = offlineSelectedSlot === s.displayTime || offlineSelectedSlot === s.time;
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => {
                                if (!isAvailable) {
                                  if (s.isBreak) {
                                    alert(`Slot Timing: ${s.displayTime}\nStatus: Lunch / Rest Break`);
                                  } else {
                                    alert(`Slot Timing: ${s.displayTime}\n\n• Booked By: ${s.bookedBy || 'Customer'}\n• Phone: ${s.customerPhone || 'N/A'}\n• Service: ${s.serviceName || 'Hair & Grooming'}\n• Booking Type: ${s.isOffline ? 'Walk-In Customer' : 'Online Customer'}`);
                                  }
                                } else {
                                  setOfflineSelectedSlot(s.displayTime);
                                }
                              }}
                              className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all text-center relative group ${
                                !isAvailable
                                  ? s.isBreak
                                    ? 'bg-amber-50 text-amber-900 border-amber-300 cursor-pointer hover:bg-amber-100'
                                    : 'bg-red-50 text-red-700 border-red-200 cursor-pointer hover:bg-red-100'
                                  : isSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                                  : 'bg-white text-brand-900 border-brand-200 hover:border-purple-400'
                              }`}
                            >
                              <div className="font-mono">{s.displayTime}</div>
                              <div className="text-[9px] font-bold truncate max-w-full px-0.5 mt-0.5">
                                {!isAvailable ? (s.isBreak ? '☕ LUNCH BREAK' : s.bookedBy ? `🔒 ${s.bookedBy}` : '🔒 BOOKED') : '✨ OPEN'}
                              </div>

                              {/* Hover Floating Details Tooltip for Booked Slots */}
                              {!isAvailable && (
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-2.5 bg-brand-950 text-white text-[10px] font-semibold rounded-xl shadow-2xl z-30 min-w-44 border border-brand-800 pointer-events-none text-left">
                                  {s.isBreak ? (
                                    <div className="text-amber-400 font-bold">☕ Staff Lunch / Rest Break</div>
                                  ) : (
                                    <>
                                      <div className="font-bold text-xs text-purple-300 border-b border-brand-800 pb-1 mb-1">
                                        👤 {s.bookedBy || 'Customer'}
                                      </div>
                                      {s.customerPhone && s.customerPhone !== 'N/A' && (
                                        <div className="text-brand-300">📞 {s.customerPhone}</div>
                                      )}
                                      {s.serviceName && (
                                        <div className="text-brand-300 truncate">✂️ {s.serviceName}</div>
                                      )}
                                      <div className="mt-1 pt-1 border-t border-brand-800 flex justify-between items-center text-[9px]">
                                        <span className="text-accent-400 font-bold">{s.isOffline ? 'Walk-In' : 'Online Client'}</span>
                                        <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono uppercase">{s.status || 'Booked'}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={offlineSubmitting || !offlineSelectedSlot}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{offlineSubmitting ? 'Reserving Slot...' : 'Book Walk-In Slot'}</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
