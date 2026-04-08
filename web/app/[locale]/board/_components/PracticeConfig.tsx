'use client';

import { Library, BookOpen, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePracticeStore } from '@/store/usePracticeStore';

export default function PracticeConfig() {
  const { 
    outlines,
    nodes,
    loadingSelection,
    isGenerating,
    handleGenerate,
    selectedOutline, setSelectedOutline,
    selectedNode, setSelectedNode,
    difficulty, setDifficulty,
    qType, setQType
  } = usePracticeStore();

  return (
    <section className="bg-white rounded-[40px] p-10 border border-[#EDEEEF] shadow-2xl shadow-black/[0.02] max-w-5xl flex flex-col gap-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-3">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] pl-2">1. 选择科目/大纲</label>
             <div className="relative">
                <Library className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683]" />
                <select 
                  value={selectedOutline || ''}
                  onChange={(e) => setSelectedOutline(Number(e.target.value))}
                  className="w-full pl-12 pr-6 py-4 bg-[#F8F9FA] rounded-2xl border-none text-sm font-bold text-[#000666] appearance-none focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer"
                >
                   <option value="" disabled>请选择科目...</option>
                   {outlines.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] pl-2">2. 指定知识点</label>
             <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683]" />
                <select 
                  disabled={!selectedOutline || loadingSelection}
                  value={selectedNode || ''}
                  onChange={(e) => setSelectedNode(Number(e.target.value))}
                  className="w-full pl-12 pr-6 py-4 bg-[#F8F9FA] rounded-2xl border-none text-sm font-bold text-[#000666] appearance-none focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer disabled:opacity-40"
                >
                   <option value="" disabled>{loadingSelection ? '加载中...' : '选择目标知识点...'}</option>
                   {nodes.map(n => (
                     <option key={n.id} value={n.id}>
                        {'· '.repeat(n.level)} {n.name}
                     </option>
                   ))}
                </select>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-[#F8F9FA] pt-10">
          <div className="flex flex-col gap-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] pl-2">3. 训练难度</label>
             <div className="flex gap-2 bg-[#F8F9FA] p-1.5 rounded-2xl">
                {['简单', '中等', '困难'].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setDifficulty(lv)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                      difficulty === lv 
                        ? 'bg-white text-[#000666] shadow-sm scale-[1.02]' 
                        : 'text-[#767683] hover:text-[#000666] hover:bg-white/50'
                    }`}
                  >
                    {lv}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] pl-2">4. 题目偏好</label>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {['单选题', '多选题', '填空题', '解答题'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setQType(type)}
                    className={`py-3 rounded-xl text-[10px] font-black transition-all border ${
                      qType === type 
                        ? 'bg-[#000666] text-white border-transparent' 
                        : 'bg-transparent text-[#767683] border-[#EDEEEF] hover:border-indigo-200'
                    }`}
                  >
                    {type.replace('题', '')}
                  </button>
                ))}
             </div>
          </div>
       </div>

       <div className="flex justify-center mt-2">
          <Button 
            onClick={handleGenerate}
            disabled={!selectedNode || isGenerating}
            className="h-16 px-16 rounded-[2rem] bg-[#000666] hover:bg-[#1A237E] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-900/30 active:scale-95 transition-all group overflow-hidden relative"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <RefreshCw className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />}
             {isGenerating ? '正在构建训练环境...' : '立即生成高质量题目'}
          </Button>
       </div>
    </section>
  );
}
