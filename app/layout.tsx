import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { LanguageProvider } from '@/providers/language-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI 语音克隆工作室 - Voice Cloning Studio',
  description: '使用最先进的AI技术，只需几秒钟的音频样本，即可创建逼真的语音克隆。让您的声音在数字世界中永远传承。',
  keywords: 'AI, 语音克隆, Voice Cloning, TTS, 文本转语音, AI语音, 语音合成',
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
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}