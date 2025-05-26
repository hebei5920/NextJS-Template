'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedLanguage,
  getTranslation,
  getInitialLanguage,
  saveLanguageToStorage
} from '@/i18n';

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => { },
  t: (key, fallback) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialLanguage = getInitialLanguage();
    setLanguageState(initialLanguage);
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    saveLanguageToStorage(lang);
  };

  const t = (key: string, fallback?: string): string => {
    if (!isInitialized) {
      return fallback || key;
    }
    return getTranslation(language, key, fallback);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  if (language === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return { language, setLanguage };
};