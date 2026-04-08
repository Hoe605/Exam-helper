'use client';

import { AppWindow, School, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePracticeStore } from '@/store/usePracticeStore';
import { useTranslations } from 'next-intl';

export default function CourseSidebar() {
  const t = useTranslations('Practice');
  const { myCourses } = usePracticeStore();

  return (
    <aside className="w-96 border-l border-[#EDEEEF] bg-white p-10 flex flex-col gap-8 overflow-y-auto shrink-0">
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-[#000666]">
            <AppWindow className="w-4 h-4 text-indigo-600" />
            {t('sidebar.courses')}
          </div>
          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-[#EDEEEF] text-[#767683] px-2 py-0.5 rounded-full">
            {myCourses.length} ACTIVE
          </Badge>
        </div>

        <div className="flex flex-col gap-5">
          {myCourses.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-40">
              <School className="w-12 h-12" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                No courses found.<br/>Join one to get started.
              </p>
            </div>
          ) : (
            myCourses.map((course) => (
              <div 
                key={course.id} 
                className="group bg-[#F8F9FA] p-6 rounded-[32px] border border-transparent hover:border-indigo-500/10 hover:bg-white hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 cursor-pointer flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[8px] font-black text-[#767683] uppercase tracking-[0.15em]">
                    <span>CODE: {course.code}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-sm font-black text-[#000666] line-clamp-1">{course.name}</h3>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-lg bg-indigo-600/5 flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-indigo-600" />
                     </div>
                     <span className="text-[9px] font-bold text-[#767683]">Knowledge Map</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50">
                     ENTER
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* AI Quick Diagnostic Insight */}
      <section className="mt-auto">
        <div className="bg-gradient-to-br from-[#1A237E] to-[#000666] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex flex-col gap-5 relative z-10">
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-200" />
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-200">AI Quick Tip</span>
            </div>
            <p className="text-[10px] text-indigo-50 leading-relaxed font-medium">
              "您在贝叶斯分析方面的掌握度正在稳步提升。建议下一步挑战具有多个先验概率的综合计算题。"
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
