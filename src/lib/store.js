import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations } from "./translations";

export const useStore = create(
  persist(
    (set, get) => ({
      lang: "en",
      t: translations.en,

      setLang: (lang) => {
        set({
          lang,
          t: translations[lang] || translations.en,
        });
      },
      
      toggleLang: () => {
        const currentLang = get().lang;
        const newLang = currentLang === "en" ? "hi" : "en";
        set({
          lang: newLang,
          t: translations[newLang] || translations.en,
        });
      },
    }),
    {
      name: "shramsaathi-store",
      getStorage: () => localStorage,
    }
  )
);