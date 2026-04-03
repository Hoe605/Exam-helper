'use client';

import { Check, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartContent from "@/components/SmartContent";
import { StagingQuestion } from "@/store/useQuestionStore";

interface StagingQuestionCardProps {
  question: StagingQuestion;
  onApprove: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDuplicate: (q: StagingQuestion) => void;
  viewDuplicateLabel: string;
}

import { memo } from 'react';

export const StagingQuestionCard = memo(function StagingQuestionCard({ 
  question: q, 
  onApprove, 
  onDelete, 
  onViewDuplicate,
  viewDuplicateLabel
}: StagingQuestionCardProps) {
  return (
    <div className="bg-white rounded-[40px] p-10 border border-transparent hover:border-indigo-500/20 shadow-2xl shadow-black/[0.02] hover:shadow-indigo-900/5 transition-all group relative overflow-hidden flex flex-col gap-8">
       {/* Row Header */}
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
             <Badge className="bg-[#F3F4F5] text-[#767683] border-none px-4 py-1.5 rounded-lg font-black text-[10px]">ID: #{q.id}</Badge>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] opacity-40">{q.q_type || 'General'}</span>
          </div>
          <div className="flex gap-3">
             {q.is_warning && (q.duplicate_of_id || q.duplicate_of_formal_id) && (
               <Button 
                 onClick={() => onViewDuplicate(q)}
                 className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-none rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[9px] flex items-center gap-2 active:scale-95"
               >
                 <Copy className="w-4 h-4" />
                 {viewDuplicateLabel}
               </Button>
             )}
             <button 
               onClick={() => onApprove(q.id)}
               className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm transition-colors active:scale-95"
             >
                <Check className="w-5 h-5" />
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
       <div className="flex flex-col gap-10">
          <div className="min-w-0">
             <SmartContent content={q.context} className="text-xl font-bold text-[#000666] leading-relaxed" />
          </div>
          
          {q.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.entries(q.options).map(([k, v]) => (
                 <div key={k} className="text-sm bg-[#F8F9FA] p-5 rounded-2xl border border-[#EDEEEF] flex items-center gap-5 hover:bg-white hover:shadow-md transition-all group/option">
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

       {/* Warnings / Footer */}
       {q.is_warning && q.warning_reason && (
          <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100/50 flex items-center gap-4">
             <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
             <p className="text-xs font-bold text-rose-600 italic leading-tight">
                {q.warning_reason} {q.error_msg && `- ${q.error_msg}`}
             </p>
          </div>
       )}
    </div>
  );
});
