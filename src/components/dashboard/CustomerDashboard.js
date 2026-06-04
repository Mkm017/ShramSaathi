"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Loader2, 
  IndianRupee, 
  Sparkles, 
  Plus, 
  Clock, 
  MapPin, 
  Briefcase, 
  CheckCircle,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Globe,
  Mic,
  QrCode,
  Eye,
  MessageSquare,
  Star,
  Check
} from "lucide-react";
import JobPost from "@/components/job/JobPost";
import JobQRGenerator from "@/components/job/JobQRGenerator";
import { useStore } from "@/lib/store";

export default function CustomerDashboard({ user }) {
  const { t, lang, toggleLang } = useStore();
  const [activeTab, setActiveTab] = useState("create");
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showHappyCode, setShowHappyCode] = useState(false);
  const [happyCode, setHappyCode] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalSpent: 0,
    completedJobs: 0,
    favoriteWorkers: 0
  });

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const readPageTitle = () => {
    const title = `${t.welcomeBack}, ${user?.name?.split(" ")[0] || t.customer}! ${t.tagline}`;
    speakText(title);
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchJobs = async () => {
      try {
        const q = query(
          collection(db, "jobs"),
          where("customerId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const jobsData = snap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || new Date()
        }));
        
        setJobs(jobsData);
        
        // Calculate stats
        const totalJobs = jobsData.length;
        const activeJobs = jobsData.filter(j => j.status === "open" || j.status === "in-progress").length;
        const completedJobs = jobsData.filter(j => j.status === "completed").length;
        const totalSpent = jobsData
          .filter(j => j.status === "completed")
          .reduce((sum, j) => sum + (j.price || 0), 0);
        
        setStats({ 
          totalJobs, 
          activeJobs, 
          totalSpent, 
          completedJobs,
          favoriteWorkers: 3
        });
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [user?.uid]);

  const handleJobCreated = () => {
    setActiveTab("history");
  };

  const generateHappyCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setHappyCode(code);
    setShowHappyCode(true);
    
    // Save happy code to job
    if (selectedJob) {
      updateDoc(doc(db, "jobs", selectedJob.id), {
        happyCode: code,
        happyCodeGeneratedAt: new Date()
      });
    }
  };

  const submitRating = async () => {
    if (!selectedJob || !happyCode || !review) return;
    
    try {
      await updateDoc(doc(db, "jobs", selectedJob.id), {
        rating,
        review,
        ratedAt: new Date(),
        status: "rated"
      });
      
      alert(lang === 'en' 
        ? "Thank you for your feedback! Payment has been released to the worker." 
        : "आपकी प्रतिक्रिया के लिए धन्यवाद! भुगतान कर्मचारी को जारी कर दिया गया है।");
      
      setShowHappyCode(false);
      setSelectedJob(null);
      
      // Refresh jobs
      const q = query(collection(db, "jobs"), where("customerId", "==", user.uid));
      const snap = await getDocs(q);
      setJobs(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })));
      
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(lang === 'en' ? "Failed to submit rating" : "रेटिंग जमा करने में विफल");
    }
  };

  return (
    <div className="space-y-8">
      {/* Happy Code Modal */}
      {showHappyCode && selectedJob && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {lang === 'en' ? "🎉 Happy Code Generated!" : "🎉 हैप्पी कोड जनरेट किया गया!"}
              </h3>
              <button onClick={() => setShowHappyCode(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-emerald-900 mb-4">{happyCode}</div>
              <p className="text-gray-600 mb-4">
                {lang === 'en' 
                  ? "Give this 4-digit code to the worker to complete payment release"
                  : "भुगतान जारी करने के लिए यह 4-अंकीय कोड कर्मचारी को दें"}
              </p>
              
              {/* Rating Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  {lang === 'en' ? "Rate the worker's service" : "कर्मचारी की सेवा को रेट करें"}
                </h4>
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-3xl"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={lang === 'en' ? "Write your review here..." : "अपनी समीक्षा यहाँ लिखें..."}
                  rows={3}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              
              <button
                onClick={submitRating}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
              >
                {lang === 'en' ? "Submit Rating & Complete" : "रेटिंग जमा करें और पूरा करें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && selectedJob && (
        <JobQRGenerator 
          job={selectedJob} 
          user={user} 
          onClose={() => {
            setShowQR(false);
            setSelectedJob(null);
          }} 
        />
      )}

      {/* HEADER */}
      <div className="pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t.welcomeBack}, {user?.name?.split(" ")[0] || t.customer}! 👋
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
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="text-emerald-700 font-medium">{t.customer}</span>
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCard 
            icon={<Briefcase className="text-blue-600" />} 
            label={t.totalJobs} 
            value={stats.totalJobs}
            trend={"+2"}
            color="blue"
          />
          <StatCard 
            icon={<Clock className="text-orange-600" />} 
            label={t.active} 
            value={stats.activeJobs}
            trend={"Live"}
            color="orange"
          />
          <StatCard 
            icon={<IndianRupee className="text-emerald-600" />} 
            label={t.totalSpent} 
            value={`₹${stats.totalSpent}`}
            trend={"+12%"}
            color="emerald"
          />
          <StatCard 
            icon={<Users className="text-purple-600" />} 
            label={t.favoriteWorkers} 
            value={stats.favoriteWorkers}
            trend={t.pastHeroes}
            color="purple"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-2">
              <TabButton 
                active={activeTab === "create"} 
                onClick={() => setActiveTab("create")}
                icon={<Plus size={18} />}
              >
                {t.createJob}
              </TabButton>
              <TabButton 
                active={activeTab === "history"} 
                onClick={() => setActiveTab("history")}
                icon={<Briefcase size={18} />}
              >
                {t.myJobs} ({jobs.length})
              </TabButton>
              <TabButton 
                active={activeTab === "workers"} 
                onClick={() => setActiveTab("workers")}
                icon={<Users size={18} />}
              >
                {t.myWorkers}
              </TabButton>
              <TabButton 
                active={activeTab === "analytics"} 
                onClick={() => setActiveTab("analytics")}
                icon={<TrendingUp size={18} />}
              >
                {t.analytics}
              </TabButton>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="font-semibold text-gray-800 mb-4">{t.quickActions}</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition">
                <span className="text-sm font-medium">{t.postQuickJob}</span>
                <Sparkles size={16} className="text-emerald-600" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition">
                <span className="text-sm font-medium">{t.viewPendingPayments}</span>
                <IndianRupee size={16} className="text-orange-600" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition">
                <span className="text-sm font-medium">{t.contactSupport}</span>
                <Users size={16} className="text-blue-600" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="font-semibold text-gray-800 mb-4">{t.recentActivity}</h3>
            <div className="space-y-3">
              <ActivityItem 
                icon={<CheckCircle size={16} className="text-emerald-600" />}
                text="Job #1234 completed successfully"
                time="2 hours ago"
              />
              <ActivityItem 
                icon={<Clock size={16} className="text-orange-600" />}
                text="Worker assigned to Painting job"
                time="Yesterday"
              />
              <ActivityItem 
                icon={<IndianRupee size={16} className="text-blue-600" />}
                text="Payment of ₹1,500 released"
                time="2 days ago"
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2">
          {/* CREATE JOB */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t.postNewJob}</h2>
                <p className="text-gray-500 mt-1">{t.describeWork}</p>
              </div>
              <JobPost user={user} onJobCreated={handleJobCreated} />
            </div>
          )}

          {/* MY JOBS */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t.myJobs}</h2>
                    <p className="text-gray-500 mt-1">
                      {lang === 'en' ? "Track all your posted jobs" : "अपने सभी पोस्ट किए गए काम ट्रैक करें"}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium w-fit">
                    <Filter size={16} />
                    {lang === 'en' ? "Filter" : "फ़िल्टर"}
                  </button>
                </div>

                {jobsLoading ? (
                  <div className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto text-emerald-600" size={32} />
                    <p className="text-gray-500 mt-2">{t.loading}</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <Briefcase className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-500">{t.noJobsYet}</p>
                    <button 
                      onClick={() => setActiveTab("create")}
                      className="mt-3 text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      {t.createFirstJob}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onViewQR={() => {
                          setSelectedJob(job);
                          setShowQR(true);
                        }}
                        onGenerateHappyCode={() => {
                          setSelectedJob(job);
                          generateHappyCode();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY WORKERS */}
          {activeTab === "workers" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.myTrustedWorkers}</h2>
              <div className="text-center py-10 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl">
                <Users className="mx-auto text-emerald-400 mb-3" size={48} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">&quot;{t.pastHeroes}&quot;</h3>
                <p className="text-gray-600 mb-4">
                  {t.rehireTrusted}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <WorkerAvatar name="Raj Kumar" rating={4.8} skill="Painter" />
                  <WorkerAvatar name="Suresh Patel" rating={4.9} skill="Plumber" />
                  <WorkerAvatar name="Amit Singh" rating={4.7} skill="Electrician" />
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {lang === 'en' ? "Dashboard Analytics" : "डैशबोर्ड विश्लेषण"}
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-2xl border">
                  <h3 className="font-semibold text-emerald-800 mb-2">{t.costSavings}</h3>
                  <p className="text-3xl font-bold text-emerald-900">₹2,400</p>
                  <p className="text-sm text-emerald-700 mt-2">{t.savedThroughAi}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border">
                  <h3 className="font-semibold text-orange-800 mb-2">{t.averageRating}</h3>
                  <p className="text-3xl font-bold text-orange-900">4.8</p>
                  <p className="text-sm text-orange-700 mt-2">{t.fromWorkerFeedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800"
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-80 mt-1">{label}</div>
        </div>
        <div className="relative">
          {icon}
          {trend && (
            <span className="absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-white">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left font-medium transition ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? "bg-emerald-100" : "bg-gray-100"}`}>
        {icon}
      </div>
      {children}
    </button>
  );
}

function ActivityItem({ icon, text, time }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
      <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function WorkerAvatar({ name, rating, skill }) {
  return (
    <div className="text-center p-4 rounded-xl border hover:border-emerald-300 hover:shadow-md transition cursor-pointer">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl mb-3">
        {name.charAt(0)}
      </div>
      <div className="font-semibold text-gray-800">{name}</div>
      <div className="text-xs text-gray-500 mt-1">{skill}</div>
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="text-xs font-bold text-gray-700">{rating}</span>
        <span className="text-yellow-500">★</span>
      </div>
    </div>
  );
}

function JobCard({ job, onViewQR, onGenerateHappyCode }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'in-progress': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
      case 'completed': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'payment-pending': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const statusStyle = getStatusColor(job.status);

  const getStatusText = (status) => {
    switch(status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'payment-pending': return 'Payment Pending';
      default: return status;
    }
  };

  return (
    <div className={`p-5 rounded-xl border ${statusStyle.border} ${statusStyle.bg} hover:shadow-md transition`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{job.title || "Untitled Job"}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">₹{job.price}</div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyle.text} ${statusStyle.bg}`}>
                {getStatusText(job.status)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm mt-4 pt-4 border-t border-white/50">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-gray-600">{job.location || "Location not set"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-500" />
              <span className="text-gray-600">
                {job.createdAt?.toLocaleDateString?.() || "Recently"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          {job.status === 'open' && (
            <button
              onClick={onViewQR}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <QrCode size={16} />
              Show QR Code
            </button>
          )}
          
          {job.status === 'completed' && !job.rated && (
            <button
              onClick={onGenerateHappyCode}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <Star size={16} />
              Generate Happy Code
            </button>
          )}
          
          {job.status === 'in-progress' && (
            <button
              onClick={onViewQR}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Eye size={16} />
              View Progress
            </button>
          )}
          
          {job.rated && (
            <div className="text-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Check size={16} className="inline mr-1" />
              Rated {job.rating}/5
            </div>
          )}
        </div>
      </div>
      
      {job.applicationsCount > 0 && (
        <div className="mt-3 pt-3 border-t border-white/50 text-sm font-medium text-blue-700">
          {job.applicationsCount} applications received
        </div>
      )}
    </div>
  );
}