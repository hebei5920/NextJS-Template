import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { LanguageProvider } from '@/providers/language-provider';
import { VoiceModelProvider } from '@/providers/voice-model-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Voice Cloning Studio - AI 语音克隆工作室',
  description: 'Create realistic voice clones with advanced AI technology using just a few seconds of audio samples. Let your voice live forever in the digital world.',
  keywords: 'AI, Voice Cloning, TTS, Text to Speech, AI Voice, Voice Synthesis, 语音克隆, AI语音',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} theme-transition`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <LanguageProvider>
            <VoiceModelProvider>
              <div className="min-h-screen bg-background text-foreground">
                {children}
              </div>
            </VoiceModelProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}