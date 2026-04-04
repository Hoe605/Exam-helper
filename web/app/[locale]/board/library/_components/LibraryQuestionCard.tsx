'use client';

import { Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartContent from "@/components/SmartContent";
import { memo, useState } from 'react';

interface LibraryQuestionCardProps {
  question: any;
  onDelete: (id: number) => void;
  t: any;
}

export const LibraryQuestionCard = memo(function LibraryQuestionCard({ 
  question: q, 
  onDelete,
  t
}: LibraryQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[40px] p-8 border border-transparent hover:border-indigo-500/20 shadow-2xl shadow-black/[0.02] hover:shadow-indigo-900/5 transition-all group relative overflow-hidden flex flex-col gap-6">
       {/* Row Header */}
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
             <Badge className="bg-[#F3F4F5] text-[#767683] border-none px-4 py-1.5 rounded-lg font-black text-[10px]">ID: #{q.id}</Badge>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] opacity-40">{q.q_type || 'General'}</span>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm transition-colors active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4"
             >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isExpanded ? '收起详情' : '查看答案'}
             </button>
             <button 
               onClick={() => onDelete(q.id)}
               className="p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm transition-colors active:scale-95"
             >
                <Trash2 className="w-5 h-5" />
             </button>
          </div>
       </div>

       {/* Content Section */}
       <div className="flex flex-col gap-8">
          <div className="min-w-0">
             <SmartContent content={q.context} className="text-xl font-bold text-[#000666] leading-relaxed" />
          </div>
          
          {q.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {Object.entries(q.options).map(([k, v]) => (
                 <div key={k} className="text-sm bg-[#F8F9FA] p-4 rounded-2xl border border-[#EDEEEF] flex items-center gap-4 hover:bg-white hover:shadow-md transition-all group/option">
                    <span className="font-black text-indigo-600 w-8 h-8 rounded-lg bg-indigo-50/50 flex items-center justify-center shrink-0 group-hover/option:bg-indigo-600 group-hover/option:text-white transition-colors">
                      {k}
                    </span>
                    <div className="font-medium text-[#000666] flex-1">
                      <SmartContent content={v as string} className="text-sm" />
                    </div>
                 </div>
               ))}
            </div>
          )}
       </div>

       {/* Answer & Analysis Section (Expandable) */}
       {isExpanded && q.answer && (
          <div className="bg-emerald-50/30 rounded-[30px] p-8 border border-emerald-100/50 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">正确答案</span>
                <div className="text-lg font-black text-emerald-700">
                   {q.answer.answer_content}
                </div>
             </div>
             
             {q.answer.analysis && (
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#767683] opacity-60">解析</span>
                  <div className="text-sm font-medium text-[#767683] leading-relaxed">
                     <SmartContent content={q.answer.analysis} />
                  </div>
               </div>
             )}
          </div>
       )}
    </div>
  );
});
