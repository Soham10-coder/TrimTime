import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, QrCode, Building2, Wallet, CheckCircle2, Lock, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ isOpen, onClose, bookingData, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking', 'wallet'
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  if (!isOpen || !bookingData) return null;

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate bank/UPI 3D Secure authentication flow
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      
      setTimeout(() => {
        onPaymentSuccess({
          transactionId: `TXN_${Date.now()}`,
          method: paymentMethod.toUpperCase(),
          status: 'SUCCESS'
        });
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-brand-900 max-w-lg w-full rounded-3xl border border-brand-200 dark:border-brand-800 shadow-2xl overflow-hidden relative"
      >
        {/* MODAL HEADER */}
        <div className="p-6 bg-brand-900 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Payment Gateway
            </span>
            <h2 className="text-xl font-bold font-display mt-0.5">Complete Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white rounded-full bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50">Payment Successful!</h3>
            <p className="text-xs text-brand-500">Your appointment is confirmed. Generating check-in OTP...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* PRICE SUMMARY CARD */}
            <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-2xl flex justify-between items-center border border-brand-200 dark:border-brand-800">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Total Amount Payable</span>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{bookingData.hairstyleName} &bull; {bookingData.date}</p>
              </div>
              <span className="text-2xl font-extrabold font-display text-green-600 dark:text-green-400">₹{bookingData.totalAmount}</span>
            </div>

            {/* PAYMENT METHOD TABS */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'Banking', icon: Building2 },
                { id: 'wallet', label: 'Wallets', icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 hover:bg-brand-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PAYMENT FORM BODIES */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              
              {/* 1. UPI METHOD */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-accent-300 dark:border-accent-800 rounded-2xl text-center space-y-2 bg-accent-50/50 dark:bg-brand-950">
                    <span className="text-xs font-bold text-accent-700 dark:text-accent-400 block">Scan & Pay with Any UPI App</span>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow border flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=trimtime@icici%26pn=TrimTime%26am=${bookingData.totalAmount}%26cu=INR`} 
                        alt="UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-brand-500 font-semibold">Supported: GPay, PhonePe, Paytm, BHIM</p>
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">Or Enter Your VPA / UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or username@okicici"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {/* 2. CARD METHOD */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">Card Number *</label>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      placeholder="4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8921"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">Expiry (MM/YY) *</label>
                      <input
                        type="text"
                        required
                        maxLength="5"
                        placeholder="08/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-mono font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">CVV *</label>
                      <input
                        type="password"
                        required
                        maxLength="4"
                        placeholder="&bull;&bull;&bull;"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-mono font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. NET BANKING METHOD */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">Select Bank *</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-bold"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* 4. WALLET METHOD */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">Select Wallet *</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-bold"
                  >
                    <option value="Paytm Wallet">Paytm Wallet</option>
                    <option value="PhonePe Wallet">PhonePe Wallet</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Mobikwik">Mobikwik</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex justify-center items-center gap-2 mt-4"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Secure Payment...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay ₹{bookingData.totalAmount} Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-[10px] text-brand-400 font-semibold pt-2 border-t">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Razorpay & TrimTime Payment Protection Guarantee</span>
            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
}
