"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AuthWrapper() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // ❌ Not logged in → go to merged login/signup
      if (!user) {
        router.replace("/login");
        return;
      }

      // ✅ Logged in → check Firestore
      const snap = await getDoc(doc(db, "users", user.uid));

      // Logged in but not registered
      if (!snap.exists()) {
        router.replace("/signup");
        return;
      }

      // Registered but onboarding incomplete
      if (!snap.data().onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }

      // Fully onboarded
      if (snap.data().role === "worker") {
        router.replace("/dashboard/worker");
      } else {
        router.replace("/dashboard/customer");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // No UI here — pure router guard
  return null;
}
