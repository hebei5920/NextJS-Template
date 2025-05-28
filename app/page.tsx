'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/providers/language-provider';
import { VoiceCloningStudio } from '@/components/voice-cloning/voice-cloning-studio';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import { FAQ } from '@/components/ui/faq';
import { Navbar } from '@/components/ui/navbar';
import { Sparkles, Mic, Upload, Type, Star, Shield, Zap } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  // 处理URL中的锚点
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        // 延迟一点时间确保页面完全加载
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <Navbar />

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
                {t('home.hero.title')}
              </span>
              <br />
              <span className="text-foreground">{t('home.hero.subtitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.description')}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('home.features.simple_recording.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.features.simple_recording.description')}
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('home.features.fast_generation.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.features.fast_generation.description')}
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('home.features.secure_reliable.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.features.secure_reliable.description')}
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
              {t('home.hero.cta_button')}
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <FAQ />
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{t('home.footer.title')}</span>
          </div>
          <p className="text-muted-foreground">
            {t('home.footer.slogan')}
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">{t('common.privacy_policy')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('common.terms_of_service')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('common.contact_us')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}