"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Briefcase, Home, Loader2, Phone, Mic, Globe } from "lucide-react";
import LoginLogic from "./LoginLogic";
import SignupLogic from "./SignupLogic";
import { useStore } from "@/lib/store";

export default function AuthScreen({ mode = "login" }) {
  const router = useRouter();
  const { t, lang, toggleLang } = useStore();
  const [activeTab, setActiveTab] = useState(mode);
  const [role, setRole] = useState(null);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const handlePhoneLogin = () => {
    if (phoneNumber.length !== 10) {
      alert(lang === 'en' ? "Please enter a valid 10-digit phone number" : "कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें");
      return;
    }
    
    setOtpLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
      const message = lang === 'en' 
        ? `OTP sent to ${phoneNumber} (Demo mode: 123456)` 
        : `OTP ${phoneNumber} पर भेजा गया (डेमो मोड: 123456)`;
      alert(message);
    }, 1500);
  };

  const verifyOtp = () => {
    if (otp.length !== 6) {
      alert(lang === 'en' ? "Please enter 6-digit OTP" : "कृपया 6 अंकों का OTP दर्ज करें");
      return;
    }
    
    const message = lang === 'en' 
      ? "Phone login successful in demo mode!" 
      : "फोन लॉगिन डेमो मोड में सफल!";
    alert(message);
    router.replace("/onboarding");
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(lang === 'en' 
        ? "Voice input not supported in your browser" 
        : "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है");
      return;
    }

    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceInput(transcript);
      
      // Auto-fill phone number if detected
      const numbers = transcript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const phone = numbers.join('').slice(0, 10);
        setPhoneNumber(phone);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const readInstructions = () => {
    const instructions = lang === 'en' 
      ? "Welcome to Shram Saathi. Please select your role: Worker or Customer. You can login with Google or Phone number."
      : "श्रम साथी में आपका स्वागत है। कृपया अपनी भूमिका चुनें: कर्मचारी या ग्राहक। आप Google या फोन नंबर से लॉगिन कर सकते हैं।";
    speakText(instructions);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 px-4 py-8 transition-all duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_40px_90px_rgba(0,0,0,0.15)] p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_40px_90px_rgba(0,0,0,0.2)]">
        {/* Language Toggle and Voice Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
          >
            <Globe size={16} />
            <span className="text-sm font-medium">{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
          <button
            onClick={readInstructions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
          >
            <Mic size={16} />
            <span className="text-sm font-medium">{t.listen || "Listen"}</span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8 transition-transform duration-300 hover:scale-105">
          <Image src="/logo/s1.png" alt="ShramSaathi" width={220} height={70} />
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t.welcome}</h1>
          <p className="text-sm text-gray-500">{t.tagline}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-10 text-base mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setShowPhoneLogin(false);
              router.replace("/login");
            }}
            className={`pb-1 font-semibold transition-all duration-200 ${
              activeTab === "login"
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.login}
          </button>

          <button
            onClick={() => {
              setActiveTab("register");
              setShowPhoneLogin(false);
              router.replace("/signup");
            }}
            className={`pb-1 font-semibold transition-all duration-200 ${
              activeTab === "register"
                ? "text-emerald-600 border-b-2 border-emerald-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.register}
          </button>
        </div>

        {/* Phone Login/Register */}
        {showPhoneLogin ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {!otpSent ? (
              <>
                <div className="text-center mb-6">
                  <Phone className="mx-auto text-emerald-600 mb-2" size={32} />
                  <h3 className="font-semibold text-gray-800">{t.enterPhoneNumber}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {lang === 'en' ? "We'll send you a verification code" : "हम आपको एक सत्यापन कोड भेजेंगे"}
                  </p>
                </div>
                
                {/* Voice Input Button */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <span className="text-gray-500">+91</span>
                      <div className="h-6 w-px bg-gray-300"></div>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder={t.enterPhoneNumber}
                      className="w-full pl-20 pr-12 py-4 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition"
                      maxLength={10}
                    />
                    <button
                      onClick={startVoiceInput}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${
                        isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
                
                {voiceInput && (
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium">{lang === 'en' ? "You said:" : "आपने कहा:"}</span> {voiceInput}
                  </div>
                )}
                
                <button
                  onClick={handlePhoneLogin}
                  disabled={otpLoading || phoneNumber.length !== 10}
                  className="w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading ? <Loader2 className="animate-spin" /> : t.sendOtp}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Phone className="mx-auto text-emerald-600 mb-2" size={32} />
                  <h3 className="font-semibold text-gray-800">{t.enterOtp}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {lang === 'en' ? `Sent to +91 ${phoneNumber}` : `+91 ${phoneNumber} पर भेजा गया`}
                    <button 
                      onClick={() => setOtpSent(false)}
                      className="ml-2 text-emerald-600 font-medium"
                    >
                      {lang === 'en' ? "Change" : "बदलें"}
                    </button>
                  </p>
                </div>
                
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t.enterOtp}
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                
                <button
                  onClick={verifyOtp}
                  disabled={otp.length !== 6}
                  className="w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {t.verifyContinue}
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowPhoneLogin(false)}
              className="w-full text-center text-gray-500 hover:text-gray-700 text-sm mt-4 transition"
            >
              ← {lang === 'en' ? "Back to other options" : "अन्य विकल्पों पर वापस जाएं"}
            </button>
          </div>
        ) : (
          <>
            {/* REGISTER */}
            {activeTab === "register" && (
              <>
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setRole("worker")}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                      role === "worker"
                        ? "border-orange-400 bg-orange-50 shadow-lg"
                        : "border-gray-300 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    <Briefcase className="mx-auto mb-2 text-orange-600" size={24} />
                    <div className="text-base font-semibold text-gray-800">{t.worker}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.findWork}</div>
                  </button>

                  <button
                    onClick={() => setRole("customer")}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                      role === "customer"
                        ? "border-emerald-400 bg-emerald-50 shadow-lg"
                        : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    <Home className="mx-auto mb-2 text-emerald-600" size={24} />
                    <div className="text-base font-semibold text-gray-800">{t.customer}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.hireWorkers}</div>
                  </button>
                </div>

                {role ? (
                  <>
                    <div className="animate-in fade-in duration-300">
                      <SignupLogic role={role} />
                      
                      {/* OR Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">
                            {lang === 'en' ? "or continue with" : "या जारी रखें"}
                          </span>
                        </div>
                      </div>

                      {/* Phone Option */}
                      <button
                        onClick={() => setShowPhoneLogin(true)}
                        className="w-full flex items-center justify-center gap-3 rounded-xl py-4 border-2 border-gray-300 bg-white text-gray-800 font-semibold hover:border-emerald-400 hover:bg-emerald-50 transition animate-in fade-in"
                      >
                        <Phone size={20} className="text-emerald-600" />
                        {t.continueWithPhone}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    {lang === 'en' ? "Select your role to continue" : "जारी रखने के लिए अपनी भूमिका चुनें"}
                  </p>
                )}
              </>
            )}

            {/* LOGIN */}
            {activeTab === "login" && (
              <>
                <div className="animate-in fade-in duration-300">
                  <LoginLogic />
                  
                  {/* OR Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        {lang === 'en' ? "or continue with" : "या जारी रखें"}
                      </span>
                    </div>
                  </div>

                  {/* Phone Option */}
                  <button
                    onClick={() => setShowPhoneLogin(true)}
                    className="w-full flex items-center justify-center gap-3 rounded-xl py-4 border-2 border-gray-300 bg-white text-gray-800 font-semibold hover:border-emerald-400 hover:bg-emerald-50 transition"
                  >
                    <Phone size={20} className="text-emerald-600" />
                    {t.continueWithPhone}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}