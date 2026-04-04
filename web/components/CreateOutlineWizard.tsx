'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Activity,
  AlertCircle,
  FileUp,
  FileText,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { outlineService } from '@/services/outlineService';


interface CreateOutlineWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function CreateOutlineWizard({ onClose, onComplete }: CreateOutlineWizardProps) {
  const t = useTranslations('Practice.outline.wizard');
  const commonT = useTranslations('Practice.outline');
  
  const [step, setStep] = useState<'form' | 'processing'>('form');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [outlineId, setOutlineId] = useState<number | null>(null);
  
  const [progress, setProgress] = useState<{
    step: string;
    nodeCount: number;
    tasks: Record<string, string>;
    isAwaitingReview?: boolean;
    plan?: any[];
  }>({
    step: 'Initializing...',
    nodeCount: 0,
    tasks: {}
  });
  
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setContent(text);
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!name || !content) return;
    
    setStep('processing');
    setError(null);

    try {
      const reader = await outlineService.extractOutline({ name, content });
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                setStep('form');
                onComplete();
                return;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.error) {
                  setError(data.error);
                  return;
                }
                
                const currentId = data.outline_id || data.snapshot?.outline_id;
                if (currentId) {
                  setOutlineId(currentId);
                }

                setProgress({
                  step: data.step,
                  nodeCount: data.node_count,
                  tasks: data.tasks || {},
                  isAwaitingReview: !!data.is_awaiting_review,
                  plan: data.plan
                });
              } catch (e) {
                console.error("Parse error on chunk:", dataStr.substring(0, 100) + "...", e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Extraction failed");
    }
  };

  const submitFeedback = async (val: string) => {
    if (!outlineId) return;
    setIsSubmittingFeedback(true);
    try {
      await outlineService.submitFeedback(outlineId, val);
      // 成功后由 StreamingResponse 继续推送状态，这里只需关闭本地提示
      setProgress(prev => ({ ...prev, isAwaitingReview: false }));
      setFeedback('');
    } catch (err) {
      alert("Failed to send feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };


  return (
    <Card className="flex flex-col h-full bg-white rounded-[48px] shadow-2xl shadow-indigo-900/10 overflow-hidden border-[#EDEEEF]">
      <CardHeader className="p-10 border-b border-[#EDEEEF] flex flex-row justify-between items-center bg-slate-50/50 space-y-0">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-[#1A237E] font-black text-[10px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              {t('title')}
           </div>
           <CardTitle className="text-3xl font-black text-[#000666] tracking-tight">
             {step === 'form' ? t('subtitle') : progress.isAwaitingReview ? "Action Required: Review Plan" : t('processing')}
           </CardTitle>
           <CardDescription className="text-xs font-medium text-[#767683]">
             {t('desc')}
           </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-white hover:shadow-lg transition-all text-[#767683] h-12 w-12">
           <X className="w-6 h-6" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        {step === 'form' ? (
          <div className="max-w-3xl mx-auto flex flex-col gap-10">
             {/* ... form content ... */}
             <div className="flex flex-col gap-4">
                <label className="text-xs font-black uppercase tracking-widest text-[#767683] px-1">{t('nameLabel')}</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="bg-[#F8F9FA] border-2 border-transparent focus-visible:border-[#1A237E]/20 rounded-3xl h-20 px-8 text-xl font-bold text-[#000666] placeholder:text-[#767683]/30 transition-all outline-none"
                />
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end px-1">
                   <label className="text-xs font-black uppercase tracking-widest text-[#767683]">{t('contentLabel')}</label>
                   <Button 
                     variant="outline" 
                     className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest border-[#EDEEEF] hover:border-[#1A237E] hover:text-[#1A237E] transition-all gap-2"
                     onClick={() => fileInputRef.current?.click()}
                   >
                      <FileUp className="w-3 h-3" />
                      {t('importFile')}
                   </Button>
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".md,.txt" className="hidden" />
                </div>
                <div className="relative group">
                   <Textarea 
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder={t('contentPlaceholder')}
                     className="bg-[#F8F9FA] border-2 border-transparent focus-visible:border-[#1A237E]/20 rounded-[32px] p-8 text-lg font-medium text-[#000666] placeholder:text-[#767683]/30 transition-all outline-none min-h-[400px] leading-relaxed resize-none shadow-sm focus-visible:bg-white"
                   />
                   {content.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 flex-col gap-3">
                         <FileText className="w-12 h-12 text-[#767683]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#767683]">{t('importPrompt')}</span>
                      </div>
                   )}
                </div>
             </div>
          </div>
        ) : (progress.isAwaitingReview || progress.step === 'human_review') && progress.plan ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

             <div className="bg-[#1A237E] text-white p-10 rounded-[40px] flex items-center gap-8 shadow-2xl shadow-indigo-900/20">
                <div className="p-4 bg-white/10 rounded-full">
                   <Activity className="w-10 h-10 text-indigo-200" />
                </div>
                <div>
                   <h3 className="text-2xl font-black tracking-tight">{t('planTable.approve')}</h3>
                   <p className="text-indigo-100 opacity-70 font-medium">{t('processingDesc')}</p>
                </div>
             </div>

             {/* Plan Table */}
             <div className="bg-white rounded-[40px] border-2 border-[#EDEEEF] overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-[#767683]">
                         <th className="py-6 px-8 text-left">{t('planTable.step')}</th>
                         <th className="py-6 px-8 text-left">{t('planTable.task')}</th>
                         <th className="py-6 px-8 text-left">{t('planTable.start')}</th>
                         <th className="py-6 px-8 text-left">{t('planTable.end')}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#EDEEEF]">
                      {progress.plan?.map((task, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-6 px-8 font-black text-[#1A237E]">{idx + 1}</td>
                           <td className="py-6 px-8 text-sm font-bold text-[#000666] leading-relaxed">{task.task_description}</td>
                           <td className="py-6 px-8"><Badge variant="outline" className="bg-slate-100 border-none text-[10px] font-bold text-[#767683] truncate max-w-[120px] inline-block">{task.start_anchor}</Badge></td>
                           <td className="py-6 px-8"><Badge variant="outline" className="bg-slate-100 border-none text-[10px] font-bold text-[#767683] truncate max-w-[120px] inline-block">{task.end_anchor}</Badge></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Feedback and Continue */}
             <div className="flex flex-col gap-6 p-10 bg-slate-50/50 rounded-[40px] border border-[#EDEEEF]">
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#767683] flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('planTable.modify')}
                   </label>
                   <Input 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={t('planTable.placeholder')}
                      className="bg-white border-2 border-[#EDEEEF] focus:border-[#1A237E]/20 rounded-2xl h-16 px-6 font-bold text-[#000666] shadow-sm"
                   />
                </div>
                <div className="flex gap-4">
                   <Button 
                     onClick={() => submitFeedback('y')}
                     disabled={isSubmittingFeedback}
                     className="flex-1 bg-[#000666] hover:bg-[#1A237E] text-white h-16 rounded-[24px] font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-indigo-900/20"
                   >
                      {isSubmittingFeedback ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
                      {t('planTable.approve')}
                   </Button>
                   {feedback && (
                      <Button 
                        onClick={() => submitFeedback(feedback)}
                        disabled={isSubmittingFeedback}
                        variant="outline"
                        className="flex-1 h-16 rounded-[24px] border-[#000666] text-[#000666] border-2 font-black uppercase tracking-widest text-xs"
                      >
                         {t('planTable.modify')}
                      </Button>
                   )}
                </div>
             </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-12 py-10 items-center">
            {/* ... same progress indicator ... */}
            <div className="relative">
               <div className="w-48 h-48 rounded-full border-4 border-[#E0E0FF] border-t-[#1A237E] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                     <span className="text-4xl font-black text-[#1A237E]">{progress.nodeCount}</span>
                     <span className="text-[10px] font-bold text-[#767683] tracking-widest uppercase">{t('nodesFound')}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#1A237E] animate-pulse" />
                  <span className="text-xl font-black text-[#000666] uppercase tracking-widest">{progress.step}</span>
               </div>
               <p className="text-[#767683] font-medium text-center">{t('processingDesc')}</p>
            </div>

            <Card className="w-full bg-[#F8F9FA] border-none rounded-[32px] shadow-none overflow-hidden">
               <CardHeader className="py-6 px-8 border-b border-[#EDEEEF]/50">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#767683]">{t('taskMonitor')}</CardTitle>
               </CardHeader>
               <CardContent className="p-8 flex flex-col gap-4">
                  {Object.entries(progress.tasks).map(([task, status], i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#EDEEEF]/50 last:border-none">
                       <div className="flex items-center gap-3">
                          {status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Loader2 className="w-4 h-4 text-[#1A237E] animate-spin" />}
                          <span className={`text-sm font-bold ${status === 'completed' ? 'text-[#767683] line-through' : 'text-[#000666]'}`}>{task}</span>
                       </div>
                       <Badge variant="outline" className={`text-[9px] font-black uppercase border-none ${status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>{status}</Badge>
                    </div>
                  ))}
               </CardContent>
            </Card>

            {error && (
               <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div className="flex flex-col gap-1">
                     <span className="text-sm font-black text-rose-900 uppercase tracking-widest">Extraction Error</span>
                     <p className="text-xs font-bold text-rose-600">{error}</p>
                  </div>
                  <Button onClick={() => setStep('form')} className="bg-rose-600 hover:bg-rose-700 h-8 px-4 py-0 text-[9px] font-black uppercase">{t('retry')}</Button>
               </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      {step === 'form' && (
        <CardFooter className="p-10 border-t border-[#EDEEEF] flex justify-end gap-6 bg-slate-50/50">
           <Button variant="ghost" onClick={onClose} className="rounded-2xl h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] text-[#767683]">
             {commonT('actions.cancel')}
           </Button>
           <Button onClick={handleGenerate} disabled={!name || !content} className="bg-[#000666] hover:bg-[#1A237E] text-white rounded-2xl h-14 px-12 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-900/20 flex items-center gap-4 disabled:opacity-30">
              <Send className="w-4 h-4" />
              {commonT('actions.generate')}
           </Button>
        </CardFooter>
      )}
    </Card>
  );
}
