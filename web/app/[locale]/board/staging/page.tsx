'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Check, 
  Trash2,
  FileEdit,
  ChevronDown,
  Layers,
  Bot,
  Bell,
  Settings,
  AlertTriangle,
  AlertCircle,
  Copy,
  RotateCcw,
  BookOpen,
  Loader2,
  RefreshCcw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/DashboardSidebar";
import SmartContent from "@/components/SmartContent";


const API_BASE = "http://localhost:8000";

interface StagingQuestion {
  id: number;
  q_type: string;
  context: string;
  options?: any;
  status: string;
  is_warning: boolean;
  warning_reason?: string;
  duplicate_of_id?: number;
  error_msg?: string;
  type?: string;
}

interface StagingStats {
  total: number;
  pending: number;
  warning: number;
  approved: number;
}

export default function StagingPage() {
  const t = useTranslations('Practice.staging');
  
  const [questions, setQuestions] = useState<StagingQuestion[]>([]);
  const [stats, setStats] = useState<StagingStats>({ total: 0, pending: 0, warning: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [questionsResp, statsResp] = await Promise.all([
        fetch(`${API_BASE}/staging/`),
        fetch(`${API_BASE}/staging/stats`)
      ]);

      if (!questionsResp.ok || !statsResp.ok) throw new Error("Failed to fetch staging data");

      const questionsData = await questionsResp.json();
      const statsData = await statsResp.json();

      setQuestions(questionsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const resp = await fetch(`${API_BASE}/staging/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) {
        fetchData(); // Refresh
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const resp = await fetch(`${API_BASE}/staging/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const statCards = [
    { label: t('stats.pending'), value: stats.pending.toString(), icon: Layers, color: "text-blue-600", border: "border-blue-600", bg: "bg-blue-50/50", queue: "QUEUE" },
    { label: t('stats.warnings'), value: stats.warning.toString(), icon: AlertTriangle, color: "text-rose-600", border: "border-rose-600", bg: "bg-rose-50/50", queue: "CRITICAL" },
    { label: t('stats.duplicates'), value: "0", icon: Copy, color: "text-[#767683]", border: "border-[#767683]", bg: "bg-slate-50/50", queue: "SYSTEM" },
    { label: t('stats.approved'), value: stats.approved.toString(), icon: Check, color: "text-emerald-600", border: "border-emerald-600", bg: "bg-emerald-50/50", queue: "SUCCESS" }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden leading-normal">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <header className="h-20 border-b border-[#EDEEEF] bg-white px-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-10">
            <h1 className="text-[#000666] font-black text-sm uppercase tracking-[0.2em]">{t('title')}</h1>
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683]" />
              <input 
                 type="text" 
                 placeholder="Search pool..." 
                 className="w-full bg-[#F3F4F5] border-none rounded-full py-2 pl-12 pr-4 text-xs font-medium focus:ring-1 ring-[#1A237E]/20" 
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button onClick={fetchData} variant="ghost" className="rounded-full p-2 h-10 w-10">
               <RefreshCcw className={`w-4 h-4 text-[#767683] ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Bell className="w-5 h-5 text-[#767683] cursor-pointer" />
            <Settings className="w-5 h-5 text-[#767683] cursor-pointer" />
            <div className="w-10 h-10 rounded-full bg-[#E0E0FF] flex items-center justify-center text-[#1A237E] font-black text-xs cursor-pointer shadow-lg shadow-indigo-900/5">
              QC
            </div>
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-20">
            
            {/* Header section */}
            <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-4xl font-black text-[#000666] tracking-tight">{t('title')}</h2>
                  <p className="text-[#767683] mt-2 font-medium opacity-80">{t('desc')}</p>
               </div>
               <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] font-black tracking-widest text-[#767683] uppercase opacity-60 pr-1">{t('selectOutline')}</span>
                  <div className="bg-white border border-[#EDEEEF] rounded-xl px-4 py-2 flex items-center gap-4 cursor-pointer shadow-sm min-w-[240px] justify-between group hover:border-[#1A237E] transition-all">
                     <span className="text-sm font-bold text-[#000666]">Linear Algebra</span>
                     <ChevronDown className="w-4 h-4 text-[#1A237E] group-hover:translate-y-0.5 transition-transform" />
                  </div>
               </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-4 gap-6">
              {statCards.map((stat, i) => (
                <div key={i} className={`bg-white rounded-xl shadow-lg shadow-black/5 border-l-[6px] ${stat.border} p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all`}>
                   <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-[#767683] opacity-60">{stat.queue}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-[#000666] tracking-tighter">{stat.value}</span>
                      <span className="text-xs font-bold text-[#767683] group-hover:text-[#000666] transition-colors">{stat.label}</span>
                   </div>
                </div>
              ))}
            </div>

            {loading && questions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#767683]">Analyzing Knowledge Buffers...</span>
               </div>
            ) : error ? (
               <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-20 flex flex-col items-center gap-6">
                  <div className="p-5 bg-white rounded-full shadow-2xl shadow-rose-900/10">
                     <AlertCircle className="w-12 h-12 text-rose-500" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="text-xl font-black text-rose-900 uppercase tracking-widest">System Offline</h3>
                    <p className="text-rose-600 font-medium">{error}</p>
                  </div>
                  <Button onClick={fetchData} className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-900/20">
                     Re-establish Connection
                  </Button>
               </div>
            ) : (
               <section className="flex flex-col gap-8">
                  <div className="flex justify-between items-center border-b border-[#EDEEEF] pb-4">
                     <h3 className="text-xs font-black tracking-[0.2em] text-[#767683] uppercase">{t('batch.title')}</h3>
                     <div className="flex items-center gap-2 text-xs font-black text-[#000666]">
                        <span className="opacity-60 uppercase tracking-widest">{t('batch.sortBy')}:</span>
                        <div className="flex items-center gap-1 cursor-pointer hover:underline">
                           {t('batch.newest')}
                           <ChevronDown className="w-3 h-3" />
                        </div>
                     </div>
                  </div>

                  {/* Question List */}
                  <div className="flex flex-col gap-8">
                     {questions.length === 0 && (
                        <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-[#EDEEEF] flex flex-col items-center justify-center gap-6">
                           <div className="p-6 bg-[#F3F4F5] rounded-full text-[#767683]">
                              <Check className="w-10 h-10" />
                           </div>
                           <span className="text-sm font-black uppercase tracking-[0.2em] text-[#767683]">Audit Pool is Clean</span>
                        </div>
                     )}
                     {questions.map((q) => (
                        <div key={q.id} className={`bg-white rounded-[32px] p-10 shadow-xl shadow-black/5 border-2 transition-all flex flex-col gap-8 ${q.status === 'warning' || q.is_warning ? 'border-rose-500/30' : 'border-transparent hover:border-[#1A237E]/20 hover:-translate-y-1'}`}>
                        
                        {/* Top metadata */}
                        <header className="flex justify-between items-start">
                           <div className="flex gap-3">
                              <Badge variant="outline" className="text-[10px] bg-slate-50 border-none px-3 font-bold uppercase tracking-widest text-[#767683]">ID: {q.id}</Badge>
                              <Badge variant="outline" className="text-[10px] bg-[#E0E0FF] border-none px-3 font-bold uppercase tracking-widest text-[#1A237E]">TYPE: {q.q_type}</Badge>
                              {q.type === 'ai' && (
                                 <Badge variant="outline" className="text-[10px] bg-slate-50 border-none px-3 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <Bot className="w-3 h-3 text-[#1A237E]" />
                                    AI SYNTHESIZED
                                 </Badge>
                              )}
                           </div>
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${q.status === 'pending' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${q.status === 'pending' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                 {q.status}
                              </span>
                           </div>
                        </header>

                        {/* Alert Message */}
                        {(q.is_warning || q.duplicate_of_id) && (
                           <div className={`rounded-2xl p-6 flex flex-col gap-2 bg-rose-50 text-rose-800 border border-rose-100`}>
                              <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest">
                                    {q.duplicate_of_id ? <Copy className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {q.duplicate_of_id ? t('messages.duplicate', { id: q.duplicate_of_id }) : q.warning_reason || t('messages.logicFail')}
                                 </div>
                                 <button className="text-[10px] font-black uppercase tracking-widest border-b border-rose-200 hover:border-rose-400">
                                    {t('actions.viewDuplicate')}
                                 </button>
                              </div>
                              {q.error_msg && (
                                 <p className="text-xs font-bold opacity-80 pl-7 italic">{q.error_msg}</p>
                              )}
                           </div>
                        )}

                        {/* Content */}
                        <div className="flex flex-col gap-10">
                           <SmartContent 
                             content={q.context} 
                             className="text-2xl font-black text-[#000666] tracking-tight leading-loose whitespace-pre-wrap" 
                           />

                           {/* Options for MC */}
                           {q.options && typeof q.options === 'object' && (
                              <div className="grid grid-cols-2 gap-4">
                                 {Object.entries(q.options).map(([key, val], idx) => (
                                 <div key={key} className={`p-6 rounded-[24px] border bg-[#F3F4F5]/30 text-sm font-bold flex items-center gap-6 transition-all hover:bg-white hover:shadow-xl border-transparent hover:border-[#1A237E]/10 group/opt`}>
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-[#767683] group-hover/opt:text-[#1A237E] transition-colors uppercase shrink-0">
                                       {key}
                                    </div>
                                    <SmartContent 
                                      content={val as string} 
                                      className="flex-1 text-[#000666] py-1" 
                                    />
                                 </div>
                                 ))}
                              </div>
                           )}
                        </div>


                        {/* Actions */}
                        <footer className="flex justify-between items-center border-t border-[#EDEEEF] pt-8">
                           <div className="flex gap-8">
                              <button 
                                onClick={() => handleDelete(q.id)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#CD1C18] hover:scale-105 transition-all group"
                              >
                                 <Trash2 className="w-4 h-4" />
                                 {t('actions.reject')}
                              </button>
                              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] hover:text-[#000666]">
                                 <FileEdit className="w-4 h-4" />
                                 {t('actions.edit')}
                              </button>
                           </div>
                           <div className="flex gap-4">
                              <Button 
                                onClick={() => handleUpdateStatus(q.id, 'approved')}
                                className={`rounded-2xl h-12 px-12 font-black uppercase tracking-[0.3em] text-[10px] shadow-lg border-none bg-[#000666] hover:bg-[#1A237E] text-white shadow-indigo-900/20`}
                              >
                                 {t('actions.approve')}
                              </Button>
                           </div>
                        </footer>
                        </div>
                     ))}
                  </div>

                  {/* End of batch */}
                  <div className="flex flex-col items-center gap-4 py-20 opacity-40">
                     <BookOpen className="w-12 h-12 text-[#767683]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#767683]">END OF CURRENT BATCH</span>
                  </div>
               </section>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8f9fa;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e1e3e4;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bdc2ff;
        }
      `}</style>
    </div>
  );
}
