import { LanguageSwitcher, LanguageDisplay } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function TestPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Language Switcher Test</h1>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Full Language Switcher</h2>
          <LanguageSwitcher showFlag showNativeName />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Simple Language Display</h2>
          <LanguageDisplay />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Without Flags</h2>
          <LanguageSwitcher showFlag={false} />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">English Names Only</h2>
          <LanguageSwitcher showNativeName={false} />
        </div>
      </div>
    </div>
  );
} 