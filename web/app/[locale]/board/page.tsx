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
  BookOpen,
  School,
  AppWindow,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState, useEffect, useCallback } from 'react';
import { outlineService, Outline } from '@/services/outlineService';
import { nodeService, KnowledgeNode } from '@/services/nodeService';
import { practiceService } from '@/services/practiceService';
import { usePracticeStore } from '@/store/usePracticeStore';
import { courseService, Course } from '@/services/courseService';
import SmartContent from '@/components/SmartContent';


export default function BoardPage() {
  const t = useTranslations('Practice');
  
  // Persisted States from Zustand
  const { 
    selectedOutline, setSelectedOutline,
    selectedNode, setSelectedNode,
    difficulty, setDifficulty,
    qType, setQType,
    generatedContent, setGeneratedContent
  } = usePracticeStore();
  
  // Local UI States
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Handle Hydration mismatch for persisted store
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetch = async () => {
       try {
         const [outlinesData, coursesData] = await Promise.all([
           outlineService.getOutlines(),
           courseService.getMyCourses()
         ]);
         setOutlines(outlinesData);
         setMyCourses(coursesData || []);
       } catch (err) {
         console.error("Failed to fetch dashboard data:", err);
       }
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
        const flatten = (items: KnowledgeNode[]): KnowledgeNode[] => {
          return items.reduce((acc: KnowledgeNode[], item) => {
            return acc.concat([item], flatten(item.children || []));
          }, []);
        };
        setNodes(flatten(data));
      } catch (err) {
        console.error("Failed to fetch nodes:", err);
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
      const reader = await practiceService.generatePracticeStream(selectedNode, difficulty, qType);
      const decoder = new TextDecoder();
      
      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullContent += chunk;
        setGeneratedContent(fullContent);
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGeneratedContent(generatedContent + '\n[Error during generation]');

    } finally {
      setIsGenerating(false);
    }
  }, [selectedNode, difficulty, qType, setGeneratedContent]);

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

        {/* Smart Generation Config */}
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

      {/* 3. Right Sidebar - My Courses */}
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

