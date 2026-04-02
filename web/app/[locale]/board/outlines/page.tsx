'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Map, 
  MoreVertical, 
  Network, 
  Layers, 
  FileEdit, 
  Calendar,
  ChevronRight,
  LayoutGrid,
  List,
  Filter,
  Activity,
  History,
  CheckCircle2,
  Trash2,
  Settings2,
  Loader2,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DashboardSidebar from "@/components/DashboardSidebar";
import CreateOutlineWizard from "@/components/CreateOutlineWizard";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";



// Define the API base URL
const API_BASE = "http://localhost:8000";

interface Outline {
  id: number;
  name: string;
  desc?: string;
  metadata?: Record<string, any>;
  node_count?: number; 
  status: string;
  content?: string;
}

export default function OutlinesPage() {
  const t = useTranslations('Practice.outline');
  const [syllabi, setSyllabi] = useState<Outline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);


  const fetchSyllabi = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/outlines/`);
      if (!resp.ok) throw new Error("Failed to fetch syllabi");
      const data = await resp.json();
      setSyllabi(data);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    try {
      const resp = await fetch(`${API_BASE}/outlines/${deletingId}`, { method: 'DELETE' });
      if (resp.ok) {
        setSyllabi(syllabi.filter(s => s.id !== deletingId));
      }
    } catch (err) {
      alert("Failed to delete syllabus");
    } finally {
      setDeletingId(null);
    }
  };


  const stats = [
    { label: t('stats.total'), value: syllabi.length.toString(), icon: Map, color: "text-[#1A237E]", bg: "bg-[#E0E0FF]/40" },
    { label: t('stats.nodes'), value: syllabi.reduce((acc, s) => acc + (s.node_count || 0), 0).toString(), icon: Network, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t('stats.active'), value: syllabi.filter(s => (s.status || "").toLowerCase() === "active").length.toString(), icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden leading-normal">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
          
          <AnimatePresence>
            {isCreating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 p-12 bg-[#F8F9FA] z-50 overflow-hidden"
              >
                 <CreateOutlineWizard 
                    onClose={() => setIsCreating(false)} 
                    onComplete={() => {
                      setIsCreating(false);
                      fetchSyllabi();
                    }} 
                 />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-7xl mx-auto flex flex-col gap-12">

            
            {/* Header Section */}
            <div className="flex justify-between items-end">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[#1A237E] font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                    <Layers className="w-3.5 h-3.5" />
                    Management Suite
                  </div>
                  <h1 className="text-5xl font-black text-[#000666] tracking-tighter leading-none">{t('title')}</h1>
                  <p className="text-[#767683] font-medium max-w-xl leading-relaxed">{t('desc')}</p>
               </div>
               <div className="flex gap-4">
                 <Button 
                   onClick={fetchSyllabi} 
                   variant="outline" 
                   className="rounded-2xl h-14 w-14 p-0 border-[#EDEEEF] bg-white shadow-xl shadow-black/5"
                 >
                   <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
                 <Button 
                   onClick={() => setIsCreating(true)}
                   className="bg-[#000666] hover:bg-[#1A237E] text-white rounded-2xl h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-900/20 flex items-center gap-3">
                    <Plus className="w-4 h-4" />
                    {t('newOutline')}
                 </Button>
               </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-3 gap-8">
               {stats.map((stat, i) => (
                 <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 flex items-center gap-6 group hover:translate-y-[-4px] transition-all border-none">
                    <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-4xl font-black text-[#000666] tracking-tighter leading-none">{stat.value}</span>
                       <span className="text-xs font-bold text-[#767683] tracking-tight mt-1">{stat.label}</span>
                    </div>
                 </div>
               ))}
            </div>

            {/* Content Toolbar */}
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-xl border border-[#EDEEEF] rounded-3xl p-4 pl-8 shadow-lg shadow-black/[0.02]">
               <div className="flex items-center gap-12">
                  <div className="relative w-96 group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683] group-focus-within:text-[#1A237E] transition-colors" />
                    <input 
                       type="text" 
                       placeholder={t('search')} 
                       className="bg-transparent border-none py-2 pl-8 pr-4 text-sm font-bold text-[#000666] placeholder:text-[#767683]/50 focus:ring-0 w-full" 
                    />
                  </div>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#767683] opacity-60 px-4">
                  <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-pulse text-indigo-500' : ''}`} />
                  {loading ? "FETCHING DATA..." : "ENGINE ONLINE"}
               </div>
            </div>

            {/* Loading & Error States */}
            {loading && syllabi.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-[#767683]">Initializing Data Stream...</span>
              </div>
            )}

            {error && (
               <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-10 flex flex-col items-center gap-4">
                  <AlertCircle className="w-12 h-12 text-rose-500" />
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-black text-rose-900 uppercase tracking-widest">Connection Failure</h3>
                    <p className="text-rose-600 text-sm font-medium">{error}</p>
                  </div>
                  <Button onClick={fetchSyllabi} className="mt-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] px-8 h-12">
                     Retry Connection
                  </Button>
               </div>
            )}

            {/* Grid of Syllabi */}
            {!loading && !error && (
              <div className="grid grid-cols-2 gap-8 mb-20">
                {syllabi.map((item) => {
                  const status = item.status || "Draft";
                  return (
                    <div key={item.id} className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.03] flex flex-col gap-8 group hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all border border-transparent hover:border-[#1A237E]/10 relative overflow-hidden">
                      
                      <div className={`absolute top-0 right-10 h-1.5 w-20 rounded-b-full ${status === 'Active' ? 'bg-emerald-500' : status === 'Draft' ? 'bg-amber-400' : 'bg-slate-300'}`} />

                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                            <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-[0.2em] border-none bg-[#F3F4F5] text-[#767683]">
                              #{item.id.toString().padStart(3, '0')}
                            </Badge>
                            <h3 className="text-2xl font-black text-[#000666] tracking-tight group-hover:text-[#1A237E] transition-colors">{item.name}</h3>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-full hover:bg-rose-50 text-[#767683] hover:text-rose-500 transition-colors"
                           >
                              <Trash2 className="w-5 h-5" />
                           </button>
                           <button className="p-2 rounded-full hover:bg-slate-50">
                              <MoreVertical className="w-5 h-5 text-[#767683]" />
                           </button>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-[#767683] leading-relaxed line-clamp-2 pr-12 h-10">
                        {item.desc || "No description provided for this syllabus."}
                      </p>

                      <div className="flex items-center gap-8 py-2 border-y border-[#EDEEEF]/50">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#767683] opacity-60">Structure</span>
                            <span className="text-sm font-bold text-[#000666]">{t('card.nodesCount', { count: item.node_count || 0 })}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-l border-[#EDEEEF] pl-8">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#767683] opacity-60">Status</span>
                            <span className={`text-xs font-black uppercase tracking-tight ${status === 'Active' ? 'text-emerald-600' : status === 'Draft' ? 'text-amber-500' : 'text-slate-400'}`}>{status}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-bold text-[#767683] flex items-center gap-2 italic">
                            <Calendar className="w-3 h-3" />
                            {t('card.lastUpdate', { time: 'Synced' })}
                        </span>
                        <div className="flex gap-3">
                            <button className="p-3 rounded-2xl bg-[#F3F4F5] text-[#767683] hover:text-[#000666] hover:bg-[#EDEEEF] transition-all">
                              <FileEdit className="w-4 h-4" />
                            </button>
                            <Button className="rounded-2xl bg-white text-[#1A237E] border border-[#E0E0FF] hover:bg-[#E0E0FF] h-11 px-6 font-black uppercase tracking-[0.2em] text-[9px] shadow-sm">
                              {t('card.viewNodes')}
                            </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Empty State Card */}
                <button 
                  onClick={() => setIsCreating(true)}
                  className="border-4 border-dashed border-[#EDEEEF] rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 group hover:border-[#1A237E]/20 hover:bg-white/50 transition-all min-h-[360px]"
                >
                    <div className="w-16 h-16 rounded-full bg-[#EDEEEF] flex items-center justify-center text-[#767683] group-hover:bg-[#E0E0FF] group-hover:text-[#1A237E] transition-all">
                      <Plus className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#767683] group-hover:text-[#1A237E]">{t('newOutline')}</span>
                </button>
              </div>
            )}
          </div>
        </main>

        <DeleteConfirmationModal
          isOpen={deletingId !== null}
          onClose={() => setDeletingId(null)}
          onConfirm={confirmDelete}
          title={t('deleteDialog.title')}
          description={t('deleteDialog.desc')}
          confirmText={t('deleteDialog.confirm')}
          cancelText={t('deleteDialog.cancel')}
        />
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
