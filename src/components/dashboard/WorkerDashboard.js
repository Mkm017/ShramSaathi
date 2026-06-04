"use client";

import {
  Briefcase,
  ShieldCheck,
  MapPin,
  Wallet,
  Clock,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  Bell,
  Zap,
  Users,
  Award,
  Target,
  Calendar,
  Star,
  CheckCircle,
  Mic,
  QrCode,
  Camera,
  MessageSquare,
  Settings,
  Globe,
  Loader2,
  AlertCircle,
  IndianRupee
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import WorkerJobFeed from "@/components/job/WorkerJobFeed";
import WorkerJobProgress from "@/components/job/WorkerJobProgress";
import FloatingVoiceBtn from "@/components/shared/FloatingVoiceBtn";
import { useStore } from "@/lib/store";

export default function WorkerDashboard({ user }) {
  const { t, lang, toggleLang } = useStore();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    pendingJobs: 0,
    rating: 4.5,
    totalHours: 120,
    successRate: 98
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [activeVoiceCommand, setActiveVoiceCommand] = useState("");

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const readPageTitle = () => {
    const title = `${t.namaste}, ${user?.name?.split(" ")[0] || t.worker}! ${t.readyForWork} ${t.aiFindingMatches}`;
    speakText(title);
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchWorkerData = async () => {
      try {
        // Fetch all jobs for this worker
        const jobsQuery = query(
          collection(db, "jobs"),
          where("workerId", "==", user.uid)
        );
        
        const snapshot = await getDocs(jobsQuery);
        const jobs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        // Find active job (in-progress)
        const active = jobs.find(j => j.status === "in-progress" || j.status === "awaiting-completion");
        setActiveJob(active);
        
        const completedJobs = jobs.filter(j => j.status === "completed");
        const pendingJobs = jobs.filter(j => j.status === "in-progress");
        const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0);
        
        setStats({
          totalEarnings,
          completedJobs: completedJobs.length,
          pendingJobs: pendingJobs.length,
          rating: 4.5,
          totalHours: 120,
          successRate: 98
        });
        
        setRecentJobs(jobs.slice(0, 3));
      } catch (err) {
        console.error("Error fetching worker data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, [user?.uid]);

  const handleVoiceCommand = (command) => {
    setActiveVoiceCommand(command);
    
    // Process voice commands
    if (command.toLowerCase().includes("start work") || command.toLowerCase().includes("काम शुरू")) {
      setShowQR(true);
    } else if (command.toLowerCase().includes("my jobs") || command.toLowerCase().includes("मेरे काम")) {
      document.getElementById('job-feed')?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.toLowerCase().includes("wallet") || command.toLowerCase().includes("वॉलेट")) {
      alert(lang === 'en' ? "Opening wallet..." : "वॉलेट खोल रहे हैं...");
    }
    
    setTimeout(() => setActiveVoiceCommand(""), 3000);
  };

  const markJobAsStarted = async () => {
    if (!activeJob) return;
    
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", activeJob.id);
      await updateDoc(jobRef, {
        status: "in-progress",
        startedAt: new Date()
      });
      
      setActiveJob({ ...activeJob, status: "in-progress" });
      alert(lang === 'en' ? "Job started successfully!" : "काम सफलतापूर्वक शुरू हो गया!");
    } catch (error) {
      console.error("Error starting job:", error);
      alert(lang === 'en' ? "Failed to start job" : "काम शुरू करने में विफल");
    } finally {
      setLoading(false);
      setShowQR(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* VOICE COMMAND FEEDBACK */}
      {activeVoiceCommand && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <Mic size={16} />
              <span className="font-medium">
                {lang === 'en' ? "Command:" : "आदेश:"} &quot;{activeVoiceCommand}&quot;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{t.startQr}</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <QrCode size={80} className="text-white" />
                </div>
                <p className="text-sm text-gray-600">
                  {lang === 'en' 
                    ? "Customer will show this QR when you arrive" 
                    : "ग्राहक यह QR दिखाएगा जब आप पहुंचेंगे"}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button 
                onClick={markJobAsStarted}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : lang === 'en' ? "Mark as Started" : "शुरू के रूप में चिह्नित करें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t.namaste}, {user?.name?.split(" ")[0] || t.worker}! 🙏
            </h1>
            <p className="text-gray-500 mt-1">
              {t.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
            >
              <Globe size={16} />
              <span className="text-sm font-medium">{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
            <button
              onClick={readPageTitle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
            >
              <Mic size={16} />
              <span className="text-sm font-medium">{t.listen}</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full shadow-sm">
              <span className="text-orange-700 font-medium">
                {t.worker} • {user.tier || t.tier} {t.tier}
              </span>
              <ShieldCheck size={16} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE JOB PROGRESS */}
      {activeJob && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {lang === 'en' ? "Active Job in Progress" : "सक्रिय काम प्रगति पर"}
              </h3>
              <p className="text-sm text-gray-600">
                {lang === 'en' ? "Complete the steps to get paid" : "भुगतान प्राप्त करने के लिए चरण पूरे करें"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                <IndianRupee size={14} /> {activeJob.price}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeJob.status === 'in-progress' 
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {activeJob.status === 'in-progress' 
                  ? (lang === 'en' ? 'In Progress' : 'प्रगति पर') 
                  : (lang === 'en' ? 'Awaiting Completion' : 'पूर्णता की प्रतीक्षा')}
              </span>
            </div>
          </div>
          <WorkerJobProgress job={activeJob} user={user} />
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDEBAR - PROFILE & STATS */}
        <div className="lg:col-span-1 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg border border-orange-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {lang === 'en' ? "Worker ID:" : "कर्मचारी आईडी:"} <span className="font-mono">{user.workerId || "SS-WKR-XXXX"}</span>
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg border shadow-sm">
                <Award className="text-orange-600" size={24} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-emerald-600" />
                <span className="text-gray-700">
                  {t.servingWithin} <strong>{user.travelRadiusKm || 10} {t.km}</strong> {t.kmRadius}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={16} className="text-orange-600" />
                <span className="text-gray-700">
                  {t.experience}: <strong>{user.skills?.experienceYears || 0} {t.years}</strong>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-gray-700">
                  {lang === 'en' ? "Profile:" : "प्रोफाइल:"} <strong>{t.verified}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="bg-white rounded-2xl shadow-lg border p-5">
            <h3 className="font-semibold text-gray-800 mb-4">{t.performanceStats}</h3>
            <div className="space-y-4">
              <StatItem 
                icon={<Wallet className="text-emerald-600" />}
                label={t.totalEarnings}
                value={`₹${stats.totalEarnings}`}
                progress={75}
                color="emerald"
              />
              <StatItem 
                icon={<Briefcase className="text-orange-600" />}
                label={t.jobsCompleted}
                value={stats.completedJobs}
                progress={60}
                color="orange"
              />
              <StatItem 
                icon={<Star className="text-yellow-600" />}
                label={t.successRate}
                value={`${stats.successRate}%`}
                progress={stats.successRate}
                color="yellow"
              />
              <StatItem 
                icon={<Clock className="text-blue-600" />}
                label={t.totalHours}
                value={stats.totalHours}
                progress={85}
                color="blue"
              />
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl shadow-lg border p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-orange-500" />
              {t.quickActions}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                icon={<QrCode size={18} />}
                label={t.startQr}
                color="emerald"
                onClick={() => setShowQR(true)}
              />
              <QuickActionButton
                icon={<Camera size={18} />}
                label={t.uploadWork}
                color="blue"
                onClick={() => alert(lang === 'en' ? "Upload work photo" : "काम फोटो अपलोड करें")}
              />
              <QuickActionButton
                icon={<MessageSquare size={18} />}
                label={t.messages}
                color="purple"
                badge={3}
                onClick={() => alert(lang === 'en' ? "Open messages" : "संदेश खोलें")}
              />
              <QuickActionButton
                icon={<Wallet size={18} />}
                label={t.withdraw}
                color="orange"
                onClick={() => alert(lang === 'en' ? "Open withdrawal" : "निकासी खोलें")}
              />
              <QuickActionButton
                icon={<Calendar size={18} />}
                label={t.schedule}
                color="emerald"
                onClick={() => alert(lang === 'en' ? "Open schedule" : "शेड्यूल खोलें")}
              />
              <QuickActionButton
                icon={<Settings size={18} />}
                label={t.settings}
                color="gray"
                onClick={() => alert(lang === 'en' ? "Open settings" : "सेटिंग्स खोलें")}
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="bg-white rounded-2xl shadow-lg border p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-orange-500" />
              {t.skillsSpecializations}
            </h3>
            {user.skills?.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200 transition cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {t.addSkillsOnboarding}
              </p>
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2 space-y-8">
          {/* WELCOME CARD */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={20} className="text-emerald-300" />
                  <span className="text-sm font-medium text-emerald-300">{t.youreOnline}</span>
                </div>
                <h2 className="text-2xl font-bold leading-tight">
                  {t.readyForWork} {user.name?.split(" ")[0]}?
                </h2>
                <p className="text-emerald-100 opacity-90 mt-2">
                  {t.aiFindingMatches}
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-700/50 border border-emerald-600 text-emerald-100">
                <Bell size={16} />
                <span className="text-sm font-medium">
                  {lang === 'en' ? "Active" : "सक्रिय"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 bg-emerald-800/50 rounded-xl p-4">
                <div className="text-sm text-emerald-300">
                  {lang === 'en' ? "Today's Target" : "आज का लक्ष्य"}
                </div>
                <div className="text-xl font-bold mt-1">₹1,500</div>
              </div>
              <div className="flex-1 bg-emerald-800/50 rounded-xl p-4">
                <div className="text-sm text-emerald-300">
                  {lang === 'en' ? "Weekly Goal" : "साप्ताहिक लक्ष्य"}
                </div>
                <div className="text-xl font-bold mt-1">₹8,000</div>
              </div>
            </div>
          </div>

          {/* JOB FEED */}
          <div id="job-feed" className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.availableJobsNearby}</h2>
                <p className="text-gray-500 mt-1">{t.matchedSkillsLocation}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target size={16} />
                <span>
                  {lang === 'en' ? "Within" : "के भीतर"} {user.travelRadiusKm || 10} {t.km}
                </span>
              </div>
            </div>
            <WorkerJobFeed user={user} />
          </div>

          {/* RECENT JOBS & PERFORMANCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RECENT JOBS */}
            <div className="bg-white rounded-2xl shadow-lg border p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-emerald-600" />
                {t.recentJobs}
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Briefcase className="mx-auto mb-2" size={24} />
                  <p>{lang === 'en' ? "No jobs completed yet" : "अभी तक कोई काम पूरा नहीं हुआ"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map(job => (
                    <div key={job.id} className="p-3 rounded-lg border hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{job.title || lang === 'en' ? "Job" : "काम"}</p>
                          <p className="text-sm text-gray-500 mt-1">₹{job.price}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          job.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PERFORMANCE METRICS */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-orange-600" />
                {t.performanceMetrics}
              </h3>
              <div className="space-y-4">
                <MetricItem 
                  label={t.responseTime}
                  value="12 min"
                  target="< 15 min"
                  status="good"
                />
                <MetricItem 
                  label={t.customerRating}
                  value="4.8/5"
                  target="> 4.5"
                  status="excellent"
                />
                <MetricItem 
                  label={t.onTimeCompletion}
                  value="96%"
                  target="> 95%"
                  status="good"
                />
                <MetricItem 
                  label={t.repeatClients}
                  value="8"
                  target="+5 monthly"
                  status="good"
                />
              </div>
            </div>
          </div>

          {/* SAVINGS JAR */}
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.savingsJar}</h2>
                <p className="text-gray-500 mt-1">{t.financialSecurity}</p>
              </div>
              <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                5% {t.autoSaveActive}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-200">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-emerald-900">₹1,850</div>
                <p className="text-emerald-700 mt-2">{t.totalSavedMonth}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">12</div>
                  <div className="text-xs text-gray-500">{t.months}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">5.2%</div>
                  <div className="text-xs text-gray-500">{t.interestPa}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">₹0</div>
                  <div className="text-xs text-gray-500">{t.penalty}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
                  {t.viewDetails}
                </button>
                <button className="flex-1 py-3 rounded-xl border border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition">
                  {t.addMore}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING VOICE BUTTON */}
      <FloatingVoiceBtn lang={lang} onCommand={handleVoiceCommand} />
    </div>
  );
}

function StatItem({ icon, label, value, progress, color }) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span className="font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, target, status }) {
  const statusIcon = {
    excellent: "🏆",
    good: "✅",
    average: "⚠️",
    poor: "❌"
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500 mt-1">{target}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{statusIcon[status]}</div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, color, onClick, badge }) {
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
  };

  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${colorClasses[color]}`}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}