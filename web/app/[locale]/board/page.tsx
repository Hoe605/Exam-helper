'use client';

import { useTranslations } from 'next-intl';
import { 
  BrainCircuit, 
  Bot, 
  Clock, 
  ChevronRight,
  History,
  Activity,
  Send,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  Library,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState, useEffect, useCallback } from 'react';
import { outlineService, Outline } from '@/services/outlineService';
import { nodeService, KnowledgeNode } from '@/services/nodeService';
import { practiceService } from '@/services/practiceService';
import SmartContent from '@/components/SmartContent';

export default function BoardPage() {
  const t = useTranslations('Practice');
  
  // Selection States
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [selectedOutline, setSelectedOutline] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  
  // Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loadingSelection, setLoadingSelection] = useState(false);

  // Fetch initial outlines
  useEffect(() => {
    const fetch = async () => {
       const data = await outlineService.getOutlines();
       setOutlines(data);
    };
    fetch();
  }, []);

  // Fetch nodes when outline changes
  useEffect(() => {
    const fetchNodes = async () => {
      if (!selectedOutline) {
        setNodes([]);
        return;
      }
      setLoadingSelection(true);
      try {
        const data = await nodeService.getNodesByOutline(selectedOutline);
        // Flatten nodes for simple selection in this practice view
        const flatten = (items: KnowledgeNode[]): KnowledgeNode[] => {
          return items.reduce((acc: KnowledgeNode[], item) => {
            return acc.concat([item], flatten(item.children || []));
          }, []);
        };
        setNodes(flatten(data));
      } finally {
        setLoadingSelection(false);
      }
    };
    fetchNodes();
  }, [selectedOutline]);

  const handleGenerate = useCallback(async () => {
    if (!selectedNode) return;
    
    setIsGenerating(true);
    setGeneratedContent('');
    
    try {
      const reader = await practiceService.generatePracticeStream(selectedNode);
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setGeneratedContent(prev => prev + chunk);
      }
    } catch (err) {
      console.error(err);
      setGeneratedContent(prev => prev + '\n[Error during generation]');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNode]);

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

        {/* Smart Generation Config */}
        <section className="bg-white rounded-[40px] p-10 border border-[#EDEEEF] shadow-2xl shadow-black/[0.02] max-w-5xl flex flex-col gap-8">
           <div className="flex items-center gap-10">
              <div className="flex-1 flex flex-col gap-3">
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

              <div className="flex-1 flex flex-col gap-3">
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

              <div className="pt-7">
                 <Button 
                   onClick={handleGenerate}
                   disabled={!selectedNode || isGenerating}
                   className="h-14 px-10 rounded-2xl bg-[#000666] hover:bg-[#1A237E] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-900/20 active:scale-95 transition-all group"
                 >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />}
                    {isGenerating ? 'AI 生成中...' : '开始生成题目'}
                 </Button>
              </div>
           </div>
        </section>

        {/* Problem Display Area */}
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
      </main>

      {/* 3. Right Sidebar */}
      <aside className="w-96 border-l border-[#EDEEEF] bg-white p-10 flex flex-col gap-10 overflow-y-auto">
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-[#000666]">
            <History className="w-4 h-4 text-indigo-600" />
            {t('attempts.title')}
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2].map((id) => (
              <div key={id} className="bg-[#F8F9FA] p-5 rounded-[24px] border border-transparent hover:border-indigo-500/20 transition-all group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-[#767683]">SESSION #{821 + id}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                </div>
                <div className="text-xs font-bold text-[#000666]">贝叶斯推断大题训练</div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-1 flex-1 bg-[#EDEEEF] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600">85%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-[#000666]">
            <Activity className="w-4 h-4 text-indigo-600" />
            AI 实时性能诊断
          </div>
          <div className="bg-[#1A237E] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex flex-col gap-6 relative z-10">
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                "当前生成题目聚焦于知识图谱中层次结构的叶子节点，主要考察联合分布的边缘化处理能力。"
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black text-indigo-300 tracking-widest mb-1">训练强度</span>
                  <span className="text-xl font-black">HIGH</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black text-indigo-300 tracking-widest mb-1">预估难度</span>
                  <span className="text-xl font-black">4.8 / 5</span>
                </div>
              </div>
            </div>
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

