"use client";
import { Globe } from 'lucide-react';

export default function LanguageSelector({ lang, setLang }) {
  return (
    <button 
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className="flex items-center space-x-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30 text-white hover:bg-white/30 transition"
    >
      <Globe size={14} />
      <span>{lang === 'en' ? 'HI' : 'EN'}</span>
    </button>
  );
}