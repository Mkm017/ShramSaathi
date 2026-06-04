"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  Star, 
  CheckCircle,
  Loader2,
  Navigation,
  AlertCircle
} from "lucide-react";
import { useStore } from "@/lib/store";

export default function WorkerJobFeed({ user }) {
  const { t, lang } = useStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState("");

  // Only radius filter, removed min/max price
  const [radius, setRadius] = useState(user?.travelRadiusKm || 10);

  useEffect(() => {
    fetchJobs();
  }, [radius]);

  const fetchJobs = async () => {
    if (!user?.location) {
      setError(lang === 'en' 
        ? "Location not available. Please update your profile." 
        : "स्थान उपलब्ध नहीं है। कृपया अपनी प्रोफाइल अपडेट करें।");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "jobs"),
        where("status", "==", "open")
      );
      
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        distance: calculateDistance(
          user.location.lat,
          user.location.lng,
          doc.data().location?.lat || user.location.lat,
          doc.data().location?.lng || user.location.lng
        )
      }));

      // Filter by distance only (removed price filters)
      const filteredJobs = jobsData.filter(job => job.distance <= radius);

      // Sort by distance and price
      filteredJobs.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return b.price - a.price; // Higher price first
      });

      setJobs(filteredJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(lang === 'en' 
        ? "Failed to load jobs. Please try again." 
        : "काम लोड करने में विफल। कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const applyForJob = async (jobId) => {
    setApplyingId(jobId);
    setError("");

    try {
      await addDoc(collection(db, "applications"), {
        jobId,
        workerId: user.uid,
        workerName: user.name,
        workerSkills: user.skills?.tags || [],
        workerRating: 4.5,
        appliedAt: serverTimestamp(),
        status: "pending"
      });

      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        applicationsCount: (jobs.find(j => j.id === jobId)?.applicationsCount || 0) + 1
      });

      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, hasApplied: true, applicationsCount: (job.applicationsCount || 0) + 1 }
          : job
      ));

      alert(lang === 'en' 
        ? "Application submitted successfully!" 
        : "आवेदन सफलतापूर्वक जमा किया गया!");
    } catch (err) {
      console.error("Application failed:", err);
      setError(lang === 'en' 
        ? "Failed to apply. Please try again." 
        : "आवेदन करने में विफल। कृपया पुनः प्रयास करें।");
    } finally {
      setApplyingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Filters - Simplified (only radius) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.searchRadius}: {radius} {t.km}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <button
          onClick={fetchJobs}
          className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
        >
          {t.applyFilters}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <Loader2 className="animate-spin mx-auto text-emerald-600" size={32} />
          <p className="text-gray-500 mt-2">{t.findingJobs}</p>
        </div>
      )}

      {/* No Jobs State */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border">
          <div className="text-gray-400 mb-3">📭</div>
          <p className="text-sm text-gray-500">{t.noJobsArea}</p>
          <p className="text-xs text-gray-400 mt-1">{t.increaseRadius}</p>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map(job => (
          <div 
            key={job.id} 
            className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition"
          >
            <div className="p-5">
              {/* Job Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {job.title || job.description?.slice(0, 50)}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <MapPin size={14} /> {job.distance?.toFixed(1)} {t.kmAway}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{job.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.aiRange}: ₹{job.aiEstimate?.min}-₹{job.aiEstimate?.max}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              {/* Job Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{job.deadline || t.flexibleDeadline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star size={14} className="text-yellow-500" />
                  <span>4.5 • 12 {lang === 'en' ? 'reviews' : 'समीक्षाएं'}</span>
                </div>
              </div>

              {/* Applications Info */}
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-500">
                  {job.applicationsCount || 0} {t.applications}
                </span>
                {job.hasApplied && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle size={14} /> {lang === 'en' ? 'Applied' : 'आवेदन किया'}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => applyForJob(job.id)}
                disabled={applyingId === job.id || job.hasApplied}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
                  job.hasApplied
                    ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {applyingId === job.id ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : job.hasApplied ? (
                  <>
                    <CheckCircle size={18} /> {lang === 'en' ? 'Applied' : 'आवेदन किया'}
                  </>
                ) : (
                  <>
                    <IndianRupee size={18} /> {t.applyNow}
                  </>
                )}
              </button>
            </div>

            {/* Quick Match Indicator */}
            {job.distance <= 5 && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-t px-5 py-2 text-center">
                <span className="text-xs font-medium text-emerald-700">
                  ⚡ {t.quickMatch} {job.distance.toFixed(1)} {t.km}!
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {jobs.length > 0 && (
        <button
          onClick={fetchJobs}
          className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          {t.loadMoreJobs}
        </button>
      )}
    </div>
  );
}