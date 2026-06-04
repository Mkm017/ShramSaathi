"use client";

import { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { estimateJobPrice } from "@/lib/gemini";
import { 
  Upload, 
  Sparkles, 
  MapPin, 
  Calendar,
  IndianRupee,
  X,
  Loader2,
  Camera,
  AlertCircle,
  Info,
  Shield,
  CheckCircle
} from "lucide-react";

export default function JobPost({ user, onJobCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Job Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  
  // Media
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // AI Estimation
  const [aiEstimate, setAiEstimate] = useState(null);
  const [finalPrice, setFinalPrice] = useState("");
  const [negotiating, setNegotiating] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        setTimeout(() => setError(""), 3000);
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAiEstimate = async () => {
    if (!description.trim()) {
      setError("Please describe the work first");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      let imageUrl = null;
      if (imageFile && storage) {
        try {
          const storageRef = ref(storage, `job-images/${Date.now()}-${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(storageRef);
        } catch (storageError) {
          console.warn("Image upload failed, continuing without image:", storageError);
          // Continue without image - AI can still work with description
        }
      }

      const estimate = await estimateJobPrice(imageUrl, description);
      setAiEstimate(estimate);
      setFinalPrice(estimate.max.toString()); // Anchor pricing
      setStep(2);
      setSuccess("AI price estimate generated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("AI estimation failed:", err);
      setError("AI estimation failed. Please try again or continue with manual pricing.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const postJob = async () => {
    if (!finalPrice) {
      setError("Please set a price");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = null;
      if (imageFile && storage) {
        try {
          const storageRef = ref(storage, `job-images/${Date.now()}-${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(storageRef);
        } catch (storageError) {
          console.warn("Image upload failed:", storageError);
        }
      }

      const jobData = {
        customerId: user.uid,
        customerName: user.name,
        title: title || description.slice(0, 50) + "...",
        description,
        deadline: deadline || null,
        location: location || user.location || null,
        media: imageUrl ? [imageUrl] : [],
        price: Number(finalPrice),
        aiEstimate: aiEstimate || {
          min: Math.round(Number(finalPrice) * 0.7),
          max: Math.round(Number(finalPrice) * 1.3),
          confidence: 0.5,
          breakdown: {
            labor: Math.round(Number(finalPrice) * 0.6),
            material: Math.round(Number(finalPrice) * 0.3),
            platformFee: Math.round(Number(finalPrice) * 0.1)
          }
        },
        status: "open",
        createdAt: serverTimestamp(),
        escrow: {
          amount: Number(finalPrice),
          status: "pending",
          released: false
        },
        applications: []
      };

      const docRef = await addDoc(collection(db, "jobs"), jobData);
      
      // Reset form
      setTitle("");
      setDescription("");
      setDeadline("");
      setLocation("");
      setImageFile(null);
      setImagePreview(null);
      setAiEstimate(null);
      setFinalPrice("");
      setStep(1);
      
      if (onJobCreated) onJobCreated(docRef.id);
      
      setSuccess("Job posted successfully! Redirecting...");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to post job:", err);
      setError(`Failed to post job: ${err.message}. Please try again.`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Post a New Job</h2>
        <p className="text-sm text-gray-600 mt-1">Describe work and get AI pricing</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
            step >= 1 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            1
          </div>
          <span className="text-xs font-medium text-gray-600">Details</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-emerald-500" : "bg-gray-300"}`} />
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
            step >= 2 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            2
          </div>
          <span className="text-xs font-medium text-gray-600">Pricing</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-emerald-500" : "bg-gray-300"}`} />
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
            step >= 3 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            3
          </div>
          <span className="text-xs font-medium text-gray-600">Payment</span>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Job Details */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Photos/Videos
              <span className="text-gray-500 font-normal ml-1">(Optional)</span>
            </label>
            <div 
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                imagePreview 
                  ? "border-emerald-400 bg-emerald-50" 
                  : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="rounded-xl max-h-60 mx-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto text-gray-400 mb-3" size={40} />
                  <p className="text-base font-medium text-gray-700 mb-1">Upload photo/video of work area</p>
                  <p className="text-sm text-gray-500">Click or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-2">Max file size: 5MB • Helps AI estimate better</p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Eg: Paint bedroom wall, Fix leaking tap, Install ceiling fan"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-2">Be specific to attract the right workers</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the work in detail... 
• What exactly needs to be done?
• What are the dimensions/measurements?
• Any special requirements?
• Materials to be used?"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 resize-y"
            />
            <p className="text-xs text-gray-500 mt-2">Detailed descriptions get better AI estimates</p>
          </div>

          {/* Location & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1 mb-1" />
                Location
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter complete address, landmark, area"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1 mb-1" />
                Deadline
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-2">When do you need it done?</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 text-sm">AI Pricing Tip</p>
                <p className="text-sm text-blue-700 mt-1">
                  The more details you provide, the more accurate the AI price estimate will be. 
                  Include measurements, materials, and specific requirements for best results.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={getAiEstimate}
            disabled={loading || !description.trim() || !location.trim()}
            className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Get AI Fair Price Estimate</span>
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setAiEstimate({
                  min: 500,
                  max: 2000,
                  confidence: 0.5,
                  breakdown: { labor: 1000, material: 500, platformFee: 500 }
                });
                setFinalPrice("1500");
                setStep(2);
              }}
              className="text-sm text-gray-600 hover:text-emerald-600 font-medium"
            >
              Skip AI estimate and set price manually →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pricing & Negotiation */}
      {step === 2 && (
        <div className="space-y-6">
          {/* AI Estimate Display */}
          {aiEstimate && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">AI Suggested Price Range</span>
                </div>
                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  {aiEstimate.confidence ? `${(aiEstimate.confidence * 100).toFixed(0)}% Confidence` : "Fair Price"}
                </span>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  ₹{aiEstimate.min} – ₹{aiEstimate.max}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Based on work complexity, materials, and local market rates
                </p>
              </div>
              
              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <p className="text-xs font-medium text-emerald-800 mb-2">Price Breakdown:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor</span>
                    <span className="font-medium text-gray-900">₹{aiEstimate.breakdown?.labor || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Materials</span>
                    <span className="font-medium text-gray-900">₹{aiEstimate.breakdown?.material || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-gray-900">₹{aiEstimate.breakdown?.platformFee || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Final Offer
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition">
              <IndianRupee className="text-gray-500" size={24} />
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                min={aiEstimate?.min || 100}
                max={aiEstimate?.max ? aiEstimate.max * 2 : 100000}
                className="flex-1 ml-3 text-xl font-bold text-gray-900 outline-none bg-transparent"
                placeholder="Enter amount"
              />
              <span className="text-gray-500 text-sm font-medium">INR</span>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">Min: ₹{aiEstimate?.min || 100}</span>
              <span className="text-gray-500">Max: ₹{aiEstimate?.max || 100000}</span>
            </div>
          </div>

          {/* Anchor Pricing Explanation */}
          {aiEstimate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Anchor Pricing Strategy</p>
                  <p className="text-sm text-blue-700">
                    Showing the higher price (₹{aiEstimate.max}) first creates a psychological anchor. 
                    Workers feel they&apos;re getting a better deal when you settle on ₹{Math.round((aiEstimate.min + aiEstimate.max) / 2)}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Negotiation Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 text-sm">Allow price negotiation?</p>
              <p className="text-xs text-gray-600 mt-1">Workers can propose different prices</p>
            </div>
            <button
              onClick={() => setNegotiating(!negotiating)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                negotiating ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ${
                  negotiating ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!finalPrice}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield className="h-5 w-5" />
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800 text-lg">Secure Payment & Escrow</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Your payment is held securely in escrow until the work is completed to your satisfaction
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-emerald-200">
                <span className="text-gray-700">Job Amount:</span>
                <span className="text-2xl font-bold text-emerald-800">₹{finalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Platform Fee (5%):</span>
                <span className="text-gray-700 font-medium">₹{Math.round(Number(finalPrice) * 0.05)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Worker Savings (5%):</span>
                <span className="text-gray-700 font-medium">₹{Math.round(Number(finalPrice) * 0.05)}</span>
              </div>
              <div className="pt-3 border-t border-emerald-300">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-gray-900">Total to pay now:</span>
                  <span className="text-2xl text-emerald-900">₹{finalPrice}</span>
                </div>
                <p className="text-xs text-emerald-700 mt-2">
                  Only ₹{finalPrice} charged now. Other fees are included in the breakdown.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-medium text-gray-800 mb-4 text-lg">Select Payment Method</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                <input type="radio" name="payment" defaultChecked className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">UPI</div>
                  <div className="text-sm text-gray-600 mt-1">Google Pay, PhonePe, Paytm, BHIM</div>
                </div>
                <div className="text-emerald-600 font-medium">Fastest</div>
              </label>
              <label className="flex items-center gap-4 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                <input type="radio" name="payment" className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Credit/Debit Card</div>
                  <div className="text-sm text-gray-600 mt-1">Visa, Mastercard, RuPay, American Express</div>
                </div>
              </label>
              <label className="flex items-center gap-4 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                <input type="radio" name="payment" className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Net Banking</div>
                  <div className="text-sm text-gray-600 mt-1">All major banks supported</div>
                </div>
              </label>
            </div>
          </div>

          {/* Guarantee Terms */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-blue-800 text-sm">100% Money-Back Guarantee</p>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Payment secured in escrow - released only after job completion
                  </p>
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    100% money-back if work is not satisfactory
                  </p>
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    5% auto-saved to worker&apos;s Savings Jar for financial security
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Back to Pricing
            </button>
            <button
              onClick={postJob}
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Pay Securely & Post Job</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}