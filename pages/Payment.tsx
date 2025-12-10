import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Smartphone, QrCode, ArrowLeft, Zap, Shield, Clock, Crown, Sparkles } from '../components/Icons';

const PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '₹0',
    period: 'forever',
    queries: 5,
    features: [
      '5 queries per day',
      'Basic AI agents',
      'Standard reports',
      'Email support'
    ],
    popular: false,
    color: 'slate'
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '₹499',
    period: 'month',
    queries: 50,
    features: [
      '50 queries per day',
      'All AI agents',
      'Advanced PDF reports',
      'Excel & PowerPoint export',
      'Priority support',
      'Chat history sync'
    ],
    popular: true,
    color: 'cyan'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₹1,999',
    period: 'month',
    queries: 500,
    features: [
      '500 queries per day',
      'All Pro features',
      'API access',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ],
    popular: false,
    color: 'violet'
  }
];

export default function Payment() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'qr'>('razorpay');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePayment = async () => {
    if (selectedPlan === 'free') {
      localStorage.setItem('curecoders_query_data', JSON.stringify({
        queries: 0,
        plan: 'free',
        resetDate: new Date().toDateString()
      }));
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    if (!mobileNumber || mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      localStorage.setItem('curecoders_query_data', JSON.stringify({
        queries: 0,
        plan: selectedPlan,
        resetDate: new Date().toDateString()
      }));
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }, 2000);
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-cyan-300">Your {selectedPlanData?.name} is now active</p>
          <p className="text-slate-400 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Plan</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Unlock the full potential of AI-powered pharmaceutical intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                selectedPlan === plan.id
                  ? 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 border border-white/10 hover:border-white/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                {plan.id === 'free' && <Clock className="w-8 h-8 text-slate-400" />}
                {plan.id === 'pro' && <Zap className="w-8 h-8 text-cyan-400" />}
                {plan.id === 'enterprise' && <Crown className="w-8 h-8 text-violet-400" />}
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">/{plan.period}</span>
              </div>

              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white/5 rounded-lg">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">{plan.queries} queries/day</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedPlan !== 'free' && (
          <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              Secure Payment
            </h2>

            <div className="mb-6">
              <label className="block text-slate-300 mb-2 text-sm font-medium">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 mb-3 text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'razorpay' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'razorpay' ? 'text-cyan-300' : 'text-slate-400'}`}>Razorpay</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'upi' ? 'text-cyan-300' : 'text-slate-400'}`}>UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'qr'
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <QrCode className={`w-6 h-6 ${paymentMethod === 'qr' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'qr' ? 'text-cyan-300' : 'text-slate-400'}`}>QR Code</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'qr' && (
              <div className="mb-6 p-6 bg-white rounded-xl text-center">
                <div className="w-48 h-48 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                    <rect x="10" y="10" width="25" height="25" fill="#000"/>
                    <rect x="65" y="10" width="25" height="25" fill="#000"/>
                    <rect x="10" y="65" width="25" height="25" fill="#000"/>
                    <rect x="15" y="15" width="15" height="15" fill="#fff"/>
                    <rect x="70" y="15" width="15" height="15" fill="#fff"/>
                    <rect x="15" y="70" width="15" height="15" fill="#fff"/>
                    <rect x="18" y="18" width="9" height="9" fill="#000"/>
                    <rect x="73" y="18" width="9" height="9" fill="#000"/>
                    <rect x="18" y="73" width="9" height="9" fill="#000"/>
                    <rect x="40" y="10" width="5" height="5" fill="#000"/>
                    <rect x="50" y="10" width="5" height="5" fill="#000"/>
                    <rect x="40" y="20" width="5" height="5" fill="#000"/>
                    <rect x="45" y="40" width="10" height="10" fill="#000"/>
                    <rect x="10" y="45" width="5" height="5" fill="#000"/>
                    <rect x="20" y="45" width="5" height="5" fill="#000"/>
                    <rect x="85" y="45" width="5" height="5" fill="#000"/>
                    <rect x="45" y="60" width="5" height="5" fill="#000"/>
                    <rect x="55" y="55" width="5" height="5" fill="#000"/>
                    <rect x="65" y="65" width="25" height="25" fill="#000"/>
                    <rect x="70" y="70" width="15" height="15" fill="#fff"/>
                    <rect x="73" y="73" width="9" height="9" fill="#06b6d4"/>
                  </svg>
                </div>
                <p className="text-slate-600 text-sm">Scan with any UPI app</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Pay {selectedPlanData?.price}
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>

            <p className="text-center text-slate-500 text-xs mt-4 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Secured by 256-bit SSL encryption
            </p>
          </div>
        )}

        {selectedPlan === 'free' && (
          <div className="max-w-md mx-auto text-center">
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl transition-all duration-300"
            >
              Continue with Free Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
