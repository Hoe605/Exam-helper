'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useParams } from 'next/navigation';

import { LoginModal } from './LoginModal';

export function Navbar() {
  const t = useTranslations('Landing.nav');
  const { locale } = useParams();
  const { user } = useAuthStore();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm dark:shadow-none transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold tracking-tighter text-brand-primary dark:text-white font-heading">
          ExamHelper AI
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-heading font-semibold tracking-tight text-sm">
          <Link 
            href="/#product" 
            className="text-brand-secondary border-b-2 border-brand-secondary pb-1 transition-all"
          >
            {t('product')}
          </Link>
          <Link 
            href="/#features" 
            className="text-slate-600 hover:text-brand-primary transition-colors duration-200"
          >
            {t('features')}
          </Link>
          <Link 
            href="/#pricing" 
            className="text-slate-600 hover:text-brand-primary transition-colors duration-200"
          >
            {t('pricing')}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex gap-2 mr-4 text-xs font-semibold text-slate-500">
             <Link href="/" locale="en" className={`hover:text-brand-primary ${locale === 'en' ? 'text-brand-primary' : ''}`}>EN</Link>
             <span className="text-slate-300">|</span>
             <Link href="/" locale="zh" className={`hover:text-brand-primary ${locale === 'zh' ? 'text-brand-primary' : ''}`}>中文</Link>
          </div>

          {!user ? (
            <LoginModal>
              <Button 
                variant="ghost" 
                className="px-4 py-2 text-sm font-heading font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all active:scale-95 duration-200"
              >
                {t('login')}
              </Button>
            </LoginModal>
          ) : (
            <Link href="/board">
              <Button 
                variant="ghost" 
                className="px-4 py-2 text-sm font-heading font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all active:scale-95 duration-200"
              >
                Dashboard
              </Button>
            </Link>
          )}
          
          {!user ? (
            <LoginModal>
              <Button 
                className="px-5 py-2 text-sm font-heading font-semibold bg-brand-primary text-brand-on-primary rounded-xl hover:opacity-90 transition-all active:scale-95 duration-200 shadow-md border-none"
              >
                {t('signup')}
              </Button>
            </LoginModal>
          ) : (
            <Link href="/board">
              <Button 
                className="px-5 py-2 text-sm font-heading font-semibold bg-brand-primary text-brand-on-primary rounded-xl hover:opacity-90 transition-all active:scale-95 duration-200 shadow-md border-none"
              >
                Board
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

