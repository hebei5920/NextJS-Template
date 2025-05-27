'use client';

import { Navbar } from '@/components/ui/navbar';
import { GenerationHistory } from '@/components/voice-cloning/generation-history';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content with top padding to account for fixed navbar */}
      <main className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              生成历史
            </h1>
            <p className="text-xl text-muted-foreground">
              查看您的所有语音生成记录
            </p>
          </div>
          
          <GenerationHistory />
        </div>
      </main>
    </div>
  );
} 