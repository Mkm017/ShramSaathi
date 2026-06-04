"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import AuthWrapper from "@/components/auth/AuthWrapper";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Not logged in - show auth screen
        setAuthUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setAuthUser(currentUser);

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));

        if (!snap.exists()) {
          // Logged in but profile not created yet
          setProfile(null);
          setLoading(false);
          return;
        }

        const data = snap.data();
        setProfile(data);

        // 🔀 ROUTING DECISION
        if (!data.onboardingCompleted) {
          router.replace("/onboarding");
          return;
        }

        if (data.role === "worker") {
          router.replace("/dashboard/worker");
        } else {
          router.replace("/dashboard/customer");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading ShramSaathi...</p>
        </div>
      </div>
    );
  }

  /* ---------------- AUTH (LOGIN / REGISTER) ---------------- */
  if (!authUser || !profile) {
    return <AuthWrapper />;
  }

  /* ---------------- SAFETY FALLBACK ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" />
    </div>
  );
}