'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  PlusCircle, 
  BookOpen, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Cpu,
  Layers,
  ArrowLeft,
  Search,
  FileUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/i18n/routing';

import { outlineService, Outline } from '@/services/outlineService';
import { questionService } from '@/services/questionService';

interface StepStatus {
  step: string;
  count: number;
  message: string;
  isProcessing: boolean;
  isCompleted: boolean;
}


export default function QuestionAddPage() {
  const t = useTranslations('Practice.add');
  const tOutline = useTranslations('Practice.outline');
  const { toast } = useToast();
  
  // States
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Progress Tracking
  const [steps, setSteps] = useState<StepStatus[]>([
    { step: 'slicer', message: 'Analyzing & Slicing Document', count: 0, isProcessing: false, isCompleted: false },
    { step: 'extractor', message: 'Extracting Questions with AI', count: 0, isProcessing: false, isCompleted: false },
    { step: 'saver', message: 'Synchronizing with Database', count: 0, isProcessing: false, isCompleted: false }
  ]);

  useEffect(() => {
    // Fetch outlines for selection
    const fetchOutlines = async () => {
      try {
        const data = await outlineService.getOutlines();
        setOutlines(data);
        if (data.length > 0) setSelectedOutlineId(data[0].id);
      } catch (err) {
        console.error("Failed to fetch outlines", err);
      }
    };
    fetchOutlines();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's text-based
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast({ title: "Unsupported Format", description: "Only .txt and .md are supported for now.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setContent(result);
        toast({ title: "Import Successful", description: `${file.name} content loaded.` });
      }
    };
    reader.readAsText(file);
  };

  const handleStartExtraction = async () => {
    if (!selectedOutlineId || !content.trim()) {
      toast({ title: "Error", description: "Please select an outline and provide text content.", variant: "destructive" });
      return;
    }

    setIsExtracting(true);
    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, isProcessing: false, isCompleted: false, count: 0 })));

    try {
      const reader = await questionService.extractQuestions({ content, outline_id: selectedOutlineId });
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              setSteps(prev => prev.map(s => ({ ...s, isProcessing: false, isCompleted: true })));
              toast({ title: "Extraction Complete", description: "Questions successfully imported to staging pool." });
              setIsExtracting(false);
              continue;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                toast({ title: "Agent Error", description: data.error, variant: "destructive" });
                setIsExtracting(false);
                break;
              }

              // Update Step Progress
              setSteps(prev => prev.map(s => {
                const isCurrent = s.step === data.step;
                
                // 标记之前的步骤为已完成
                const stepOrder = ['slicer', 'extractor', 'saver'];
                const currentIdx = stepOrder.indexOf(data.step);
                const sIdx = stepOrder.indexOf(s.step);
                
                if (isCurrent) {
                  // 如果是 saver 节点，检查是否整体完成
                  if (data.step === 'saver') {
                    const isAllDone = data.processed_chunks >= data.total_chunks && data.total_chunks > 0;
                    return { 
                      ...s, 
                      isProcessing: !isAllDone, 
                      isCompleted: isAllDone,
                      count: data.count || s.count 
                    };
                  }
                  return { ...s, isProcessing: true, isCompleted: false, count: data.count || s.count };
                }
                
                if (sIdx < currentIdx) {
                   // 如果正在循环提取，不能把 saver 标记为 completed 除非真的完了
                   if (s.step === 'extractor' && data.step === 'saver') {
                      const isAllDone = data.processed_chunks >= data.total_chunks && data.total_chunks > 0;
                      return { ...s, isProcessing: !isAllDone, isCompleted: isAllDone };
                   }
                   return { ...s, isProcessing: false, isCompleted: true };
                }
                
                return s;
              }));
            } catch (pErr) {
               // JSON parse error (potentially partial chunk)
            }
          }
        }
      }
    } catch (err: any) {
      toast({ title: "Network Error", description: err.message, variant: "destructive" });
      setIsExtracting(false);
    }
  };


  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto p-12 relative flex flex-col gap-12">
        {/* Header with Back Button */}
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-12 pt-8">
           <div className="flex flex-col gap-6">
              <Link href="/board/staging" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] hover:text-indigo-600 transition-colors w-fit group">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                {t('backToStaging')}
              </Link>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#767683] font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                  <PlusCircle className="w-3.5 h-3.5" />
                  {t('terminal')}
                </div>
                <h1 className="text-6xl font-black text-[#000666] tracking-tighter leading-none">{t('title')}</h1>
                <p className="text-[#767683] font-medium max-w-xl leading-relaxed">
                  {t('desc')}
                </p>
              </div>
           </div>

           {/* Step 1: Destination Selection */}
           <div className="bg-white rounded-[40px] p-10 border border-[#EDEEEF] shadow-sm flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BookOpen className="w-4 h-4" />
                   </div>
                   <h2 className="text-lg font-black text-[#000666] uppercase tracking-wider">{t('selectOutline')}</h2>
                </div>
                
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#767683] group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    placeholder={tOutline('search')}
                    className="pl-9 pr-4 py-2 h-10 w-64 bg-[#F8F9FA] border-[#EDEEEF] rounded-xl text-xs focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {outlines
                   .filter(o => 
                      o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (o.desc && o.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                   )
                   .map((o) => (
                   <div 
                      key={o.id} 
                      onClick={() => !isExtracting && setSelectedOutlineId(o.id)}
                      className={`
                        cursor-pointer p-6 rounded-3xl border-2 transition-all group
                        ${selectedOutlineId === o.id 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-900/5' 
                          : 'border-[#EDEEEF] hover:border-indigo-200 bg-white'}
                      `}
                   >
                      <h3 className={`font-black uppercase tracking-widest text-xs mb-1 ${selectedOutlineId === o.id ? 'text-indigo-700' : 'text-[#000666]'}`}>
                        {o.name}
                      </h3>
                      <p className="text-xs text-[#767683] line-clamp-1">{o.desc}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Step 2: Content Input */}
           <div className="bg-white rounded-[40px] p-10 border border-[#EDEEEF] shadow-sm flex flex-col gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText className="w-4 h-4" />
                 </div>
                 <h2 className="text-lg font-black text-[#000666] uppercase tracking-wider">{t('contentLabel')}</h2>
              </div>
              
              <Textarea 
                placeholder={t('contentPlaceholder')}
                className="min-h-[400px] max-h-[700px] overflow-y-auto bg-[#F8F9FA] border-[#EDEEEF] rounded-3xl p-6 text-base font-medium leading-relaxed focus:bg-white transition-all focus:ring-4 focus:ring-indigo-600/5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isExtracting}
              />
              
              <div className="flex justify-end gap-3">
                 <input 
                   type="file" 
                   id="file-import" 
                   className="hidden" 
                   accept=".txt,.md"
                   onChange={handleFileUpload}
                 />
                 <Button 
                    variant="outline"
                    disabled={isExtracting}
                    onClick={() => document.getElementById('file-import')?.click()}
                    className="rounded-2xl h-16 px-8 border-[#EDEEEF] bg-white shadow-xl shadow-black/5 font-black uppercase tracking-widest text-[11px] flex items-center gap-2 hover:bg-slate-50 transition-all text-[#767683]"
                 >
                    <FileUp className="w-4 h-4" />
                    {t('importFile')}
                 </Button>

                 <Button 
                    disabled={isExtracting || !content.trim()}
                    onClick={handleStartExtraction}
                    className="bg-[#1A237E] hover:bg-[#000666] text-white rounded-2xl h-16 px-12 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-900/10 flex items-center gap-3 active:scale-95 transition-all"
                 >
                    {isExtracting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isExtracting ? t('extracting') : t('extract')}
                 </Button>
              </div>
           </div>

           {/* Progress Panel (Floating or Overlay when processing) */}
           {isExtracting && (
             <div className="fixed bottom-12 right-12 w-96 bg-white rounded-[40px] p-10 border border-indigo-100 shadow-2xl shadow-indigo-900/10 animate-in slide-in-from-bottom-24 duration-500 z-50">
                <div className="flex flex-col gap-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                         <Cpu className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-lg font-black text-[#000666] tracking-tight">{t('agentWorking')}</span>
                         <span className="text-[10px] font-black tracking-widest text-indigo-600/60 uppercase">{t('processingQueue')}</span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-4">
                           <div className={`
                              w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors
                              ${s.isCompleted ? 'bg-emerald-500 text-white' : s.isProcessing ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/10' : 'bg-[#EDEEEF] text-white'}
                           `}>
                              {s.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="text-[10px] font-black">{i+1}</div>}
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className={`text-xs font-black uppercase tracking-widest ${s.isProcessing || s.isCompleted ? 'text-[#000666]' : 'text-slate-300'}`}>
                                {t(s.step)}
                              </span>
                              {s.isProcessing && (
                                <div className="flex items-center gap-2">
                                   <div className="h-1 w-24 bg-[#F3F4F5] rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-600 animate-[loading-bar_1.5s_infinite]" />
                                   </div>
                                   {s.count > 0 && <span className="text-[9px] font-black text-indigo-600">{t('batch', {count: s.count})}</span>}
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsExtracting(false)}
                        className="w-full rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest"
                      >
                         {t('abort')}
                      </Button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </main>
      
      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
