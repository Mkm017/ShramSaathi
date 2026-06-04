"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { 
  Loader2, 
  Mic, 
  MicOff, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Navigation, 
  Brain,
  ArrowRight,
  User,
  Shield,
  Star,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { extractWorkerSkills } from "@/lib/gemini";

/* ================== MAIN ================== */

export default function Onboarding() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("No user found, redirecting to login");
          return router.replace("/auth/login");
        }

        console.log("Current user UID:", user.uid);
        
        const userRef = doc(db, "users", user.uid);
        console.log("Fetching user document...");
        
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
          console.log("User document doesn't exist");
          setAuthError("User profile not found. Please sign up again.");
          return;
        }

        const data = snap.data();
        console.log("User data fetched:", data);

        if (data.onboardingCompleted) {
          console.log("Onboarding already completed, redirecting...");
          router.replace(
            data.role === "worker"
              ? "/dashboard/worker"
              : "/dashboard/customer"
          );
          return;
        }

        setUserData({ uid: user.uid, ...data });
        setAuthError("");
      } catch (error) {
        console.error("Error in onboarding:", error);
        setAuthError(`Firebase Error: ${error.message}. Please refresh the page or contact support.`);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="animate-pulse">
          <Image src="/logo/s1.png" alt="ShramSaathi" width={200} height={64} />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600 h-8 w-8" />
          <p className="text-emerald-700 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="inline h-4 w-4 mr-2" />
              Refresh Page
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full py-3 bg-gray-100 text-gray-800 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Progress Steps Indicator */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo/s1.png" alt="ShramSaathi" width={180} height={56} />
          </div>
          
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to ShramSaathi! 👷
            </h1>
            <p className="text-gray-600">
              Let&apos;s set up your {userData?.role === "worker" ? "worker" : "customer"} profile
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 sm:p-8 border border-emerald-100">
          {userData?.role === "customer" ? (
            <CustomerOnboarding userData={userData} />
          ) : (
            <WorkerOnboarding userData={userData} />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a href="mailto:support@shramsaathi.com" className="text-emerald-600 font-medium">
              support@shramsaathi.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================== CUSTOMER ================== */

function CustomerOnboarding({ userData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finish = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Updating user document for:", userData.uid);
      await updateDoc(doc(db, "users", userData.uid), {
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      });
      console.log("Update successful, redirecting...");
      router.replace("/dashboard/customer");
    } catch (error) {
      console.error("Error updating user:", error);
      setError(`Failed to save: ${error.message}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <User className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Welcome, {userData.name}! 👋
        </h2>
        <p className="text-gray-600 mb-6">
          Your customer account is ready. Start finding skilled workers for your needs.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Verified Workers</p>
            <p className="text-sm text-gray-600">Access to background-checked professionals</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Secure Payments</p>
            <p className="text-sm text-gray-600">Protected transactions with satisfaction guarantee</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">AI Job Matching</p>
            <p className="text-sm text-gray-600">Smart recommendations for your requirements</p>
          </div>
        </div>
      </div>

      <button
        onClick={finish}
        disabled={loading}
        className="w-full rounded-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            Enter Dashboard
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </>
  );
}

/* ================== WORKER ================== */

function WorkerOnboarding({ userData }) {
  const router = useRouter();

  /* 🔑 LOCAL STEP (CRITICAL FIX) */
  const [localStep, setLocalStep] = useState(userData.onboardingStep || 1);

  const [phone, setPhone] = useState(userData.phone || "");
  const [location, setLocation] = useState(userData.location || null);
  const [radius, setRadius] = useState(userData.travelRadiusKm || 10);

  const [skillsText, setSkillsText] = useState("");
  const [parsedSkills, setParsedSkills] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  /* ---- GPS ---- */
  useEffect(() => {
    if (location) return;

    const getLocation = () => {
      if (!navigator.geolocation) {
        setError("Location not supported by browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setError("Location permission required for job matching");
          setLocation({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
        }
      );
    };

    getLocation();
  }, [location]);

  /* ---- STEP 1 ---- */
  const saveStep1 = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    if (!location) {
      setError("Please allow location access for better job matches");
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log("Step 1 - Updating user:", userData.uid);
      await updateDoc(doc(db, "users", userData.uid), {
        phone,
        location,
        onboardingStep: 2,
        updatedAt: new Date().toISOString(),
      });
      setLocalStep(2);
      console.log("Step 1 saved successfully");
    } catch (err) {
      console.error("Step 1 error:", err);
      setError(`Failed to save: ${err.message}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  /* ---- STEP 2 ---- */
  const saveStep2 = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Step 2 - Updating travel radius:", radius);
      await updateDoc(doc(db, "users", userData.uid), {
        travelRadiusKm: radius,
        onboardingStep: 3,
        updatedAt: new Date().toISOString(),
      });
      setLocalStep(3);
      console.log("Step 2 saved successfully");
    } catch (err) {
      console.error("Step 2 error:", err);
      setError(`Failed to save: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  /* ---- VOICE INPUT ---- */
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Voice input not supported in this browser. Please type instead.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    setError("");

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSkillsText((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError("Voice recognition failed. Please type instead.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      setError("Cannot start voice recognition. Please check microphone permissions.");
      setIsListening(false);
    }
  };

  /* ---- STEP 3 ---- */
  const runGemini = async () => {
    if (!skillsText.trim()) {
      setError("Please describe your skills first");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const data = await extractWorkerSkills(skillsText);
      setParsedSkills(data);
      
      if (data.error) {
        setError(`AI had some trouble understanding. We've created a basic profile for you.`);
      }
    } catch (err) {
      console.error("Error in runGemini:", err);
      setError("AI service temporary unavailable. We've created a basic profile for you.");
      
      setParsedSkills({
        categories: ["General Worker"],
        experienceYears: 1,
        tags: ["General Skills", "Manual Work"],
        confidence: 0.1
      });
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Final step - Completing onboarding");
      
      // Create a clean skills object without circular references
      const cleanSkills = parsedSkills ? {
        categories: parsedSkills.categories || [],
        experienceYears: parsedSkills.experienceYears || 1,
        tags: parsedSkills.tags || [],
        confidence: parsedSkills.confidence || 0.1,
      } : {
        categories: ["General Worker"],
        experienceYears: 1,
        tags: ["General Skills"],
        confidence: 0.1
      };
      
      await updateDoc(doc(db, "users", userData.uid), {
        skillsTextRaw: skillsText,
        skills: cleanSkills,
        tier: "bronze",
        workerId: `SS-WKR-${Date.now().toString().slice(-6)}`,
        onboardingCompleted: true,
        onboardingStep: 4,
        updatedAt: new Date().toISOString(),
      });
      
      console.log("Onboarding completed successfully");
      router.replace("/dashboard/worker");
    } catch (err) {
      console.error("Finish onboarding error:", err);
      setError(`Failed to save profile: ${err.message}. Please try again or contact support.`);
      setLoading(false);
    }
  };

  /* ================== UI ================== */

  /* ---- PROGRESS INDICATOR ---- */
  const ProgressSteps = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex flex-col items-center ${step < localStep ? "opacity-100" : "opacity-50"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                step === localStep
                  ? "bg-orange-500 text-white ring-4 ring-orange-100"
                  : step < localStep
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step}
            </div>
            <span className="text-xs font-medium">
              {step === 1 ? "Contact" : step === 2 ? "Radius" : "Skills"}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-gray-200 rounded-full">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${((localStep - 1) / 2) * 100}%` }}
        />
      </div>
    </div>
  );

  /* ---- STEP 2 ---- */
  if (localStep === 2) {
    return (
      <>
        <ProgressSteps />
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-4">
            <Navigation className="h-7 w-7 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Service Area</h2>
          <p className="text-gray-600">
            How far are you willing to travel for work?
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-6 border border-orange-100">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {radius} km
            </div>
            <p className="text-sm text-gray-600">
              {radius <= 10 
                ? "Local area service" 
                : radius <= 25 
                ? "City-wide service" 
                : "Regional service"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Nearby (5km)</span>
              <span className="text-gray-600">City (25km)</span>
              <span className="text-gray-600">Region (50km)</span>
            </div>
            
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-orange-300 to-orange-500 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-lg"
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>15</span>
              <span>25</span>
              <span>35</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <button
          onClick={saveStep2}
          disabled={loading}
          className="w-full rounded-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue to Skills
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </>
    );
  }

  /* ---- STEP 3 (VOICE) ---- */
  if (localStep === 3) {
    return (
      <>
        <ProgressSteps />
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
            <Brain className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Describe Your Skills</h2>
          <p className="text-gray-600 mb-1">
            Our AI will analyze your skills to match you with perfect jobs
          </p>
          <p className="text-sm text-gray-500">
            You can speak in Hindi or English
          </p>
        </div>

        {/* Skill Input Area */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <textarea
              rows={4}
              value={skillsText}
              onChange={(e) => {
                setSkillsText(e.target.value);
                setError("");
              }}
              placeholder="Example: Main painter hoon, 5 saal ka experience hai. Main wall painting, interior design, aur color mixing karta hoon. Main ghar aur office dono ke liye kaam karta hoon."
              className="w-full rounded-2xl px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {skillsText.length}/500
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startListening}
              disabled={isListening || loading}
              className={`flex-1 rounded-xl py-3 font-medium transition-all ${
                isListening
                  ? "bg-red-100 text-red-700 border-2 border-red-300"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              } ${(isListening || loading) ? "cursor-not-allowed" : "hover:scale-[1.02]"}`}
            >
              <div className="flex items-center justify-center gap-2">
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5 animate-pulse" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Speak in Hindi
                  </>
                )}
              </div>
            </button>

            <button
              onClick={runGemini}
              disabled={loading || !skillsText.trim()}
              className={`flex-1 rounded-xl py-3 font-medium transition-all ${
                loading || !skillsText.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02]"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    AI Analysis
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Note</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Results */}
        {parsedSkills && (
          <>
            <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">AI Profile Analysis</h3>
                {parsedSkills.confidence && (
                  <span className="ml-auto text-sm font-medium px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    {(parsedSkills.confidence * 100).toFixed(0)}% match
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Primary Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedSkills.categories?.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 font-medium rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Experience</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                        style={{ width: `${Math.min((parsedSkills.experienceYears || 1) * 10, 100)}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {parsedSkills.experienceYears || 1} year{parsedSkills.experienceYears !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedSkills.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={finishOnboarding}
              disabled={loading}
              className="w-full rounded-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Complete Profile & Start Earning
                </>
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              You can update these details later from your profile settings
            </p>
          </>
        )}
      </>
    );
  }

  /* ---- STEP 1 ---- */
  return (
    <>
      <ProgressSteps />
      
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
          <User className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Welcome, {userData.name}! 👋
        </h2>
        <p className="text-gray-600">
          Let&apos;s complete your profile to start finding work
        </p>
      </div>

      {/* Contact Form */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Mobile Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setError("");
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full rounded-xl px-4 py-3 pl-12 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              +91
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Used for job notifications and client communication
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Your Location
          </label>
          <div className={`rounded-xl p-4 border ${location ? 'border-emerald-200 bg-emerald-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <MapPin className={`h-5 w-5 ${location ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div>
                <p className={`font-medium ${location ? 'text-emerald-800' : 'text-gray-600'}`}>
                  {location ? "📍 Location detected" : "Detecting your location..."}
                </p>
                <p className="text-xs text-gray-500">
                  {location 
                    ? "We'll show you jobs near your area" 
                    : "Allow location access for better job matches"}
                </p>
              </div>
              {!location && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={saveStep1}
        disabled={loading}
        className="w-full rounded-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Step 1 of 3: Contact Information
      </p>
    </>
  );
}