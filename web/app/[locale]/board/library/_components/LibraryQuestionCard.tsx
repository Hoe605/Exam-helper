'use client';

import { Trash2, Eye, ChevronDown, ChevronUp, Tags, Sparkles, User, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import SmartContent from "@/components/SmartContent";
import { memo, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { questionService } from "@/services/questionService";

interface LibraryQuestionCardProps {
  question: any;
  onDelete: (id: number) => void;
  onRefresh?: (id?: number) => void;
  t: any;
}

export const LibraryQuestionCard = memo(function LibraryQuestionCard({ 
  question: q, 
  onDelete,
  onRefresh,
  t
}: LibraryQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const { toast } = useToast();

  const handleAIClassify = async () => {
    if (q.nodes && q.nodes.length > 0) {
      toast({ title: "提示", description: "编辑分类待开发" });
      return;
    }

    setIsClassifying(true);
    try {
      const res = await questionService.classifyLibraryQuestion(q.id);
      if (res.success) {
        toast({ title: "完成", description: "AI 自动分类成功" });
        onRefresh?.(q.id);
      } else {
        toast({ 
          title: "分类失败", 
          description: res.errors?.[0] || "AI 引擎未能识别出合适的节点",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({ 
        title: "错误", 
        description: err.message || "分类服务暂时不可用", 
        variant: "destructive" 
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleManualClassify = () => {
    if (q.nodes && q.nodes.length > 0) {
      toast({ title: "提示", description: "编辑分类待开发" });
    } else {
      toast({ title: "提示", description: "手动分类待开发" });
    }
  };

  return (
    <div className="bg-white rounded-[40px] p-8 border border-transparent hover:border-indigo-500/20 shadow-2xl shadow-black/[0.02] hover:shadow-indigo-900/5 transition-all group relative overflow-hidden flex flex-col gap-6">
       {/* Row Header */}
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-4 flex-wrap">
             <Badge className="bg-[#F3F4F5] text-[#767683] border-none px-4 py-1.5 rounded-lg font-black text-[10px]">ID: #{q.id}</Badge>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] opacity-40 whitespace-nowrap">{q.q_type || 'General'}</span>
             
              {/* Knowledge Node Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                 {q.nodes && q.nodes.length > 0 ? (
                   q.nodes.map((node: any) => (
                     <Badge 
                       key={node.id} 
                       className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-3 py-1 rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1.5"
                     >
                       <div className="w-1 h-1 rounded-full bg-indigo-400" />
                       {node.name}
                     </Badge>
                   ))
                 ) : (
                   <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
                     未分类
                   </Badge>
                 )}
                 
                 {/* Difficulty Badge */}
                 {q.difficulty && q.difficulty > 0 && (
                    <Badge 
                      className={`
                        border-none px-3 py-1 rounded-lg font-black text-[10px] transition-colors
                        ${q.difficulty <= 3 ? 'bg-emerald-50 text-emerald-600' : 
                          q.difficulty <= 6 ? 'bg-amber-50 text-amber-600' : 
                          q.difficulty <= 8 ? 'bg-rose-50 text-rose-600' : 
                          'bg-purple-50 text-purple-600'}
                      `}
                    >
                      难度 {q.difficulty}
                    </Badge>
                 )}
              </div>
          </div>
          <div className="flex gap-3">
             {/* Classification Actions */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <button 
                     disabled={isClassifying}
                     className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-200 shadow-sm transition-colors active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 disabled:opacity-50"
                   >
                      {isClassifying ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Tags className="w-4 h-4 text-slate-500" />}
                      分类
                   </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-[#EDEEEF] shadow-2xl bg-white/80 backdrop-blur-xl">
                   <DropdownMenuItem 
                     onClick={handleManualClassify}
                     className="rounded-xl flex items-center gap-3 py-3 px-4 font-bold text-xs text-[#767683] hover:text-indigo-600 focus:bg-indigo-50/50 cursor-pointer transition-colors"
                   >
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <User className="w-4 h-4" />
                     </div>
                     手动分类
                   </DropdownMenuItem>
                   <DropdownMenuItem 
                     onClick={handleAIClassify}
                     className="rounded-xl flex items-center gap-3 py-3 px-4 font-bold text-xs text-indigo-600 hover:bg-indigo-50 focus:bg-indigo-50/50 cursor-pointer transition-colors"
                   >
                     <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                     </div>
                     AI 自动分类
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>

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
