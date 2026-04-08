'use client';

import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Outline } from "@/services/outlineService";

interface OutlineListProps {
  outlines: Outline[];
  locale: string;
}

export default function OutlineList({ outlines, locale }: OutlineListProps) {
  if (outlines.length === 0) {
    return (
      <div className="col-span-full py-40 flex flex-col items-center justify-center text-center gap-6 bg-white rounded-[3rem] border-2 border-dashed border-[#EDEEEF]">
        <div className="p-6 bg-slate-50 rounded-full opacity-20"><BookOpen className="w-12 h-12" /></div>
        <div className="max-w-sm">
          <h3 className="text-xl font-black text-[#000666]">暂无教学资源</h3>
          <p className="text-[#767683] text-sm mt-3 leading-relaxed">老师尚未为此课程关联任何知识大纲业务。请耐心等待或联系您的授课老师。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {outlines.map(o => (
        <div 
          key={o.id} 
          className="group bg-white rounded-[2.5rem] p-8 border border-[#EDEEEF] hover:border-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 flex flex-col gap-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-[#767683] group-hover:bg-indigo-600/5 group-hover:text-indigo-600 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-black text-[#000666] leading-tight line-clamp-1">{o.name}</h3>
              <span className="text-[10px] font-bold text-[#767683] opacity-60 uppercase tracking-widest mt-1">CURRICULUM NODE</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = `/${locale}/board?outline=${o.id}`}
            className="mt-auto h-14 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-600/20 text-[#000666] font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6 group/btn"
          >
            开始智能练习
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      ))}
    </div>
  );
}
