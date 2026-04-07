'use client';

import { useTranslations } from 'next-intl';
import { Network, Users, Wand2 } from 'lucide-react';

export function AgentEcosystem() {
  const t = useTranslations('Landing.ecosystem');

  return (
    <section id="features" className="bg-brand-surface-container-low py-32 px-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h2 className="font-heading font-extrabold text-4xl text-brand-primary mb-6">{t('title')}</h2>
          <p className="text-brand-on-surface-variant text-lg leading-relaxed">{t('desc')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Agent Card 1 */}
          <div className="bg-brand-surface-container-lowest p-10 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-b-4 border-brand-secondary-container relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="mb-8 w-14 h-14 rounded-lg bg-brand-primary-fixed flex items-center justify-center text-brand-primary group-hover:rotate-12 transition-transform duration-300">
              <Network className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-brand-primary mb-4">{t('agent1.title')}</h3>
            <p className="text-brand-on-surface-variant leading-relaxed">{t('agent1.desc')}</p>
            <div className="mt-8 pt-8 border-t border-brand-surface-container flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-brand-secondary uppercase">{t('agent1.status')}</span>
              <span className="flex h-2 w-2 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]"></span>
            </div>
          </div>
          
          {/* Agent Card 2 */}
          <div className="bg-brand-surface-container-lowest p-10 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-b-4 border-brand-primary relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="mb-8 w-14 h-14 rounded-lg bg-brand-secondary-fixed flex items-center justify-center text-brand-secondary group-hover:-rotate-12 transition-transform duration-300">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-brand-primary mb-4">{t('agent2.title')}</h3>
            <p className="text-brand-on-surface-variant leading-relaxed">{t('agent2.desc')}</p>
            <div className="mt-8 pt-8 border-t border-brand-surface-container flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">{t('agent2.status')}</span>
              <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-ping shadow-[0_0_8px_rgba(0,0,0,0.2)]"></span>
            </div>
          </div>
          
          {/* Agent Card 3 */}
          <div className="bg-brand-surface-container-lowest p-10 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-b-4 border-brand-tertiary-container relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="mb-8 w-14 h-14 rounded-lg bg-brand-tertiary-fixed flex items-center justify-center text-brand-tertiary group-hover:scale-110 transition-transform duration-300">
              <Wand2 className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-brand-primary mb-4">{t('agent3.title')}</h3>
            <p className="text-brand-on-surface-variant leading-relaxed">{t('agent3.desc')}</p>
            <div className="mt-8 pt-8 border-t border-brand-surface-container flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-brand-on-tertiary-container uppercase">{t('agent3.status')}</span>
              <span className="flex h-2 w-2 rounded-full bg-brand-on-tertiary-container shadow-[0_0_8px_rgba(0,0,0,0.2)]"></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
