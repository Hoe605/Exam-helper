'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Copy, Loader2, AlertTriangle, Check, Trash2, X } from 'lucide-react';
import SmartContent from '@/components/SmartContent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuestionStore } from '@/store/useQuestionStore';

export default function DuplicateComparisonModal() {
  const { 
    isDuplicateModalOpen: isOpen, 
    closeDuplicateModal: onClose,
    duplicateConfig: dupeConfig,
    resolveDuplicate,
    deleteStagingItem,
    setSelectedId,
    setConfirmingSelection
  } = useQuestionStore();

  const currentQuestion = dupeConfig.current;
  const duplicateOfId = dupeConfig.originalId;
  const originalQuestion = dupeConfig.originalQuestion;
  const loading = dupeConfig.loadingOriginal;
  const selectedId = dupeConfig.selectedId;
  const confirmingSelection = dupeConfig.confirmingSelection;

  const openDeleteModal = useQuestionStore(s => s.openDeleteModal);

  if (!currentQuestion) return null;

  const handleConfirmAction = async () => {
    if (!currentQuestion || !duplicateOfId || !selectedId) return;

    const discardId = selectedId === currentQuestion.id ? duplicateOfId : currentQuestion.id;
    
    const success = await resolveDuplicate(selectedId, discardId);
    if (success) {
      setConfirmingSelection(false);
      onClose();
    }
  };

  const handleDiscardAll = () => {
    if (!currentQuestion || !duplicateOfId) return;
    
    openDeleteModal({
      title: "确认全部丢弃",
      description: "您正在舍弃当前待审项及已存在的题目，此操作不可恢复。",
      onConfirm: async () => {
          await Promise.all([
            deleteStagingItem(currentQuestion.id),
            deleteStagingItem(duplicateOfId)
          ]);
          onClose();
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="
        bg-[#F8F9FA] rounded-[40px] p-0 border border-[#EDEEEF]
        shadow-2xl shadow-black/10 overflow-hidden ring-0 max-w-6xl w-[92vw]
        [&>button:last-child]:hidden
      ">
        <AlertDialogHeader className="p-10 bg-white border-b border-[#EDEEEF] flex items-center justify-between sm:text-left">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm transition-all duration-300">
                <Copy className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <AlertDialogTitle className="text-2xl font-black text-[#000666] tracking-tight">
                    重复内容对比审核
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs font-bold text-[#767683] flex items-center gap-2">
                   Please select one version to proceed.
                </AlertDialogDescription>
              </div>
           </div>
           <button onClick={onClose} className="p-3 rounded-full hover:bg-rose-50 text-[#767683] hover:text-rose-500 transition-all">
              <X className="w-6 h-6" />
           </button>
        </AlertDialogHeader>

        <div className="p-10 grid grid-cols-2 gap-12 min-h-[500px]">
           {/* Left Column: Original */}
           <div 
             onClick={() => originalQuestion && setSelectedId(duplicateOfId || null)}
             className={`flex flex-col gap-6 cursor-pointer group transition-all p-1 rounded-[40px] ring-offset-8 ring-offset-[#F8F9FA] 
               ${selectedId === duplicateOfId ? 'ring-4 ring-indigo-600' : 'hover:ring-4 hover:ring-slate-300/50'}`}
           >
              <div className="flex items-center justify-between px-6">
                 <div className="flex flex-col gap-1">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors 
                      ${selectedId === duplicateOfId ? 'text-indigo-600' : 'text-[#767683]'}`}>已有项 (Original)</span>
                 </div>
                 {selectedId === duplicateOfId && (
                   <div className="bg-indigo-600 text-white p-1 rounded-full shadow-lg shadow-indigo-600/30 animate-in fade-in zoom-in duration-200">
                      <Check className="w-4 h-4" />
                   </div>
                 )}
              </div>
              
              <div className={`bg-white rounded-[40px] p-10 border transition-all flex-1 overflow-y-auto max-h-[60vh] shadow-sm relative 
                ${selectedId === duplicateOfId ? 'border-indigo-600 shadow-indigo-900/10' : 'border-[#EDEEEF]'}`}>
                 {loading ? (
                    <div className="h-full flex items-center justify-center py-20">
                       <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    </div>
                 ) : originalQuestion ? (
                    <div className="flex flex-col gap-8 text-[#000666]">
                       <SmartContent content={originalQuestion.context} className="text-xl font-bold leading-relaxed" />
                       {originalQuestion.options && (
                          <div className="grid gap-3">
                             {Object.entries(originalQuestion.options).map(([k, v]) => (
                                <div key={k} className="text-xs bg-[#F3F4F5] p-5 rounded-2xl flex gap-5">
                                   <span className="font-black text-indigo-600">{k}</span>
                                   <span className="font-medium text-[#1A237E]/80">{v as string}</span>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 py-20 text-center">
                       <AlertTriangle className="w-12 h-12 mb-4" />
                       <span className="text-xs font-black uppercase tracking-widest text-[#767683]">Question Not Found</span>
                    </div>
                 )}
              </div>
           </div>

           {/* Right Column: Candidate */}
           <div 
             onClick={() => setSelectedId(currentQuestion.id)}
             className={`flex flex-col gap-6 cursor-pointer group transition-all p-1 rounded-[40px] ring-offset-8 ring-offset-[#F8F9FA] 
               ${selectedId === currentQuestion.id ? 'ring-4 ring-amber-500' : 'hover:ring-4 hover:ring-amber-300/30'}`}
           >
              <div className="flex items-center justify-between px-6">
                 <div className="flex flex-col gap-1">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors 
                      ${selectedId === currentQuestion.id ? 'text-amber-600' : 'text-[#767683]'}`}>待审项 (Candidate)</span>
                 </div>
                 {selectedId === currentQuestion.id && (
                   <div className="bg-amber-500 text-white p-1 rounded-full shadow-lg shadow-amber-500/30 animate-in fade-in zoom-in duration-200">
                      <Check className="w-4 h-4" />
                   </div>
                 )}
              </div>
              
              <div className={`bg-white rounded-[40px] p-10 border transition-all flex-1 overflow-y-auto max-h-[60vh] shadow-sm relative 
                ${selectedId === currentQuestion.id ? 'border-amber-500 shadow-amber-900/10' : 'border-[#EDEEEF]'}`}>
                 <div className="flex flex-col gap-8 text-[#000666]">
                    <SmartContent content={currentQuestion.context} className="text-xl font-bold leading-relaxed" />
                    {currentQuestion.options && (
                        <div className="grid gap-3">
                           {Object.entries(currentQuestion.options).map(([k, v]) => (
                              <div key={k} className="text-xs bg-amber-50/50 p-5 rounded-2xl flex gap-5 border border-amber-100/30">
                                 <span className="font-black text-amber-600">{k}</span>
                                 <span className="font-medium text-amber-900/70">{v as string}</span>
                              </div>
                           ))}
                        </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <AlertDialogFooter className="p-10 justify-between gap-6 bg-white border-t border-[#EDEEEF]">
           <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleDiscardAll}
                className="rounded-2xl h-16 px-10 font-black uppercase tracking-[0.2em] text-[10px] text-rose-600 hover:bg-rose-50 border-rose-100 transition-all hover:scale-105 active:scale-95"
              >
                全部丢弃 (Discard All)
              </Button>
              <AlertDialogCancel
                onClick={onClose}
                className="rounded-2xl h-16 px-10 font-black uppercase tracking-[0.2em] text-[10px] m-0 border-[#EDEEEF] hover:bg-[#F3F4F5] transition-all hover:scale-105 active:scale-95"
              >
                暂不处理
              </AlertDialogCancel>
           </div>
           
           <Button
             disabled={!selectedId}
             onClick={() => setConfirmingSelection(true)}
             className={`
               rounded-2xl h-16 px-16
               font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all
               ${!selectedId ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 
                 selectedId === duplicateOfId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20 hover:scale-105 active:scale-95' : 
                                              'bg-amber-500 hover:bg-amber-600 shadow-amber-900/20 hover:scale-105 active:scale-95'}
               shadow-2xl flex items-center gap-3
             `}
           >
             <Check className="w-5 h-5 transition-transform duration-500 group-hover:scale-125" />
             保留所选版本 (Keep Selected)
           </Button>
        </AlertDialogFooter>

        {/* Action Confirmation Overlay */}
        {confirmingSelection && (
           <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-20 animate-in fade-in zoom-in duration-300">
              <div className={`w-24 h-24 rounded-[32px] ${selectedId === duplicateOfId ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center mb-8 shadow-inner`}>
                 <AlertTriangle className="w-12 h-12 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-[#000666] tracking-tighter text-center max-w-md">
                 确认保留该版本吗？
              </h3>
              <p className="text-[#767683] font-medium text-center mt-4 max-w-sm">
                 确认后，未被选择的版本将被永久丢弃，此操作无法撤销。
              </p>
              <div className="flex gap-6 mt-12 w-full max-w-md">
                 <Button 
                   variant="outline" 
                   onClick={() => setConfirmingSelection(false)}
                   className="flex-1 rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-[10px] border-[#EDEEEF] hover:bg-slate-50 transition-all hover:scale-105"
                 >
                    取消
                 </Button>
                 <Button 
                    onClick={handleConfirmAction}
                    className={`flex-1 rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all hover:scale-105 active:scale-95 
                      ${selectedId === duplicateOfId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                 >
                    确认保留
                 </Button>
              </div>
           </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
