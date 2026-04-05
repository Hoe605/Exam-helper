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
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { questionService } from "@/services/questionService";
import { outlineService, Outline } from "@/services/outlineService";

// Modular Components
import { LibraryQuestionCard } from "./_components/LibraryQuestionCard";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function LibraryPage() {
  const t = useTranslations('Practice.library');
  const tBtn = useTranslations('Practice.outline.actions');
  const { toast } = useToast();
  
  // States
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | undefined>(undefined);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const fetchData = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const [questionsData, outlinesData] = await Promise.all([
        questionService.getLibraryQuestions({ 
          outline_id: selectedOutlineId, 
          skip: isLoadMore ? skip + limit : 0, 
          limit 
        }),
        outlineService.getOutlines()
      ]);
      
      if (isLoadMore) {
        setQuestions(prev => [...prev, ...questionsData.items]);
        setSkip(prev => prev + limit);
      } else {
        setQuestions(questionsData.items);
        setSkip(0);
      }
      
      setTotal(questionsData.total);
      setOutlines(outlinesData);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedOutlineId, skip]);

  useEffect(() => {
    fetchData();
  }, [selectedOutlineId, fetchData]);

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
                <RefreshCcw className={`w-4 h-4 ${loading && skip === 0 ? 'animate-spin' : ''}`} />
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
                 <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-[#EDEEEF]">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <select 
                      value={selectedOutlineId || ''}
                      onChange={(e) => setSelectedOutlineId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-xs font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer"
                    >
                       <option value="">{t('filterOutline')}</option>
                       {outlines.map(o => (
                         <option key={o.id} value={o.id}>{o.name}</option>
                       ))}
                    </select>
                 </div>
                 <Button variant="ghost" className="rounded-xl h-12 px-6 text-[#767683] hover:text-[#000666] hover:bg-[#F3F4F5] font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t('filterType')}
                 </Button>
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
           ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                 <BookOpen className="w-16 h-16 text-[#767683]" />
                 <span className="text-[10px] font-black uppercase tracking-widest">库中暂无题目，待审核通过。</span>
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
    </div>
  );
}
