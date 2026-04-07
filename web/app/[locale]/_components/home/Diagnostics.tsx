'use client';

import { useTranslations } from 'next-intl';
import { Brain, CalendarFold } from 'lucide-react';

export function Diagnostics() {
  const t = useTranslations('Landing.diagnostics');

  return (
    <section className="bg-brand-primary py-32 px-6 relative overflow-hidden transition-all duration-700">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#33a0fd_0%,transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,#4c56af_0%,transparent_60%)]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="text-3xl font-bold text-brand-secondary-fixed mb-2 tracking-tighter">0.4s</div>
                <div className="text-xs font-bold text-brand-on-primary-container uppercase tracking-widest">{t('stats.latency')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="text-3xl font-bold text-brand-secondary-fixed mb-2 tracking-tighter">99.8%</div>
                <div className="text-xs font-bold text-brand-on-primary-container uppercase tracking-widest">{t('stats.accuracy')}</div>
              </div>
              <div className="col-span-2 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                <h4 className="font-heading font-bold text-white mb-6 text-xl">{t('stats.chartTitle')}</h4>
                <div className="flex gap-4 items-end h-32 mt-4">
                  {[60, 90, 40, 75, 30].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div 
                        className={`w-full ${i % 2 === 0 ? 'bg-brand-secondary-container' : 'bg-brand-secondary-fixed'} rounded-t-xl group-hover:scale-105 transition-transform duration-500`} 
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 animate-in fade-in slide-in-from-right-8 duration-1000">
            <h2 className="font-heading font-extrabold text-4xl text-white mb-8 leading-tight">
              {t('title')}
            </h2>
            <p className="text-brand-on-primary-container text-lg leading-relaxed mb-8 max-w-xl opacity-90">
              {t('desc')}
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-secondary-container flex items-center justify-center text-brand-primary shrink-0 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-white text-xl mb-1">{t('feature1.title')}</p>
                  <p className="text-sm text-brand-on-primary-container opacity-80 leading-relaxed">{t('feature1.desc')}</p>
                </div>
              </div>
              
              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-secondary-container flex items-center justify-center text-brand-primary shrink-0 group-hover:-rotate-12 transition-transform duration-300 shadow-lg">
                  <CalendarFold className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-white text-xl mb-1">{t('feature2.title')}</p>
                  <p className="text-sm text-brand-on-primary-container opacity-80 leading-relaxed">{t('feature2.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
