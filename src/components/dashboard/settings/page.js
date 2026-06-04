"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/shared/Navbar";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Save,
  ArrowLeft
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: true,
    language: "en",
    autoSave: 5,
    twoFactor: false
  });

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage for demo
      localStorage.setItem('userSettings', JSON.stringify(settings));
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto pt-24 px-4">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6 space-y-8">
          {/* Profile Settings */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <User className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-orange-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            </div>
            <div className="space-y-4">
              <ToggleSetting
                label="Push Notifications"
                description="Receive job alerts and updates"
                checked={settings.notifications}
                onChange={(checked) => setSettings({...settings, notifications: checked})}
              />
              <ToggleSetting
                label="Email Updates"
                description="Weekly summaries and tips"
                checked={settings.emailUpdates}
                onChange={(checked) => setSettings({...settings, emailUpdates: checked})}
              />
              <ToggleSetting
                label="SMS Alerts"
                description="Important job alerts via SMS"
                checked={settings.smsUpdates}
                onChange={(checked) => setSettings({...settings, smsUpdates: checked})}
              />
            </div>
          </section>

          {/* Security */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Security</h2>
            </div>
            <div className="space-y-4">
              <ToggleSetting
                label="Two-Factor Authentication"
                description="Add an extra layer of security"
                checked={settings.twoFactor}
                onChange={(checked) => setSettings({...settings, twoFactor: checked})}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Save Percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="5"
                    value={settings.autoSave}
                    onChange={(e) => setSettings({...settings, autoSave: parseInt(e.target.value)})}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-lg font-bold text-emerald-700">{settings.autoSave}%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {settings.autoSave}% of every job will be auto-saved to your Savings Jar
                </p>
              </div>
            </div>
          </section>

          {/* Language */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-purple-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Language & Region</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-6 border-t">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 transition">
      <div>
        <div className="font-medium text-gray-800">{label}</div>
        <div className="text-sm text-gray-500 mt-1">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}