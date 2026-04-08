'use client';

import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartContent from '@/components/SmartContent';
import { usePracticeStore } from '@/store/usePracticeStore';

export default function PracticeDisplay() {
  const { generatedContent, isGenerating } = usePracticeStore();

  return (
    <section className={`transition-all duration-700 max-w-5xl ${generatedContent || isGenerating ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'}`}>
       <div className="bg-white rounded-[50px] p-12 shadow-2xl shadow-black/[0.03] border border-[#EDEEEF] flex flex-col gap-10">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-lg font-black text-[10px]">AI-DRIVEN CONTENT</Badge>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] opacity-40">实时生成训练</span>
             </div>
          </div>

          <div className="min-h-[200px]">
             {!generatedContent && !isGenerating ? (
               <div className="h-full flex flex-col items-center justify-center gap-4 py-20 opacity-30">
                  <BrainCircuit className="w-16 h-16" />
                  <p className="font-black uppercase tracking-[0.3em] text-xs">Waiting for Knowledge Injection</p>
               </div>
             ) : (
               <div className="prose prose-indigo max-w-none">
                  <SmartContent content={generatedContent} className="text-2xl font-bold text-[#000666] leading-relaxed" />
                  {isGenerating && <span className="inline-block w-2 h-6 bg-indigo-600 animate-pulse ml-2" />}
               </div>
             )}
          </div>

          {generatedContent && !isGenerating && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="h-px bg-gradient-to-r from-transparent via-[#EDEEEF] to-transparent" />
               <div className="flex flex-col gap-4">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#767683]">Your Analysis</h3>
                  <textarea 
                    className="w-full bg-[#F8F9FA] rounded-[30px] p-8 min-h-[160px] text-lg font-medium text-[#000666] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all border-none resize-none shadow-inner"
                    placeholder="在此输入您的解析思路..."
                  />
                  <div className="flex justify-end gap-4">
                    <Button variant="ghost" className="rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] hover:text-[#000666]">查看 AI 解析</Button>
                    <Button className="bg-[#1A237E] hover:bg-[#000666] rounded-2xl h-14 px-12 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">
                      提交批改
                    </Button>
                  </div>
               </div>
            </div>
          )}
       </div>
    </section>
  );
}
