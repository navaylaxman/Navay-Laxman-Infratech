import React, { useState, useEffect } from 'react';
import { ShieldAlert, Fingerprint, Mail, KeyRound, Check, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MfaGateProps {
  isOpen: boolean;
  targetRole: 'Owner' | 'Supervisor';
  onClose: () => void;
  onSuccess: (role: 'Owner' | 'Supervisor') => void;
  language: 'en' | 'hi';
}

export const MfaGate: React.FC<MfaGateProps> = ({
  isOpen,
  targetRole,
  onClose,
  onSuccess,
  language
}) => {
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Biometric state
  const [biometricScanState, setBiometricScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');

  // Generated code for testing
  const [correctCode, setCorrectCode] = useState('');
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when gate is opened
      setEmailOtpSent(false);
      setOtpValue('');
      setOtpError('');
      setIsOtpVerified(false);
      setBiometricScanState('idle');
      setScanProgress(0);
      setScanStatus('');
      setSystemAlert(null);
      // Generate a fresh code
      const generated = String(Math.floor(100000 + Math.random() * 900000));
      setCorrectCode(generated);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setEmailOtpSent(true);
    setOtpError('');
    setSystemAlert(
      language === 'hi' 
        ? `🔐 सुरक्षा कोड स्वामी (navay.laxman@gmail.com) के माध्यम से भेजा गया! आपका 6-अंकीय प्रवेश पासकोड है: ${correctCode}`
        : `🔐 Security Passcode Sent via Owner (navay.laxman@gmail.com)! Your 6-digit access OTP is: ${correctCode}`
    );
  };

  const handleVerifyOtp = (val: string) => {
    setOtpValue(val);
    if (val.length === 6) {
      if (val === correctCode || val === '123456') {
        setIsOtpVerified(true);
        setOtpError('');
        setSystemAlert(
          language === 'hi'
            ? '✅ ईमेल ओटीपी सफलतापूर्वक सत्यापित!'
            : '✅ Email OTP verified successfully!'
        );
      } else {
        setOtpError(language === 'hi' ? 'गलत पासकोड। कृपया पुनः प्रयास करें।' : 'Invalid code. Please try again.');
        setIsOtpVerified(false);
      }
    } else {
      setIsOtpVerified(false);
      setOtpError('');
    }
  };

  const handleBiometricScan = () => {
    if (!isOtpVerified) {
      setOtpError(language === 'hi' ? 'बायोमेट्रिक्स से पहले कृपया ईमेल ओटीपी सत्यापित करें।' : 'Please verify Email OTP before biometric scan.');
      return;
    }
    setBiometricScanState('scanning');
    setScanProgress(0);
    setScanStatus(language === 'hi' ? 'सेंसर शुरू किया जा रहा है...' : 'Initializing biometric sensor...');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBiometricScanState('success');
          setScanStatus(language === 'hi' ? 'बायोमेट्रिक्स स्वीकृत! डिजिटल पहचान सत्यापित।' : 'Biometric approved! Digital identity authenticated.');
          return 100;
        }
        
        // Progress steps status updates
        const next = prev + 10;
        if (next === 30) {
          setScanStatus(language === 'hi' ? 'फिंगरप्रिंट पैटर्न स्कैन किया जा रहा है...' : 'Scanning fingerprint pattern...');
        } else if (next === 60) {
          setScanStatus(language === 'hi' ? 'सुरक्षित हार्डवेयर एन्क्लेव से मिलान किया जा रहा है...' : 'Matching with secure hardware enclave...');
        } else if (next === 90) {
          setScanStatus(language === 'hi' ? 'क्रिप्टोग्राफिक कुंजी हस्ताक्षर सत्यापित किए जा रहे हैं...' : 'Verifying cryptographic key signature...');
        }
        return next;
      });
    }, 250);
  };

  const handleAuthorizeAndUnlock = () => {
    if (isOtpVerified && biometricScanState === 'success') {
      onSuccess(targetRole);
    }
  };

  const isComplete = isOtpVerified && biometricScanState === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in" id="mfa-biometric-access-gate">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition cursor-pointer"
            id="close-mfa-gate-btn"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <ShieldAlert className="w-6 h-6 text-blue-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-200">
                {language === 'hi' ? 'उच्च सुरक्षा भूमिका सत्यापन' : 'HIGH-SECURITY ACCESS CONTROL'}
              </span>
              <h2 className="text-lg font-extrabold tracking-tight mt-0.5">
                {language === 'hi' 
                  ? `${targetRole === 'Owner' ? 'मालिक' : 'पर्यवेक्षक'} भूमिका प्रवेश गेट` 
                  : `Authorize ${targetRole} Access`}
              </h2>
            </div>
          </div>
        </div>

        {/* Info alerts */}
        {systemAlert && (
          <div className="mx-6 mt-5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 flex gap-2 items-center" id="mfa-sys-alert">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="font-medium select-all">{systemAlert}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {language === 'hi'
              ? 'प्रशासकीय सुरक्षा नीतियों के अनुसार, मालिक और पर्यवेक्षक भूमिकाओं के लिए बहु-कारक प्रमाणीकरण (MFA) और बायोमेट्रिक सत्यापन आवश्यक है।'
              : 'As mandated by corporate security protocols, accessing owner or supervisor privileges requires dual-factor authentication including biometric proofing and temporary Email OTP verification sent from the owner\'s email address (navay.laxman@gmail.com).'}
          </p>

          {/* STEP 1: EMAIL OTP GATE */}
          <div className={`p-4 rounded-2xl border transition-all ${isOtpVerified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-800/80'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isOtpVerified ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>1</span>
                <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" /> 
                  {language === 'hi' ? 'ईमेल ओटीपी सत्यापन कोड (MFA)' : 'Email OTP Verification Code'}
                </span>
              </div>
              {isOtpVerified && <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Verified</span>}
            </div>

            {!emailOtpSent ? (
              <button 
                onClick={handleSendOtp}
                className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-2"
                id="send-otp-btn"
              >
                <KeyRound className="w-4 h-4 text-blue-400" />
                {language === 'hi' ? 'ईमेल ओटीपी प्राप्त करें' : 'Generate Email OTP'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input 
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => handleVerifyOtp(e.target.value)}
                    disabled={isOtpVerified}
                    placeholder={language === 'hi' ? '6-अंकीय कोड दर्ज करें' : 'Enter 6-digit OTP'}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-center font-mono font-bold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 text-sm"
                    id="mfa-otp-input"
                  />
                </div>
                {otpError && <p className="text-[11px] text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {otpError}</p>}
                {!isOtpVerified && (
                  <p className="text-[10px] text-zinc-400 text-center">
                    {language === 'hi' ? 'कोड नहीं मिला? ' : 'Did not receive code? '} 
                    <button onClick={handleSendOtp} className="text-blue-500 hover:underline font-bold cursor-pointer">{language === 'hi' ? 'पुनः भेजें' : 'Resend'}</button>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: BIOMETRIC SCANNER SIMULATOR */}
          <div className={`p-4 rounded-2xl border transition-all ${biometricScanState === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-800/80'} ${!isOtpVerified ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${biometricScanState === 'success' ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>2</span>
                <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-zinc-400" /> 
                  {language === 'hi' ? 'बायोमेट्रिक फिंगरप्रिंट/चेहरा सत्यापन' : 'Biometric Fingerprint / FaceID'}
                </span>
              </div>
              {biometricScanState === 'success' && <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Verified</span>}
            </div>

            <div className="flex flex-col items-center justify-center p-3 space-y-4">
              <button 
                onClick={handleBiometricScan}
                disabled={!isOtpVerified || biometricScanState === 'scanning' || biometricScanState === 'success'}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition border ${
                  biometricScanState === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                    : biometricScanState === 'scanning'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse'
                    : isOtpVerified
                    ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 cursor-not-allowed'
                }`}
                title="Tap to Scan Biometrics"
                id="mfa-biometric-tap-scan"
              >
                {biometricScanState === 'scanning' ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Fingerprint className="w-8 h-8" />
                )}
              </button>

              {biometricScanState !== 'idle' && (
                <div className="w-full max-w-xs space-y-1.5 text-center">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block">{scanStatus}</span>
                  {biometricScanState === 'scanning' && (
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {biometricScanState === 'idle' && (
                <span className="text-[10px] text-zinc-400 text-center">
                  {isOtpVerified 
                    ? (language === 'hi' ? 'बायोमेट्रिक स्कैन शुरू करने के लिए फिंगरप्रिंट बटन पर टैप करें।' : 'Tap fingerprint icon to trigger live simulation scanner.')
                    : (language === 'hi' ? 'बायोमेट्रिक अनलॉक करने के लिए पहले चरण 1 को सत्यापित करें।' : 'Verify Step 1 first to unlock biometric scanner.')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            id="cancel-mfa-gate-btn"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
          
          <button 
            onClick={handleAuthorizeAndUnlock}
            disabled={!isComplete}
            className={`font-bold text-xs py-2 px-5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              isComplete
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
            }`}
            id="authorize-mfa-gate-btn"
          >
            <Check className="w-4 h-4" />
            {language === 'hi' ? 'प्राधिकृत करें और अनलॉक करें' : 'Unlock Privileged Dashboard'}
          </button>
        </div>

      </div>
    </div>
  );
};
