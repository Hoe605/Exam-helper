'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useEffect } from 'react';
import { 
  Search, 
  AlertCircle,
  RotateCcw,
  Loader2,
  RefreshCcw,
  Layers,
  AlertTriangle,
  Copy,
  PlusCircle
} from "lucide-react";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/DashboardSidebar";
import DuplicateComparisonModal from "./DuplicateComparisonModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { useQuestionStore, StagingQuestion } from "@/store/useQuestionStore";

// Modular Components
import { StagingStatCard } from "./_components/StagingStatCard";
import { StagingQuestionCard } from "./_components/StagingQuestionCard";
import { LazyRender } from "./_components/LazyRender";

function StagingDeleteModal() {
  const deleteModal = useQuestionStore(s => s.deleteModal);
  const closeDeleteModal = useQuestionStore(s => s.closeDeleteModal);

  return (
    <DeleteConfirmationModal 
      isOpen={deleteModal.isOpen}
      title={deleteModal.title}
      description={deleteModal.description}
      onConfirm={deleteModal.onConfirm || (async () => {})}
      onClose={closeDeleteModal}
    />
  );
}

export default function StagingPage() {
  const t = useTranslations('Practice.staging');
  const tAdd = useTranslations('Practice.add');
  const { toast } = useToast();
  
  // High-performance Selectors - NO MORE deleteModal subscription here!
  const stagingQuestions = useQuestionStore(s => s.stagingQuestions);
  const stagingStats = useQuestionStore(s => s.stagingStats);
  const loading = useQuestionStore(s => s.loading);
  const error = useQuestionStore(s => s.error);
  
  const fetchStagingData = useQuestionStore(s => s.fetchStagingData);
  const updateStagingStatus = useQuestionStore(s => s.updateStagingStatus);
  const deleteStagingItem = useQuestionStore(s => s.deleteStagingItem);
  const openDuplicateModal = useQuestionStore(s => s.openDuplicateModal);

  // Still need the action, but NOT the state
  const openDeleteModal = useQuestionStore(s => s.openDeleteModal);

  useEffect(() => {
    fetchStagingData();
  }, [fetchStagingData]);

  const handleStatusUpdate = useCallback(async (id: number, status: string) => {
    const success = await updateStagingStatus(id, status);
    if (success) {
      toast({ title: "Success", description: `Item ${status} successfully.` });
    } else {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  }, [updateStagingStatus, toast]);

  const handleDelete = useCallback((id: number) => {
    openDeleteModal({
      title: "确认删除题目",
      description: "删除后该题目将从暂存池中移除，此操作无法撤销。",
      onConfirm: async () => {
        const success = await deleteStagingItem(id);
        if (success) {
          toast({ title: "Deleted", description: "Item removed." });
        }
      }
    });
  }, [openDeleteModal, deleteStagingItem, toast]);

  const handleViewDuplicate = useCallback((q: StagingQuestion) => {
    openDuplicateModal(q);
  }, [openDuplicateModal]);

  const statCards = useMemo(() => [
    { label: t('stats.pending'), value: stagingStats.pending.toString(), icon: Layers, color: "text-blue-600", border: "border-blue-600", bg: "bg-blue-50/50", queue: "QUEUE" },
    { label: t('stats.warnings'), value: stagingStats.warning.toString(), icon: AlertTriangle, color: "text-rose-600", border: "border-rose-600", bg: "bg-rose-50/50", queue: "CRITICAL" },
    { label: t('stats.duplicates'), value: stagingQuestions.filter(q => q.is_warning && q.duplicate_of_id).length.toString(), icon: Copy, color: "text-amber-600", border: "border-amber-600", bg: "bg-amber-50/50", queue: "SYSTEM" },
  ], [t, stagingStats, stagingQuestions]);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto p-12 relative flex flex-col gap-12">
        {/* Header */}
        <div className="flex justify-between items-end max-w-7xl mx-auto w-full">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#767683] font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                <Layers className="w-3.5 h-3.5" />
                Processing Terminal
              </div>
              <h1 className="text-5xl font-black text-[#000666] tracking-tighter leading-none">{t('title')}</h1>
              <p className="text-[#767683] font-medium max-w-xl leading-relaxed">{t('desc')}</p>
           </div>
           <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={fetchStagingData}
                className="rounded-2xl h-14 w-14 p-0 border-[#EDEEEF] bg-white shadow-xl shadow-black/5"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Link href="/board/staging/add">
                <Button variant="outline" className="rounded-2xl h-14 px-8 border-[#EDEEEF] bg-white shadow-xl shadow-black/5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-all">
                   <PlusCircle className="w-4 h-4" />
                   {tAdd('title')}
                </Button>
              </Link>

              <Button className="bg-[#1A237E] hover:bg-[#000666] text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-900/10">
                Process All (In Progress)
              </Button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
           {statCards.map((card, i) => (
             <StagingStatCard key={i} {...card} />
           ))}
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">
           <div className="flex items-center justify-between">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683] group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                   placeholder={t('search')} 
                   className="pl-12 pr-6 py-4 bg-white border border-[#EDEEEF] rounded-2xl w-96 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
                 />
              </div>
              <div className="flex gap-3">
                 <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-[#767683] hover:text-[#000666] hover:bg-[#F3F4F5]">
                    <RotateCcw className="w-4 h-4" />
                 </Button>
                 <Button variant="ghost" className="rounded-xl h-12 px-6 text-[#767683] hover:text-[#000666] hover:bg-[#F3F4F5] font-black uppercase tracking-widest text-[10px]">
                    Filters
                 </Button>
              </div>
           </div>

           {loading && stagingQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                 <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing...</span>
              </div>
           ) : error ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
                 <AlertCircle className="w-16 h-16 text-rose-500" />
                 <div>
                    <h3 className="text-xl font-black text-rose-900 uppercase tracking-widest">Connectivity Lost</h3>
                    <p className="text-rose-600 font-medium mt-2">{error}</p>
                 </div>
                 <Button onClick={fetchStagingData} className="bg-rose-600 text-white rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-[10px]">
                    Reconnect
                 </Button>
              </div>
           ) : (
              <div className="flex flex-col gap-6">
                 {stagingQuestions.map((q) => (
                   <LazyRender key={q.id} estimatedHeight={360} rootMargin="800px">
                     <StagingQuestionCard 
                       question={q} 
                       onApprove={(id) => handleStatusUpdate(id, 'approved')}
                       onDelete={handleDelete}
                       onViewDuplicate={handleViewDuplicate}
                       viewDuplicateLabel={t('viewDuplicate')}
                     />
                   </LazyRender>
                 ))}
              </div>
           )}
        </div>
      </main>

      <DuplicateComparisonModal />
      
      <StagingDeleteModal />
    </div>
  );
}
