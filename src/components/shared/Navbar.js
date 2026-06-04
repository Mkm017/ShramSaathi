"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, LogOut, ChevronDown, Bell, Home, Wallet, Menu, X, Globe, Mic } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useStore();
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const ref = useRef(null);

  const logout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const readPageTitle = () => {
    const pageTitle = document.title;
    speakText(pageTitle);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <div
        className="
          bg-gradient-to-r from-emerald-600/90 to-emerald-700/90
          backdrop-blur-xl
          rounded-2xl
          shadow-xl
          border border-emerald-500/30
        "
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <div className="flex items-center">
              <button 
                onClick={() => router.push("/")}
                className="flex items-center gap-2 hover:opacity-90 transition"
              >
                <Image src="/logo/s2.png" alt="Shram" width={70} height={50} />
                <Image src="/logo/s3.png" alt="Saathi" width={85} height={24} />
              </button>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center ml-10 space-x-1">
                <NavItem 
                  icon={<Home size={18} />} 
                  label={t.home || "Home"} 
                  active={pathname === '/'} 
                  onClick={() => router.push('/')}
                />
                {user && (
                  <>
                    <NavItem 
                      icon={<Wallet size={18} />} 
                      label={t.wallet || "Wallet"} 
                      onClick={() => router.push('/dashboard/wallet')}
                    />
                    <NavItem 
                      icon={<Bell size={18} />} 
                      label={t.notifications || "Notifications"} 
                      badge={3}
                    />
                  </>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - LANGUAGE & VOICE */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-xl
                  bg-white/10
                  hover:bg-white/20
                  text-white
                  text-sm font-medium
                  transition
                  backdrop-blur-sm
                  border border-white/20
                "
              >
                <Globe size={16} />
                {lang === 'en' ? 'हिन्दी' : 'English'}
              </button>

              {/* Voice Read Button */}
              <button
                onClick={readPageTitle}
                className="
                  hidden md:flex
                  items-center gap-2
                  px-4 py-2
                  rounded-xl
                  bg-orange-500/90
                  hover:bg-orange-600
                  text-white
                  text-sm font-medium
                  transition
                  backdrop-blur-sm
                  border border-orange-400/30
                "
              >
                <Mic size={16} />
                {t.listen || "Listen"}
              </button>

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-emerald-500/20"
              >
                {mobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* PROFILE - Desktop */}
              {user && (
                <div className="hidden md:block relative" ref={ref}>
                  <button
                    onClick={() => setOpen(!open)}
                    className="
                      flex items-center gap-3
                      px-4 py-2.5
                      rounded-xl
                      bg-emerald-700/50
                      hover:bg-emerald-600/70
                      transition-all
                      border border-emerald-500/30
                      backdrop-blur-sm
                    "
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {user?.name?.split(" ")[0] || "User"}
                      </p>
                      <p className="text-xs text-emerald-100/80">
                        {user?.role === "worker" ? t.worker || "Worker" : t.customer || "Customer"}
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-emerald-100" />
                  </button>

                  {/* DROPDOWN */}
                  {open && (
                    <div
                      className="
                        absolute right-0 mt-2 w-64
                        bg-white
                        rounded-2xl
                        shadow-2xl
                        border border-emerald-100
                        overflow-hidden
                        animate-in fade-in slide-in-from-top-5 duration-200
                      "
                    >
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user?.name}</p>
                            <p className="text-sm text-gray-500">
                              {user?.role === "worker" ? t.workerAccount || "Worker Account" : t.customerAccount || "Customer Account"}
                            </p>
                            <p className="text-xs text-emerald-600 font-medium mt-1">
                              {user?.tier ? `${user.tier} ${t.tier || "Tier"}` : t.verified || "Verified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => router.push("/dashboard/settings")}
                          className="w-full px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3"
                        >
                          <User size={16} />
                          {t.profileSettings || "Profile Settings"}
                        </button>
                        <button
                          onClick={() => router.push("/dashboard/wallet")}
                          className="w-full px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3"
                        >
                          <Wallet size={16} />
                          {t.walletEarnings || "Wallet & Earnings"}
                        </button>
                      </div>

                      <div className="border-t p-2">
                        <button
                          onClick={logout}
                          className="
                            w-full px-4 py-3 rounded-lg
                            text-sm text-red-600
                            flex items-center gap-3
                            hover:bg-red-50
                          "
                        >
                          <LogOut size={16} />
                          {t.signOut || "Sign Out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenu && (
            <div className="md:hidden border-t border-emerald-500/30 mt-2 pt-4 pb-4 animate-in slide-in-from-top">
              <div className="space-y-2 px-2">
                <MobileNavItem icon={<Home />} label={t.home || "Home"} onClick={() => router.push('/')} />
                {user && (
                  <>
                    <MobileNavItem icon={<Wallet />} label={t.wallet || "Wallet"} onClick={() => router.push('/dashboard/wallet')} />
                    <MobileNavItem icon={<Bell />} label={t.notifications || "Notifications"} badge={3} />
                    <MobileNavItem icon={<User />} label={t.profile || "Profile"} onClick={() => router.push('/dashboard/settings')} />
                    
                    <div className="pt-4 border-t border-emerald-500/20">
                      <div className="flex items-center gap-3 px-2 py-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user?.name?.split(" ")[0] || "User"}</p>
                          <p className="text-xs text-emerald-100/80">
                            {user?.role === "worker" ? t.worker || "Worker" : t.customer || "Customer"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full mt-2 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} />
                        {t.signOut || "Sign Out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative
        flex items-center gap-2
        px-4 py-2.5
        rounded-xl
        text-sm font-medium
        transition-all
        hover:bg-emerald-500/20
        ${active ? 'text-white bg-emerald-500/30' : 'text-emerald-100/90'}
      `}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="
          absolute -top-1 -right-1
          w-5 h-5
          bg-red-500
          text-white
          text-xs
          rounded-full
          flex items-center justify-center
          animate-pulse
        ">
          {badge}
        </span>
      )}
    </button>
  );
}

function MobileNavItem({ icon, label, onClick, badge }) {
  return (
    <button 
      onClick={onClick}
      className="
        w-full
        flex items-center justify-between
        px-4 py-3
        rounded-xl
        text-white
        hover:bg-emerald-500/30
        transition
      "
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className="
          w-6 h-6
          bg-red-500
          text-white
          text-xs
          rounded-full
          flex items-center justify-center
        ">
          {badge}
        </span>
      )}
    </button>
  );
}