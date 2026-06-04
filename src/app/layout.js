"use client";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Don't show navbar on auth pages
  const hideNavbar = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/onboarding';

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 min-h-screen">
        {!hideNavbar && !loading && <Navbar user={user} />}
        <main className={`${!hideNavbar ? 'pt-20' : ''} px-4 pb-8`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}