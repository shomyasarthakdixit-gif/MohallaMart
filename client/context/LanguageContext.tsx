"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi";

type Translations = {
  [key: string]: string;
};

const dictionaries: Record<Language, Translations> = {
  en: {
    home: "Home",
    search: "Search",
    orders: "Orders",
    cart: "Cart",
    profile: "Profile",
    settings: "Settings",
    language: "Language",
    my_orders: "My Orders",
    support: "Support",
    logout: "Logout",
    // Add more as needed
  },
  hi: {
    home: "होम",
    search: "खोजें",
    orders: "ऑर्डर",
    cart: "कार्ट",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    language: "भाषा",
    my_orders: "मेरे ऑर्डर",
    support: "सहायता",
    logout: "लॉग आउट",
    // Add more as needed
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem("mohallamart_lang") as Language;
    if (saved && (saved === "en" || saved === "hi")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mohallamart_lang", lang);
  };

  const t = (key: string): string => {
    return dictionaries[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
