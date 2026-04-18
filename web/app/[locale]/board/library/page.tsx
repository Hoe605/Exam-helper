'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  AlertCircle,
  Loader2,
  RefreshCcw,
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { questionService } from "@/services/questionService";
import { outlineService, Outline } from "@/services/outlineService";

// Modular Components
import { LibraryQuestionCard } from "./_components/LibraryQuestionCard";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useLibraryStore } from "@/store/useLibraryStore";
import { nodeService, KnowledgeNode } from "@/services/nodeService";

export default function LibraryPage() {
  const t = useTranslations('Practice.library');
  const tBtn = useTranslations('Practice.outline.actions');
  const { toast } = useToast();
  
  const { 
    selectedOutlineId, 
    setSelectedOutlineId, 
    selectedNodeId, 
    setSelectedNodeId,
    searchQuery,
    setSearchQuery
  } = useLibraryStore();
  
  // States
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering
  const limit = 20;

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  // AI Classify Modal
  const [aiClassifyModalOpen, setAiClassifyModalOpen] = useState(false);
  const [classifying, setClassifying] = useState(false);

  // Fetch Nodes when outline changes
  useEffect(() => {
    if (selectedOutlineId) {
       nodeService.getNodesByOutline(selectedOutlineId).then(data => {
          const extractLevel2 = (tree: KnowledgeNode[]): KnowledgeNode[] => {
             let res: KnowledgeNode[] = [];
             tree.forEach(n => {
                if (n.level === 2) res.push(n);
                if (n.children) res = [...res, ...extractLevel2(n.children)];
             });
             return res;
          };
          setNodes(extractLevel2(data));
       });
    } else {
       setNodes([]);
    }
  }, [selectedOutlineId]);

  // Initial load of outlines
  useEffect(() => {
    outlineService.getOutlines().then(data => {
      setOutlines(data);
    }).catch(err => {
      console.error("Failed to load outlines:", err);
    });
  }, []);

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (!selectedOutlineId) {
      setQuestions([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const currentSkip = isLoadMore ? questions.length : 0;
      const questionsData = await questionService.getLibraryQuestions({ 
          outline_id: selectedOutlineId,
          node_id: selectedNodeId || undefined,
          skip: currentSkip, 
          limit 
      });
      
      if (isLoadMore) {
        setQuestions(prev => [...prev, ...questionsData.items]);
      } else {
        setQuestions(questionsData.items);
      }
      
      setTotal(questionsData.total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedOutlineId, selectedNodeId, limit, questions.length]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOutlineId, selectedNodeId]);

  const handleDelete = useCallback(async () => {
    if (deleteModal.id === null) return;
    try {
       await questionService.deleteLibraryQuestion(deleteModal.id);
       toast({ title: "Deleted", description: "Question removed from library." });
       setQuestions(prev => prev.filter(q => q.id !== deleteModal.id));
       setTotal(prev => prev - 1);
       setDeleteModal({ isOpen: false, id: null });
    } catch (err: any) {
       toast({ title: "Error", description: err.message || "Failed to delete question", variant: "destructive" });
    }
  }, [deleteModal.id, toast]);

  const handleRefresh = useCallback(async (id?: number) => {
    if (id) {
      try {
        const updatedQ = await questionService.getQuestionDetail(id);
        setQuestions(prev => prev.map(q => q.id === id ? updatedQ : q));
        return;
      } catch (err) {
        console.error("Single item refresh failed, falling back to full refresh", err);
      }
    }
    fetchData();
  }, [fetchData]);

  const handleAIClassify = useCallback(async () => {
    if (!selectedOutlineId) return;
    
    setClassifying(true);
    try {
      const res = await questionService.classifyUncategorized(selectedOutlineId);
      toast({ 
        title: "AI 分类完成", 
        description: `成功处理 ${res.processed_count} 道题目，其中 ${res.success_count} 道分类成功。` 
      });
      fetchData();
    } catch (err: any) {
      toast({ 
        title: "分类失败", 
        description: err.message || "AI 分类过程中出现错误", 
        variant: "destructive" 
      });
    } finally {
      setClassifying(false);
    }
  }, [selectedOutlineId, fetchData, toast]);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto p-12 relative flex flex-col gap-12">
        {/* Header */}
        <div className="flex justify-between items-end max-w-7xl mx-auto w-full">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#767683] font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Library Knowledge Store
              </div>
              <h1 className="text-5xl font-black text-[#000666] tracking-tighter leading-none">{t('title')}</h1>
              <p className="text-[#767683] font-medium max-w-xl leading-relaxed">{t('desc')}</p>
           </div>
           <div className="flex gap-4">
              <div className="flex flex-col items-end gap-2 pr-4 border-r border-[#EDEEEF]">
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#767683] opacity-60">{t('total')}</span>
                 <span className="text-2xl font-black text-[#1A237E]">{total}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fetchData()}
                className="rounded-2xl h-14 w-14 p-0 border-[#EDEEEF] bg-white shadow-xl shadow-black/5"
              >
                <RefreshCcw className={`w-4 h-4 ${loading && (questions.length === 0) ? 'animate-spin' : ''}`} />
              </Button>
           </div>
        </div>

        {/* Search & Filters */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
           <div className="flex items-center justify-between">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683] group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                   placeholder={t('search')} 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-12 pr-6 py-4 bg-white border border-[#EDEEEF] rounded-2xl w-96 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
                 />
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-[#EDEEEF] focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <select 
                      value={selectedOutlineId || ''}
                      onChange={(e) => setSelectedOutlineId(e.target.value ? parseInt(e.target.value) : null)}
                      className="text-xs font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer max-w-[200px]"
                    >
                       <option value="">{t('filterOutline')}</option>
                       {outlines.map(o => (
                         <option key={o.id} value={o.id}>{o.name}</option>
                       ))}
                    </select>
                 </div>

                 {selectedOutlineId && (
                   <Button 
                     onClick={() => setAiClassifyModalOpen(true)}
                     disabled={classifying || loading}
                     className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all"
                   >
                     {classifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                     {classifying ? 'AI 分类中...' : '一键 AI 分类'}
                   </Button>
                 )}

                 {selectedOutlineId && (
                   <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-[#EDEEEF] focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all animate-in fade-in slide-in-from-left-2 duration-300">
                      <Filter className="w-4 h-4 text-indigo-600" />
                      <select 
                        value={selectedNodeId || ''}
                        onChange={(e) => setSelectedNodeId(e.target.value ? parseInt(e.target.value) : null)}
                        className="text-xs font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer max-w-[200px]"
                      >
                         <option value="">知识点过滤</option>
                         <option value="-1">未分类题目</option>
                         {nodes.map(n => (
                           <option key={n.id} value={n.id}>{n.name}</option>
                         ))}
                      </select>
                   </div>
                 )}
              </div>
           </div>

           {/* Content List */}
           {loading && questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                 <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Accessing Library...</span>
              </div>
           ) : error ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
                 <AlertCircle className="w-16 h-16 text-rose-500" />
                 <div>
                    <h3 className="text-xl font-black text-rose-900 uppercase tracking-widest">Connectivity Lost</h3>
                    <p className="text-rose-600 font-medium mt-2">{error}</p>
                 </div>
                 <Button onClick={() => fetchData()} className="bg-rose-600 text-white rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-[10px]">
                    Reconnect
                 </Button>
              </div>
           ) : !selectedOutlineId ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                 <BookOpen className="w-16 h-16 text-[#767683]" />
                 <span className="text-[10px] font-black uppercase tracking-widest">请先在大纲过滤器中选择一个考试大纲。</span>
              </div>
           ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                 <BookOpen className="w-16 h-16 text-[#767683]" />
                 <span className="text-[10px] font-black uppercase tracking-widest">该大纲（或节点）暂无题目内容。</span>
              </div>
           ) : (
              <div className="flex flex-col gap-6 pb-20">
                 {questions
                   .filter(q => q.context.toLowerCase().includes(searchQuery.toLowerCase()))
                   .map((q) => (
                    <LibraryQuestionCard 
                      key={q.id} 
                      question={q} 
                      t={t}
                      onDelete={(id) => setDeleteModal({ isOpen: true, id })}
                      onRefresh={handleRefresh}
                    />
                 ))}
                 
                 {questions.length < total && (
                    <Button 
                      onClick={() => fetchData(true)}
                      disabled={loading}
                      variant="ghost"
                      className="mt-8 rounded-2xl h-16 border-2 border-dashed border-[#EDEEEF] w-full text-xs font-black uppercase tracking-[0.2em] text-[#767683] hover:bg-white hover:border-indigo-600 transition-all"
                    >
                       {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '加载更多题库内容'}
                    </Button>
                 )}
              </div>
           )}
        </div>
      </main>

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="确认从题库中移除"
        description="此操作将永久从题库中删除该题目，无法撤销。"
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
      />

      <DeleteConfirmationModal 
        isOpen={aiClassifyModalOpen}
        title="确认启动 AI 分类"
        description="此操作将调用 AI Agent 将所有未分类题目自动归类到对应的章节。这可能需要一些时间。"
        confirmText="开始分类"
        cancelText="取消"
        variant="primary"
        onConfirm={handleAIClassify}
        onClose={() => setAiClassifyModalOpen(false)}
      />
    </div>
  );
}
