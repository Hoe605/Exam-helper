import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  FileText, 
  Zap,
  Globe,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">ExamHelper</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              {t('Nav.features')}
            </Link>
            <Link href="#solutions" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              {t('Nav.solutions')}
            </Link>
            <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              {t('Nav.faq')}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex gap-2 mr-4">
               <Link href="/" locale="en" className="text-xs hover:text-indigo-600">EN</Link>
               <span className="text-zinc-300">|</span>
               <Link href="/" locale="zh" className="text-xs hover:text-indigo-600">中文</Link>
            </div>

            <Link href="/board" className="hidden sm:block">
              <Button variant="ghost" className="text-sm font-medium">{t('Nav.login')}</Button>
            </Link>
            <Link href="/board">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5">
                {t('Nav.started')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 -z-10 bg-white dark:bg-zinc-950">
            <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e0e7ff_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#09090b_40%,#1e1b4b_100%)] opacity-80"></div>
            <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center mix-blend-overlay opacity-30 dark:mix-blend-soft-light dark:opacity-20 pointer-events-none"></div>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
              <div className="lg:w-1/2 flex flex-col items-center lg:items-start">
                <Badge variant="outline" className="mb-6 border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 px-4 py-1 rounded-full">
                  {t('Hero.badge')}
                </Badge>
                
                <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl md:text-7xl leading-tight">
                  {t('Hero.title1')} <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">
                    {t('Hero.title2')}
                  </span>
                </h1>
                
                <p className="mt-8 max-w-xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
                  {t('Hero.desc')}
                </p>
                
                <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link href="/board" className="w-full sm:w-auto">
                    <Button size="lg" className="h-14 w-full sm:px-8 rounded-full bg-indigo-600 text-lg font-semibold hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                      {t('Hero.getStarted')}
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="h-14 w-full sm:px-8 rounded-full text-lg font-semibold border-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-900 bg-white/50 dark:bg-transparent backdrop-blur-sm">
                    {t('Hero.viewDemo')}
                  </Button>
                </div>

                <div className="mt-10 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px]">👤</div>
                    ))}
                  </div>
                  <span>{t('Hero.users')}</span>
                </div>
              </div>

              {/* Interactive Illustration / Preview */}
              <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative rounded-2xl border border-zinc-200/50 bg-white/40 p-2 shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-950/40 backdrop-blur-xl">
                    <div className="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                      <Image 
                        src="/hero.png" 
                        alt="ExamHelper Illustration" 
                        width={800} 
                        height={600} 
                        className="w-full h-auto object-cover opacity-90 brightness-105"
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-2xl backdrop-blur-md animate-pulse">
                            <LayoutDashboard className="h-8 w-8" />
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6 h-20 w-20 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl flex flex-col items-center justify-center animate-bounce duration-[3000ms]">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <span className="text-[10px] font-bold mt-1">AI Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Simplified for Demo, already mostly translated in messages */}
        <section id="features" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">核心功能</h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">我们将复杂的备考流程简化为几个智能步骤</p>
            {/* Cards would follow here as before, keeping them static for brevity or move to messages */}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-zinc-500">
           <span>© 2026 ExamHelper Inc.</span>
        </div>
      </footer>
    </div>
  );
}
