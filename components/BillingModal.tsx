import React, { useState, useRef } from 'react';
import { X, CreditCard, ShieldCheck, GraduationCap, Briefcase, CheckCircle2, Loader2, Upload, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { User, UserType, SubscriptionStatus } from '../types';
import { authService } from '../services/authService';
import { verifyStudentId } from '../services/geminiService';

interface BillingModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({ user, onClose, onUpdate }) => {
  const [step, setStep] = useState<'SELECT' | 'PAYMENT' | 'VERIFY'>('SELECT');
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = user.userType === UserType.STUDENT;
  const price = isStudent ? 2500 : 5000;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
        setVerificationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkCard = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // Mocking payment processing
    
    const updatedUser: User = {
      ...user,
      paymentMethodLinked: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE
    };
    
    await authService.updateUser(updatedUser);
    onUpdate(updatedUser);
    setIsLoading(false);
    onClose();
  };

  const handleVerifyStudent = async () => {
    if (!schoolName || !fileBase64) return;
    setIsLoading(true);
    setVerificationError(null);
    
    try {
      const result = await verifyStudentId(fileBase64, schoolName);
      
      if (result.verified) {
        const updatedUser: User = {
          ...user,
          studentVerified: true,
          schoolName: schoolName
        };
        await authService.updateUser(updatedUser);
        onUpdate(updatedUser);
        setStep('PAYMENT');
      } else {
        setVerificationError(result.reason || "We couldn't verify this ID. Please ensure the school name matches and the ID is clear.");
      }
    } catch (error) {
      setVerificationError("Verification failed due to a technical error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <CreditCard className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Setup Subscription</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8">
          {step === 'SELECT' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Trial then Auto-Pay
                </h3>
                <p className="text-slate-500 text-sm">
                  Link your card today to keep access after your 30-day trial ends.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border-2 transition-all ${isStudent ? 'border-emerald-500 bg-emerald-50' : 'border-indigo-500 bg-indigo-50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {isStudent ? <GraduationCap className="text-emerald-600" /> : <Briefcase className="text-indigo-600" />}
                    <span className="font-bold text-slate-900">{isStudent ? 'Student Plan' : 'Professional Plan'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-slate-900">₦{price}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className={isStudent ? 'text-emerald-500' : 'text-indigo-500'} />
                    Unlimited AI Presentations
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className={isStudent ? 'text-emerald-500' : 'text-indigo-500'} />
                    Pro Image Generation
                  </li>
                  {isStudent && (
                     <li className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-white px-2 py-1 rounded-full border border-emerald-100 self-start">
                        Special Student Discount Applied
                     </li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => setStep(isStudent && !user.studentVerified ? 'VERIFY' : 'PAYMENT')}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Proceed to Setup <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 'VERIFY' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <GraduationCap size={32} />
                <h3 className="text-2xl font-bold">Student Verification</h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                To access the ₦2,500 rate, our AI must verify your student credentials.
              </p>

              {verificationError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-start gap-2 border border-red-100 animate-in slide-in-from-top-2">
                   <AlertCircle size={14} className="shrink-0 mt-0.5" />
                   {verificationError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">School Name</label>
                  <input 
                    type="text" 
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="e.g. University of Lagos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Student ID (Photo)</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${fileBase64 ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300'}`}
                  >
                    {fileBase64 ? (
                      <div className="text-center">
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 size={24} />
                         </div>
                         <span className="text-xs font-bold text-emerald-700">ID Image Selected</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-slate-400 mb-2" size={24} />
                        <span className="text-xs font-medium text-slate-500">Click to capture or upload photo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep('SELECT')} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                  Back
                </button>
                <button 
                  onClick={handleVerifyStudent}
                  disabled={!schoolName || !fileBase64 || isLoading}
                  className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="animate-pulse">Analyzing ID...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <Sparkles size={18} />
                       <span>AI Verification</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Payment Details</h3>
                <div className="flex gap-2">
                    <div className="h-6 w-10 bg-slate-100 rounded border border-slate-200" />
                    <div className="h-6 w-10 bg-slate-100 rounded border border-slate-200" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">CVV</label>
                    <input 
                      type="password" 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="***"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                <ShieldCheck className="text-indigo-600 shrink-0 mt-1" size={18} />
                <p className="text-xs text-indigo-700 leading-tight">
                  You will not be charged today. Auto-billing for <strong>₦{price}</strong> will begin on {new Date(user.trialStartDate + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('SELECT')} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                  Back
                </button>
                <button 
                  onClick={handleLinkCard}
                  disabled={!cardNumber || isLoading}
                  className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};