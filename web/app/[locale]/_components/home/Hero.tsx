'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';

import { LoginModal } from './LoginModal';
import { useAuthStore } from '@/store/useAuthStore';

export function Hero() {
  const t = useTranslations('Landing.hero');
  const { user } = useAuthStore();

  return (
    <section className="relative px-6 pt-20 pb-32 max-w-7xl mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="z-10 text-left animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary-fixed text-brand-on-secondary-fixed text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm border border-brand-outline-variant">
            <span className="flex h-2 w-2 rounded-full bg-brand-secondary animate-pulse"></span>
            {t('badge')}
          </div>
          <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-brand-primary leading-[1.1] tracking-tight mb-8 text-balance">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-brand-on-surface-variant leading-relaxed mb-10 max-w-xl text-balance">
            {t('desc')}
          </p>
          <div className="flex flex-wrap gap-4">
            {!user ? (
              <LoginModal>
                <Button 
                  className="bg-brand-primary text-brand-on-primary px-8 py-7 rounded-xl font-heading font-bold text-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 border-none"
                >
                  {t('cta')}
                </Button>
              </LoginModal>
            ) : (
              <Link href="/board">
                <Button 
                  className="bg-brand-primary text-brand-on-primary px-8 py-7 rounded-xl font-heading font-bold text-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 border-none"
                >
                  {t('cta')}
                </Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2 px-8 py-7 rounded-xl border border-brand-outline-variant font-heading font-bold text-lg text-brand-primary hover:bg-brand-surface-container-low transition-all hover:scale-105 active:scale-95"
            >
              <PlayCircle className="w-6 h-6" />
              {t('demo')}
            </Button>
          </div>
        </div>
        
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-secondary-fixed/30 rounded-full blur-[100px]"></div>
          <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20 aspect-[4/3] group">
            <Image 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src="/hero-design.png" 
              alt="Study Interface" 
              width={800} 
              height={600}
              priority
            />
            <div className="absolute bottom-6 left-6 right-6 glass-card p-6 rounded-xl border border-white/40 shadow-lg animate-in fade-in slide-in-from-bottom-4 delay-500 fill-mode-both">
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading font-bold text-brand-primary">Mastery Progress</span>
                <span className="text-brand-on-tertiary-container font-bold">88%</span>
              </div>
              <div className="w-full bg-brand-surface-variant h-2 rounded-full overflow-hidden">
                <div className="bg-brand-secondary h-full transition-all duration-1000 ease-out delay-1000" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
