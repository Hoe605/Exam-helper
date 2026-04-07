'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

import { LoginModal } from './LoginModal';
import { useAuthStore } from '@/store/useAuthStore';

export function Pricing() {
  const t = useTranslations('Landing.pricing');
  const { user } = useAuthStore();

  return (
    <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto transition-all duration-500">
      <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="font-heading font-extrabold text-5xl text-brand-primary mb-6">{t('title')}</h2>
        <p className="text-brand-on-surface-variant text-xl">{t('subtitle')}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-10 items-stretch">
        {/* Free */}
        <div className="bg-brand-surface-container-low p-10 rounded-2xl border border-transparent hover:border-brand-outline-variant transition-all hover:shadow-lg flex flex-col group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="mb-10">
            <span className="text-sm font-bold tracking-widest text-brand-on-surface-variant uppercase opacity-70 group-hover:opacity-100 transition-opacity">
              {t('free.name')}
            </span>
            <h3 className="text-4xl font-heading font-extrabold text-brand-primary mt-3">
              {t('free.price')}
            </h3>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {(t.raw('free.features') as string[]).map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-brand-on-surface-variant group-hover:text-brand-primary transition-colors">
                <div className="w-5 h-5 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-brand-secondary" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          {!user ? (
            <LoginModal>
              <Button 
                className="w-full py-6 rounded-2xl border-2 border-brand-primary text-brand-primary font-heading font-bold hover:bg-white transition-all bg-transparent active:scale-95"
                variant="outline"
              >
                {t('free.cta')}
              </Button>
            </LoginModal>
          ) : (
            <Button 
              className="w-full py-6 rounded-2xl border-2 border-brand-primary text-brand-primary font-heading font-bold hover:bg-white transition-all bg-transparent active:scale-95"
              variant="outline"
              asChild
            >
              <Link href="/board">{t('free.cta')}</Link>
            </Button>
          )}
        </div>
        
        {/* Scholar */}
        <div className="bg-white p-10 rounded-2xl border-2 border-brand-primary shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative scale-105 z-10 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[12px] font-bold tracking-widest uppercase px-6 py-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-default">
            {t('scholar.recommended')}
          </div>
          <div className="mb-10 mt-2">
            <span className="text-sm font-bold tracking-widest text-brand-secondary uppercase">
              {t('scholar.name')}
            </span>
            <h3 className="text-4xl font-heading font-extrabold text-brand-primary mt-3 flex items-baseline gap-1">
              $19<span className="text-xl font-normal opacity-60">/mo</span>
            </h3>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {(t.raw('scholar.features') as string[]).map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-brand-primary font-bold">
                <CheckCircle2 className="w-5 h-5 text-brand-secondary" />
                {f}
              </li>
            ))}
          </ul>
          {!user ? (
            <LoginModal>
              <Button 
                className="w-full py-7 rounded-2xl bg-brand-primary text-brand-on-primary font-heading font-bold hover:opacity-90 shadow-2xl transition-all hover:scale-105 active:scale-95 border-none"
              >
                {t('scholar.cta')}
              </Button>
            </LoginModal>
          ) : (
            <Button 
              className="w-full py-7 rounded-2xl bg-brand-primary text-brand-on-primary font-heading font-bold hover:opacity-90 shadow-2xl transition-all hover:scale-105 active:scale-95 border-none"
              asChild
            >
              <Link href="/board">{t('scholar.cta')}</Link>
            </Button>
          )}
        </div>
        
        {/* Institution */}
        <div className="bg-brand-surface-container-low p-10 rounded-2xl border border-transparent hover:border-brand-outline-variant transition-all hover:shadow-lg flex flex-col group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="mb-10">
            <span className="text-sm font-bold tracking-widest text-brand-on-surface-variant uppercase opacity-70 group-hover:opacity-100 transition-opacity">
              {t('institution.name')}
            </span>
            <h3 className="text-4xl font-heading font-extrabold text-brand-primary mt-3">
              {t('institution.price')}
            </h3>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {(t.raw('institution.features') as string[]).map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-brand-on-surface-variant group-hover:text-brand-primary transition-colors">
                <div className="w-5 h-5 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-brand-secondary" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          <Button 
            className="w-full py-6 rounded-2xl border-2 border-brand-primary text-brand-primary font-heading font-bold hover:bg-white transition-all bg-transparent active:scale-95"
            variant="outline"
          >
            {t('institution.cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
