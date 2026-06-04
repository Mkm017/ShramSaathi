"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QrCode, Loader2, Camera, CheckCircle, X, IndianRupee, Clock } from "lucide-react";

export default function JobQRGenerator({ job, user, onClose }) {
  const [qrType, setQrType] = useState("start"); // 'start' or 'complete'
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState(job);

  useEffect(() => {
    // Generate QR code value
    const generateQRValue = () => {
      const data = {
        jobId: job.id,
        customerId: user.uid,
        type: qrType,
        timestamp: Date.now(),
        amount: job.price
      };
      return JSON.stringify(data);
    };

    setQrValue(generateQRValue());
    
    // Refresh job data
    const refreshJob = async () => {
      const jobRef = doc(db, "jobs", job.id);
      const snap = await getDoc(jobRef);
      if (snap.exists()) {
        setJobData(snap.data());
      }
    };
    
    refreshJob();
  }, [job.id, user.uid, qrType, job.price]);

  const handleStartJob = async () => {
    if (!confirm("Confirm payment of ₹" + job.price + " to start the job?")) return;
    
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        status: "in-progress",
        paymentStatus: "escrow",
        workerId: jobData.applications?.[0]?.workerId || null,
        startedAt: new Date()
      });
      
      alert("Payment secured in escrow! Show QR to worker to start.");
    } catch (error) {
      console.error("Error starting job:", error);
      alert("Failed to start job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        status: "completed",
        paymentStatus: "pending-release",
        completedAt: new Date()
      });
      
      alert("Job marked as complete! Generate Happy Code to release payment.");
    } catch (error) {
      console.error("Error completing job:", error);
      alert("Failed to complete job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-in zoom-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {qrType === 'start' ? 'Start Job QR' : 'Complete Job QR'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {/* Job Info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Job:</span>
            <span className="font-semibold">{job.title || "Untitled Job"}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-emerald-700 flex items-center">
              <IndianRupee size={16} /> {job.price}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              jobData.status === 'open' ? 'bg-blue-100 text-blue-700' :
              jobData.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {jobData.status}
            </span>
          </div>
        </div>
        
        {/* QR Code Display */}
        <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="w-48 h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <QrCode size={80} className="text-white" />
            </div>
            <p className="text-sm text-gray-600">
              {qrType === 'start' 
                ? "Worker scans this to start work timer" 
                : "Worker scans this to complete work and release payment"}
            </p>
          </div>
        </div>
        
        {/* QR Type Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setQrType("start")}
            className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${
              qrType === "start" 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                : "border-gray-300 text-gray-600"
            }`}
          >
            <Camera size={18} />
            Start QR
          </button>
          <button
            onClick={() => setQrType("complete")}
            className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${
              qrType === "complete" 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                : "border-gray-300 text-gray-600"
            }`}
          >
            <CheckCircle size={18} />
            Complete QR
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {qrType === 'start' && jobData.status === 'open' && (
            <button
              onClick={handleStartJob}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Secure Payment & Enable QR'}
            </button>
          )}
          
          {qrType === 'complete' && jobData.status === 'in-progress' && (
            <button
              onClick={handleCompleteJob}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Mark as Complete'}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}