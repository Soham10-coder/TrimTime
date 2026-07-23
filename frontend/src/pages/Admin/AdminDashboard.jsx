import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ShieldCheck, Users, Store, DollarSign, ClipboardList, Check, X, Plus, AlertCircle, TrendingUp, Percent, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approvals');
  
  // States
  const [analytics, setAnalytics] = useState(null);
  const [pendingBarbers, setPendingBarbers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coupon Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponValue, setCouponValue] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const aRes = await api.get('/admin/analytics');
      const pRes = await api.get('/admin/pending-barbers');
      const cRes = await api.get('/admin/coupons');
      const uRes = await api.get('/admin/users');
      const bRes = await api.get('/admin/barbers');

      if (aRes.ok && pRes.ok && cRes.ok && uRes.ok && bRes.ok) {
        setAnalytics(await aRes.json());
        setPendingBarbers(await pRes.json());
        setCoupons(await cRes.json());
        setUsers(await uRes.json());
        setBarbers(await bRes.json());
      }
    } catch (e) {
      console.error("Failed to load admin panel data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/admin/approve-barber/${id}`, {});
      if (res.ok) {
        alert("Barber approved and activated successfully!");
        fetchAdminData();
      }
    } catch (e) {
      alert("Approve request failed.");
    }
  };

  const handleToggleBarber = async (id) => {
    try {
      const res = await api.post(`/admin/toggle-barber/${id}`, {});
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      alert("Toggle status failed.");
    }
  };

  const handleRemoveBarber = async (id) => {
    if (window.confirm("Are you sure you want to permanently remove this barber salon and all its associated bookings/services?")) {
      try {
        const res = await api.delete(`/admin/remove-barber/${id}`);
        if (res.ok) {
          alert("Barber salon removed successfully!");
          fetchAdminData();
        } else {
          const data = await res.json();
          alert(data.message || "Failed to remove barber salon.");
        }
      } catch (e) {
        alert("Remove request failed.");
      }
    }
  };

  const handleRemoveUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently remove this customer account and all their booking history?")) {
      try {
        const res = await api.delete(`/admin/remove-user/${id}`);
        if (res.ok) {
          alert("Customer account removed successfully!");
          fetchAdminData();
        } else {
          const data = await res.json();
          alert(data.message || "Failed to remove customer account.");
        }
      } catch (e) {
        alert("Remove request failed.");
      }
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponSuccess('');
    setCouponError('');

    if (!couponCode || !couponValue) {
      setCouponError('Please enter a coupon code and value.');
      return;
    }

    try {
      const res = await api.post('/admin/coupons', {
        code: couponCode.toUpperCase(),
        discountType: couponType,
        value: parseFloat(couponValue),
        minBookingAmount: parseFloat(minAmount || 0),
        expiryDays: parseInt(expiryDays)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setCouponSuccess('Promo coupon code created successfully!');
        setCouponCode('');
        setCouponValue('');
        setMinAmount('');
        fetchAdminData();
      } else {
        setCouponError(data.message || 'Failed to create coupon.');
      }
    } catch (err) {
      setCouponError('Error sending request.');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      const res = await api.put(`/admin/coupons/${id}`, {});
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      alert("Toggle status failed.");
    }
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
      
      {/* HEADER BANNER */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-sm flex items-center justify-between mb-10">
        <div>
          <span className="text-xs text-accent-500 font-bold uppercase tracking-wider">TrimTime Operator Room</span>
          <h1 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50">Admin Analytics & Moderation</h1>
          <p className="text-sm text-brand-600 dark:text-brand-400">Manage registrations, generate discount vouchers, and audit billing metrics</p>
        </div>
        <div className="p-3 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-full text-white">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>

      {/* METRIC NUMBERS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <DollarSign className="w-5 h-5 text-green-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Total Volume</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-50 font-display">₹{analytics?.metrics.totalRevenue}</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <Users className="w-5 h-5 text-accent-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Registered Clients</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-50 font-display">{analytics?.metrics.totalCustomers}</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <Store className="w-5 h-5 text-blue-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Barber Shops</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-50 font-display">{analytics?.metrics.totalBarbers}</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm">
          <ClipboardList className="w-5 h-5 text-indigo-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Total Slots</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-50 font-display">{analytics?.metrics.totalBookings}</span>
        </div>

        <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <TrendingUp className="w-5 h-5 text-orange-500 mb-2" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide block">Pending Approval</span>
          <span className="text-2xl font-extrabold text-brand-800 dark:text-brand-50 font-display">{pendingBarbers.length} shops</span>
        </div>
      </div>

      {/* ADMIN TABS MENU */}
      <div className="flex border-b border-brand-200 dark:border-brand-800 mb-8 overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'approvals' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Store className="w-4 h-4" />
          Pending Approvals ({pendingBarbers.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'coupons' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Percent className="w-4 h-4" />
          Coupons Manager
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Revenue Reports
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'moderation' 
              ? 'border-accent-500 text-accent-500 font-bold' 
              : 'border-transparent text-brand-600 dark:text-brand-400 hover:text-accent-500'
          }`}
        >
          <Users className="w-4 h-4" />
          Users Moderation
        </button>
      </div>

      {/* --- PANEL CONTENT SELECTOR --- */}
      <div>
        
        {/* PANEL 1: PENDING VERIFICATIONS */}
        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 mb-6">Barber Verification Queue</h2>
            
            {pendingBarbers.length === 0 ? (
              <p className="text-center py-12 text-brand-400 text-sm">No new barber verification requests pending.</p>
            ) : (
              <div className="space-y-6">
                {pendingBarbers.map((b) => (
                  <div key={b.id} className="border border-brand-100 dark:border-brand-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="flex gap-4">
                      {b.profilePic ? (
                        <img src={b.profilePic} className="w-16 h-16 rounded-full object-cover border" alt="Avatar" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-brand-400">
                          <Store className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-brand-900 dark:text-brand-50 font-display text-lg">{b.shopName}</h3>
                        <p className="text-sm text-brand-600 dark:text-brand-400">Owner: {b.ownerName} &bull; Exp: {b.experience} yrs</p>
                        <p className="text-xs text-brand-500 mt-1">{b.address}, {b.city}</p>
                        <p className="text-xs text-brand-400 mt-0.5">Contacts: {b.email} | {b.phone}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      {b.aadhaarPan && (
                        <a
                          href={b.aadhaarPan}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-brand-50 dark:hover:bg-brand-800 flex items-center justify-center gap-1.5 text-brand-700 dark:text-brand-300"
                        >
                          <FileText className="w-4 h-4" />
                          View Proof ID
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Verify & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: VOUCHER COUPON MANAGER */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create Coupon form */}
            <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm h-fit">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 mb-6 flex items-center gap-1">
                <Plus className="w-5 h-5 text-accent-500" />
                Generate Promo Code
              </h3>

              {couponSuccess && (
                <div className="flex items-center gap-1.5 p-3.5 mb-4 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200">
                  <Check className="w-4 h-4" />
                  <span>{couponSuccess}</span>
                </div>
              )}

              {couponError && (
                <div className="flex items-center gap-1.5 p-3.5 mb-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>{couponError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. TRIMTIME30"
                    className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50 font-mono tracking-wider font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Discount Type</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-700 dark:text-brand-300"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Min Booking Amt required (₹)</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Valid Days</label>
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-sm focus:outline-none text-brand-900 dark:text-brand-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Create Coupon Code
                </button>
              </form>
            </div>

            {/* Coupons list */}
            <div className="lg:col-span-2 bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 mb-6">Existing Voucher Codes</h3>

              {coupons.length === 0 ? (
                <p className="text-brand-400 text-sm italic">No coupons created yet.</p>
              ) : (
                <div className="space-y-4">
                  {coupons.map((c) => (
                    <div key={c.id} className="border border-brand-100 dark:border-brand-800/80 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-mono font-extrabold text-sm tracking-wider text-accent-600 border border-accent-600/30 px-2.5 py-0.5 rounded bg-accent-50 dark:bg-accent-950/20">{c.code}</span>
                        <p className="text-xs text-brand-600 dark:text-brand-400 mt-2">
                          Value: {c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} &bull; Min spend: ₹{c.minBookingAmount}
                        </p>
                        <p className="text-[10px] text-brand-400 mt-0.5">Expires on: {c.expiryDate}</p>
                      </div>

                      <button
                        onClick={() => handleToggleCoupon(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          c.active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950/20' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/20'
                        }`}
                      >
                        {c.active ? "Active" : "Disabled"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* PANEL 3: REVENUE REPORTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50">Revenue Analytics Chart</h2>
            
            {/* Recharts chart container */}
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <XAxis dataKey="month" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#1c1917', color: '#fff', borderRadius: 8, border: 'none' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-xs text-brand-400 mt-2 text-center">Chart displays monthly aggregated revenue generated platform-wide in INR.</p>
          </div>
        )}

        {/* PANEL 4: USERS MODERATION */}
        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Customer accounts moderation */}
            <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 mb-4">Customer Accounts</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {users.map(u => (
                  <div key={u.id} className="p-3 border-b border-brand-100 dark:border-brand-800/40 flex justify-between items-center text-sm">
                    <div>
                      <strong className="text-brand-800 dark:text-brand-200">{u.name}</strong>
                      <p className="text-xs text-brand-400">{u.email} &bull; {u.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-brand-100 dark:bg-brand-850 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded">
                        {u.loyaltyPoints} pts
                      </span>
                      <button
                        onClick={() => handleRemoveUser(u.id)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 rounded-lg text-xs font-bold transition-all border border-red-200/50 dark:border-red-800/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Barber accounts moderation */}
            <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display text-brand-900 dark:text-brand-50 mb-4">Merchant Status Control</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {barbers.map(b => (
                  <div key={b.id} className="p-3 border-b border-brand-100 dark:border-brand-800/40 flex justify-between items-center text-sm">
                    <div>
                      <strong className="text-brand-800 dark:text-brand-200">{b.shopName}</strong>
                      <p className="text-xs text-brand-400">{b.ownerName} &bull; {b.city}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleBarber(b.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          b.status === 'active' 
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {b.status === 'active' ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleRemoveBarber(b.id)}
                        className="px-3 py-1 rounded text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all animate-pulse hover:animate-none"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
