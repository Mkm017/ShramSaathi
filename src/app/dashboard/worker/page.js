"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import WorkerDashboard from "@/components/dashboard/WorkerDashboard";

export default function WorkerDashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        router.replace("/");
        return;
      }

      const data = snap.data();
      if (data.role !== "worker") {
        router.replace("/");
        return;
      }

      setUserData({ uid: user.uid, ...data });
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
  <>
    <Navbar user={userData} />

    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <WorkerDashboard user={userData} />
      </div>
    </main>
  </>
);

}
