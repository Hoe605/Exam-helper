'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function KnowledgeMap() {
  const t = useTranslations('Landing.knowledgeMap');

  return (
    <section className="py-32 px-6 bg-white dark:bg-black transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="w-full md:w-1/2 animate-in fade-in slide-in-from-left-8 duration-700">
          <h2 className="font-heading font-extrabold text-4xl text-brand-primary mb-8 leading-tight">
            {t('title')}
          </h2>
          <p className="text-lg text-brand-on-surface-variant mb-8 leading-relaxed max-w-lg">
            {t('desc')}
          </p>
          <ul className="space-y-4 mb-10">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-3 text-brand-primary font-semibold group">
                <div className="w-6 h-6 rounded-full bg-brand-secondary/10 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                  <CheckCircle2 className="w-5 h-5 text-brand-secondary" />
                </div>
                <span>{t(`feature${i}` as any)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="w-full md:w-1/2 relative animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-brand-surface-variant aspect-square bg-white p-8 group">
            <div className="absolute inset-0 bg-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <Image 
              className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" 
              src="/knowledge-map.png" 
              alt="Knowledge Map Visualization" 
              width={600} 
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
