'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('Landing.footer');

  return (
    <footer className="bg-slate-50 border-t border-slate-200/50 pt-24 pb-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16 font-sans text-sm items-start">
        <div className="col-span-2 md:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-2xl font-bold text-brand-primary mb-6 block font-heading tracking-tighter">
            ExamHelper AI
          </span>
          <p className="text-slate-500 mb-8 leading-relaxed text-balance">
            {t('desc')}
          </p>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h4 className="font-bold text-brand-secondary mb-6 uppercase tracking-wider text-xs">
            {t('resources')}
          </h4>
          <ul className="space-y-4">
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">Documentation</Link></li>
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">API Status</Link></li>
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">Privacy Policy</Link></li>
          </ul>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h4 className="font-bold text-brand-secondary mb-6 uppercase tracking-wider text-xs">
            {t('company')}
          </h4>
          <ul className="space-y-4">
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">About Us</Link></li>
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">Careers</Link></li>
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">Terms of Service</Link></li>
          </ul>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h4 className="font-bold text-brand-secondary mb-6 uppercase tracking-wider text-xs">
            {t('connect')}
          </h4>
          <ul className="space-y-4">
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">Twitter (X)</Link></li>
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">LinkedIn</Link></li>
            <li><Link className="text-slate-500 hover:text-brand-primary transition-colors underline decoration-brand-secondary/30 underline-offset-4 decoration-2" href="#">Discord Community</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
        <p className="text-slate-500 text-xs text-center md:text-left">
          {t('copyright')}
        </p>
        <div className="flex gap-8 text-xs font-semibold text-slate-400">
           <Link href="#" className="hover:text-brand-primary transition-colors">Cookie Settings</Link>
           <Link href="#" className="hover:text-brand-primary transition-colors">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
