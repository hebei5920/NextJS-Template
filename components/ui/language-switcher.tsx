'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/providers/language-provider';
import { SupportedLanguage } from '@/i18n';
import { useState } from 'react';
import { languages } from '@/i18n';
interface LanguageOption {
  value: SupportedLanguage;
  label: string;
  flag: string;
}

 

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setShowLanguagePicker(!showLanguagePicker)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors"
        aria-label="Choose language"
      >
        <Languages className="h-4 w-4" />
      </button>

      {showLanguagePicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLanguagePicker(false)}
          />
          
          {/* Language Picker Panel */}
          <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-border bg-background p-4 shadow-lg max-h-80 overflow-y-auto">
            <h3 className="mb-3 text-sm font-medium">Choose Language</h3>
            <div className="space-y-1">
              {languages.map((option) => (
                <button
                  key={option.code}
                  onClick={() => {
                    setLanguage(option.code);
                    setShowLanguagePicker(false);
                  }}
                  className={`relative flex items-center gap-3 rounded-lg p-2 w-full text-left transition-colors hover:bg-accent ${
                    language === option.code ? 'bg-accent' : ''
                  }`}
                >
                  <span className="text-lg">{option.flag}</span>
                  <span className="text-sm">{option.name}</span>
                  {language === option.code && (
                    <div className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 