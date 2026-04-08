'use client';

import { useTranslations } from 'next-intl';
import { Sparkles } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useEffect } from 'react';
import { usePracticeStore } from '@/store/usePracticeStore';

// 子组件 (均已接入 Store)
import PracticeConfig from './_components/PracticeConfig';
import PracticeDisplay from './_components/PracticeDisplay';
import CourseSidebar from './_components/CourseSidebar';

export default function BoardPage() {
  const t = useTranslations('Practice');
  const {
    hasHydrated, setHasHydrated,
    fetchInitialData
  } = usePracticeStore();

  // 处理 Zustand 持久化存储的注水问题
  useEffect(() => {
    setHasHydrated(true);
    fetchInitialData();
  }, [setHasHydrated, fetchInitialData]);

  if (!hasHydrated) return null;

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-12 flex flex-col gap-10">
        <header className="flex justify-between items-center max-w-5xl">
          <div>
            <div className="flex items-center gap-2 text-[#767683] font-black text-[10px] uppercase tracking-[0.2em] opacity-80 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Cognitive Engine
            </div>
            <h1 className="text-4xl font-black text-[#000666] tracking-tighter leading-none">{t('title')}</h1>
            <p className="text-[#767683] mt-3 font-medium">利用深度 AI 智能，针对您的薄弱知识点实时生成训练题目。</p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#767683] opacity-60">{t('stats.mastery')}</span>
              <span className="text-2xl font-black text-[#005313]">88%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-[#005313] border-t-transparent animate-spin-slow" />
          </div>
        </header>

        <PracticeConfig />
        <PracticeDisplay />
      </main>

      <CourseSidebar />

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
