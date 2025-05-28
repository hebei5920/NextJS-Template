'use client';

import { Navbar } from '@/components/ui/navbar';
import { VoiceGenerationsHistory } from '@/components/voice-cloning/voice-generations-history';
import { useTranslation } from '@/providers/language-provider';

export default function HistoryPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content with top padding to account for fixed navbar */}
      <main className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t('history.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('history.subtitle')}
            </p>
          </div>
          
          <VoiceGenerationsHistory />
        </div>
      </main>
    </div>
  );
} 