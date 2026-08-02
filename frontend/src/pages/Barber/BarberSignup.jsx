import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Scissors, Store, User, Mail, Phone, Lock, MapPin, Clock, Upload, Award, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BarberSignup() {
  const { registerBarber } = useContext(AuthContext);
  
  // Text states
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('20:00');
  const [weeklyHoliday, setWeeklyHoliday] = useState('0'); // 0 Sunday, etc.
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [gst, setGst] = useState('');
  const [salonType, setSalonType] = useState("Men's Salon");

  // File states
  const [profilePic, setProfilePic] = useState(null);
  const [aadhaarPan, setAadhaarPan] = useState(null);
  const [shopImages, setShopImages] = useState([]);
  
  // File Previews
  const [profilePreview, setProfilePreview] = useState('');
  const [shopPreviews, setShopPreviews] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarPan(file);
    }
  };

  const handleShopImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setShopImages(files);
    
    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setShopPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!acceptedTerms) {
      setError('You must accept the Salon Partner Policy and Terms of Service to register your salon.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!aadhaarPan) {
      setError('Please upload your identity proof (Aadhaar/PAN)');
      setLoading(false);
      return;
    }

    // Build form data
    const formData = new FormData();
    formData.append('ownerName', ownerName);
    formData.append('shopName', shopName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('openingTime', '09:00');
    formData.append('closingTime', '20:00');
    formData.append('weeklyHoliday', '6');
    formData.append('experience', '5');
    formData.append('description', 'TrimTime Partner Salon');
    formData.append('gst', '');
    formData.append('salonType', salonType);
    formData.append('aadhaarPan', aadhaarPan);

    const res = await registerBarber(formData);
    setLoading(false);

    if (res.success) {
      setSuccess('Your shop registration request has been submitted successfully! Admin approval is required before you can log in.');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        navigate('/barber/login');
      }, 5000);
    } else {
      setError(res.message || 'Registration failed. Try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate 24 hour selections
  const generateHourOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m of ['00', '30']) {
        const hh = h < 10 ? `0${h}` : h;
        options.push(`${hh}:${m}`);
      }
    }
    return options;
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-brand-50 to-brand-100 dark:from-brand-900 dark:to-brand-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Banner */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-2xl text-white mb-4">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-brand-900 dark:text-brand-50">Register Your Barber Shop</h1>
          <p className="text-brand-500 dark:text-brand-400 mt-2">Partner with TrimTime to scale your grooming business</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800/40">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm rounded-xl border border-green-200 dark:border-green-800/40">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Credentials */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-800 space-y-4">
            <h3 className="text-lg font-bold text-brand-900 dark:text-brand-50 font-display mb-4 border-b pb-2">Business Login Credentials</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-brand-400" />
                  <input
                    type="email"
                    placeholder="shop@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-brand-400" />
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-brand-400" />
                  <input
                    type="password"
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-brand-400" />
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Owner & Shop details */}
          <div className="bg-white dark:bg-brand-900 p-6 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-800 space-y-4">
            <h3 className="text-lg font-bold text-brand-900 dark:text-brand-50 font-display mb-4 border-b pb-2">Shop Profile Settings</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4.5 w-4.5 text-brand-400" />
                  <input
                    type="text"
                    placeholder="TrimTime Classic Salon"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Owner Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4.5 w-4.5 text-brand-400" />
                  <input
                    type="text"
                    placeholder="Vikram Singh"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">City Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-brand-400" />
                  <input
                    type="text"
                    placeholder="Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-900 dark:text-brand-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Salon Type (Gender Target) *</label>
                <select
                  value={salonType}
                  onChange={(e) => setSalonType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-brand-700 dark:text-brand-300 font-semibold"
                  required
                >
                  <option value="Men's Salon">Men's Salon</option>
                  <option value="Women's Salon">Women's Salon</option>
                  <option value="Unisex Salon">Unisex Salon</option>
                </select>
              </div>

              {/* Aadhaar/PAN Document Upload for verification */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-brand-700 dark:text-brand-300 mb-2">Government ID Proof (Aadhaar/PAN PDF or Image) *</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 border border-brand-200 dark:border-brand-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 w-full justify-center">
                    <FileText className="w-5 h-5 text-accent-500" />
                    <span>{aadhaarPan ? aadhaarPan.name : "Select ID Proof File"}</span>
                    <input type="file" onChange={handleDocumentChange} className="hidden" required />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Partner Policy Disclaimer */}
          <div className="flex items-start gap-2.5 p-4 bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-2xl">
            <input
              type="checkbox"
              id="partnerTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded text-accent-500 focus:ring-accent-500 cursor-pointer"
              required
            />
            <label htmlFor="partnerTerms" className="text-xs text-brand-600 dark:text-brand-400 font-medium leading-relaxed">
              By registering your salon, you agree to TrimTime's{' '}
              <Link to="/partner-policy" target="_blank" className="text-accent-600 dark:text-accent-400 font-bold hover:underline">
                Salon Partner Policy
              </Link>{', '}
              <Link to="/terms" target="_blank" className="text-accent-600 dark:text-accent-400 font-bold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" className="text-accent-600 dark:text-accent-400 font-bold hover:underline">
                Privacy Policy
              </Link>.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-2xl text-base shadow-md shadow-accent-500/10 hover:shadow-accent-500/25 flex justify-center items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Submit Shop Registration"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-600 dark:text-brand-400">
          Already registered?{' '}
          <Link to="/barber/login" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}
