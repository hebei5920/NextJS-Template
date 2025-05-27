'use client';

import { useTranslation } from '@/providers/language-provider';
import { useAuth } from '@/hooks/useAuth';
import { VoiceCloningStudio } from '@/components/voice-cloning/voice-cloning-studio';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import { GenerationHistory } from '@/components/voice-cloning/generation-history';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Sparkles, Mic, Upload, Type, Star, Shield, Zap, User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header with theme and language switchers */}
      <header className="fixed top-0 right-0 z-50 p-4 flex gap-4 items-center">
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-md border border-border">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-border bg-background hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:border-red-800 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </Link>
            )}
          </>
        )}
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI 语音克隆
              </span>
              <br />
              <span className="text-foreground">工作室</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              使用最先进的AI技术，只需几秒钟的音频样本，即可创建逼真的语音克隆。
              让您的声音在数字世界中永远传承。
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">简单录制</h3>
              <p className="text-sm text-muted-foreground">
                只需3秒钟的清晰录音，AI即可学习您的声音特征
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">极速生成</h3>
              <p className="text-sm text-muted-foreground">
                先进的AI算法，秒级生成高质量的语音内容
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">安全可靠</h3>
              <p className="text-sm text-muted-foreground">
                企业级安全保障，您的声音数据完全私密
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <a 
              href="#studio" 
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Sparkles className="h-5 w-5" />
              立即开始体验
            </a>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500" />
      </section>

      {/* Voice Cloning Studio Section */}
      <section id="studio" className="py-20 px-4">
        <VoiceCloningStudio />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <PricingPlans />
      </section>

      {/* Generation History Section */}
      <section id="generation-history" className="py-20 px-4">
        <GenerationHistory />
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AI 语音克隆工作室</span>
          </div>
          <p className="text-muted-foreground">
            让每个人都能拥有属于自己的AI语音助手
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">隐私政策</a>
            <a href="#" className="hover:text-foreground transition-colors">服务条款</a>
            <a href="#" className="hover:text-foreground transition-colors">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}