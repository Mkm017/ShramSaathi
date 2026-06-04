"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default function CustomerDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        setUser({ uid: currentUser.uid, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Unable to load dashboard
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="pt-20">
        <CustomerDashboard user={user} />
      </main>
    </>
  );
}
