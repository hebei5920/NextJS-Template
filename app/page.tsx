'use client';

import { useTranslation } from '@/components/language-provider';
import LanguageSwitcher from '@/components/language-switcher';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 p-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {t('home.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          {t('home.subtitle')}
        </p>
      </div>
      
      <div className="text-center space-y-2 text-sm text-gray-500 dark:text-gray-400">
        <p>{t('home.features.title')}</p>
        <ul className="space-y-1">
          <li>✅ {t('home.features.i18n')}</li>
          <li>✅ {t('home.features.theme')}</li>
          <li>✅ {t('home.features.styling')}</li>
          <li>✅ {t('home.features.typescript')}</li>
        </ul>
      </div>
    </div>
  );
}