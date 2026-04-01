'use client';

import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Map as MapIcon, 
  Bot, 
  Settings, 
  HelpCircle, 
  Clock, 
  Target,
  ChevronRight,
  History,
  Activity,
  Send,
  User,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from '@/i18n/routing';
import DashboardSidebar from "@/components/DashboardSidebar";

export default function BoardPage() {
  const t = useTranslations('Practice');

  // Sample data to simulate the interface
  const attempts = [
    { id: 1, time: t('attempts.minutesAgo', { minutes: 2 }), status: t('attempts.error'), color: 'text-rose-500' },
    { id: 2, time: t('attempts.yesterday'), status: t('attempts.incomplete'), color: 'text-amber-500' }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />

      {/* 2. Main Content Area - Editorial Precision */}
      <main className="flex-1 overflow-y-auto p-12 flex flex-col gap-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#000666]">{t('title')}</h1>
            <p className="text-[#767683] mt-2">Module: Advanced Mathematical Statistics</p>
          </div>
          <div className="flex gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs text-[#767683] uppercase tracking-wider font-bold">{t('stats.mastery')}</span>
                <span className="text-2xl font-bold text-[#005313]">88%</span>
             </div>
             <div className="w-12 h-12 rounded-full border-4 border-[#005313] border-t-transparent animate-spin-slow" />
          </div>
        </header>

        {/* Problem Card */}
        <section className="flex flex-col gap-6 max-w-4xl">
           <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white px-3 py-1 rounded-full text-[#454652] border-[#C6C5D4]">
                Probability Density Function
              </Badge>
              <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 px-3 py-1 rounded-full">
                Hard
              </Badge>
           </div>
           
           <div className="text-2xl leading-relaxed font-medium text-[#191C1D]">
              Evaluate the integral of the probability density function for the given interval:
              <span className="block mt-4 italic text-[#000666] font-serif">
                {"∫_{-∞}^{0} \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2} dx"}
              </span>
           </div>

           {/* Solution Area - Glassmorphism UI */}
           <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-[#C6C5D4]/20 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#33A0FD]" />
                  Your Solution Path
                </h3>
              </div>
              <textarea 
                className="w-full bg-[#F3F4F5] rounded-2xl p-6 min-h-[200px] text-lg focus:outline-none focus:ring-2 focus:ring-[#33A0FD]/40 transition-all border-none resize-none"
                placeholder={t('chat.placeholder')}
              />
              <div className="flex justify-end gap-3 mt-2">
                <Button variant="ghost" className="rounded-xl px-6">{t('chat.send')}</Button>
                <Button className="bg-[#1A237E] hover:bg-[#000666] rounded-xl px-8 shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs font-bold">
                  Submit Analysis
                </Button>
              </div>
           </div>
        </section>
      </main>

      {/* 3. Right Sidebar - The Curator Panel */}
      <aside className="w-96 border-l border-[#C6C5D4]/10 bg-[#F3F4F5]/30 p-8 flex flex-col gap-10">
        
        {/* Previous Attempts */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 font-bold text-[#000666]">
            <History className="w-5 h-5" />
            {t('attempts.title')}
          </div>
          <div className="flex flex-col gap-4">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#454652] font-medium">{attempt.time}</span>
                  <span className={`text-xs font-bold uppercase tracking-tight ${attempt.color}`}>{attempt.status}</span>
                </div>
                <div className="h-1 w-full bg-[#EDEEEF] rounded-full mt-2 overflow-hidden">
                   <div className={`h-full bg-current ${attempt.color} opacity-20`} style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Diagnostic - Glassmorphism */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 font-bold text-[#000666]">
            <Activity className="w-5 h-5 text-[#33A0FD]" />
            {t('aiDiagnostic.title')}
          </div>
          
          <div className="bg-[#1A237E] text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex flex-col gap-4 relative z-10">
              <p className="text-sm text-indigo-100 leading-relaxed italic opacity-90">
                "{t('aiDiagnostic.advice')}"
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300">{t('aiDiagnostic.focusScore')}</span>
                  <span className="text-xl font-bold">94%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300">{t('aiDiagnostic.difficulty')}</span>
                  <span className="text-xl font-bold">{t('aiDiagnostic.hard')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Chat Interaction */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex-1 bg-white/40 rounded-3xl p-4 flex flex-col gap-4 overflow-y-auto min-h-0">
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm border border-[#C6C5D4]/10">
                  {t('aiDiagnostic.question')}
                </div>
             </div>
             <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#33A0FD] flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#1A237E] text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                  {t('aiDiagnostic.answer')}
                </div>
             </div>
          </div>
          <div className="relative">
            <input 
              type="text"
              placeholder={t('chat.placeholder')}
              className="w-full bg-white border-none rounded-2xl py-4 pl-6 pr-14 shadow-sm focus:ring-2 focus:ring-[#33A0FD]/30 transition-all font-medium text-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#33A0FD] text-white rounded-xl flex items-center justify-center hover:bg-[#1A237E] transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>
      </aside>
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
