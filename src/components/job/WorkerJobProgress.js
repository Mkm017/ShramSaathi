"use client";

import { useState, useRef } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Camera, Upload, QrCode, CheckCircle, Clock, IndianRupee, AlertCircle } from "lucide-react";

export default function WorkerJobProgress({ job, user }) {
  const [step, setStep] = useState(1); // 1: Start, 2: Before Photo, 3: Work, 4: After Photo, 5: Complete
  const [loading, setLoading] = useState(false);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (setImage) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const markJobStarted = async () => {
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        status: "in-progress",
        startedAt: new Date(),
        workerStarted: true
      });
      setStep(2);
      alert("Job started! Timer is running.");
    } catch (error) {
      console.error("Error starting job:", error);
      alert("Failed to start job");
    } finally {
      setLoading(false);
    }
  };

  const uploadBeforePhoto = async () => {
    if (!beforeImage) {
      alert("Please upload a before photo");
      return;
    }
    
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        beforePhoto: beforeImage,
        beforePhotoTime: new Date()
      });
      setStep(3);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const uploadAfterPhoto = async () => {
    if (!afterImage) {
      alert("Please upload an after photo");
      return;
    }
    
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        afterPhoto: afterImage,
        afterPhotoTime: new Date(),
        status: "awaiting-completion"
      });
      setStep(5);
      alert("Work completed! Ask customer for completion QR scan.");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const scanCompletionQR = () => {
    setShowQRScanner(true);
    // In real app, this would open camera for QR scanning
    // For demo, simulate scanning
    setTimeout(() => {
      setShowQRScanner(false);
      completeJob();
    }, 2000);
  };

  const completeJob = async () => {
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        status: "completed",
        completedAt: new Date(),
        paymentStatus: "pending-release"
      });
      alert("Job completed successfully! Payment will be released after customer verification.");
    } catch (error) {
      console.error("Error completing job:", error);
      alert("Failed to complete job");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Start Job", icon: <QrCode /> },
    { number: 2, title: "Before Photo", icon: <Camera /> },
    { number: 3, title: "Do Work", icon: <Clock /> },
    { number: 4, title: "After Photo", icon: <Camera /> },
    { number: 5, title: "Complete", icon: <CheckCircle /> }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 relative">
        {steps.map((s, index) => (
          <div key={s.number} className="flex flex-col items-center z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= s.number 
                ? 'bg-emerald-600 border-emerald-600 text-white' 
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {s.icon}
            </div>
            <div className="text-xs mt-2 font-medium">{s.title}</div>
          </div>
        ))}
        <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-10">
          <div 
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Start Job */}
        {step === 1 && (
          <div className="text-center">
            <QrCode className="mx-auto text-emerald-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Scan Start QR</h3>
            <p className="text-gray-600 mb-6">
              Ask customer to show the start QR code. Scanning will begin the work timer.
            </p>
            <button
              onClick={markJobStarted}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              {loading ? "Starting..." : "I've Scanned the QR - Start Job"}
            </button>
          </div>
        )}

        {/* Step 2: Before Photo */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Before Work Photo</h3>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload(setBeforeImage)}
                  accept="image/*"
                  className="hidden"
                />
                {beforeImage ? (
                  <img src={beforeImage} alt="Before work" className="rounded-xl max-h-60 mx-auto" />
                ) : (
                  <>
                    <Camera className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-500">Tap to take/upload photo</p>
                    <p className="text-sm text-gray-400 mt-1">Show the work area before starting</p>
                  </>
                )}
              </div>
              <button
                onClick={uploadBeforePhoto}
                disabled={!beforeImage || loading}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload & Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Work in Progress */}
        {step === 3 && (
          <div className="text-center">
            <Clock className="mx-auto text-orange-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Work in Progress</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
              <div className="text-3xl font-bold text-orange-800 mb-2">45:23</div>
              <div className="text-sm text-orange-600">Time elapsed</div>
            </div>
            <p className="text-gray-600 mb-6">
              Complete the work. Take photos if needed for documentation.
            </p>
            <button
              onClick={() => setStep(4)}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
            >
              Work Complete - Upload After Photo
            </button>
          </div>
        )}

        {/* Step 4: After Photo */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload After Work Photo</h3>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload(setAfterImage)}
                  accept="image/*"
                  className="hidden"
                />
                {afterImage ? (
                  <img src={afterImage} alt="After work" className="rounded-xl max-h-60 mx-auto" />
                ) : (
                  <>
                    <Camera className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-500">Tap to take/upload photo</p>
                    <p className="text-sm text-gray-400 mt-1">Show completed work</p>
                  </>
                )}
              </div>
              <button
                onClick={uploadAfterPhoto}
                disabled={!afterImage || loading}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload & Request Completion"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="text-center">
            <CheckCircle className="mx-auto text-emerald-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Payment Release</h3>
            <p className="text-gray-600 mb-6">
              Ask customer to show completion QR code to release payment from escrow.
            </p>
            
            {/* Payment Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Job Payment:</span>
                <span className="text-xl font-bold text-emerald-800 flex items-center">
                  <IndianRupee size={18} /> {job.price}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Your Earnings:</span>
                <span className="text-gray-700">₹{Math.round(job.price * 0.9)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Savings (5%):</span>
                <span className="text-emerald-700">₹{Math.round(job.price * 0.05)}</span>
              </div>
            </div>

            <button
              onClick={scanCompletionQR}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              {showQRScanner ? "Scanning QR..." : "Scan Customer's Completion QR"}
            </button>
            
            {showQRScanner && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertCircle size={18} />
                  <span className="text-sm">Point camera at customer&apos;s QR code</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}