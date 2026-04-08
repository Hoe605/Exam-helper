'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, use } from 'react';
import { 
  Users, 
  BookOpen, 
  Loader2, 
  ChevronLeft,
  Plus,
  Mail,
  Calendar,
  ShieldCheck,
  Search,
  BookMarked,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { courseService, Course } from "@/services/courseService";
import { outlineService, Outline } from "@/services/outlineService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allOutlines, setAllOutlines] = useState<Outline[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, outlinesData] = await Promise.all([
        courseService.getCourse(id),
        courseService.getCourseOutlines(Number(id))
      ]);
      setCourse(courseData);
      setOutlines(outlinesData);

      if (isTeacher) {
        const [studentsData, allOutlinesData] = await Promise.all([
          courseService.getCourseStudents(id),
          outlineService.getOutlines()
        ]);
        setStudents(studentsData);
        setAllOutlines(allOutlinesData);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load course details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleLinkOutline = async (outlineId: number) => {
    try {
      setLinking(true);
      await courseService.linkOutline(id, outlineId);
      toast({ title: "Success", description: "Outline linked to course" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to link outline", variant: "destructive" });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FA] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 opacity-20" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto p-12 transition-all duration-700">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          
          {/* Back Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-fit flex items-center gap-2 text-[#767683] hover:text-[#000666] font-bold text-xs uppercase tracking-widest pl-0"
          >
            <ChevronLeft className="w-4 h-4" />
            返回列表
          </Button>

          {/* Course Hero Section */}
          <header className="bg-white rounded-[3rem] p-12 border border-[#EDEEEF] shadow-2xl shadow-indigo-900/[0.03] relative overflow-hidden flex flex-col md:flex-row gap-12 items-end justify-between">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 -mr-40 -mt-40 rounded-full blur-[120px]" />
             
             <div className="flex flex-col gap-6 relative z-10 max-w-2xl">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/20">
                      <BookMarked className="w-8 h-8 text-white" />
                   </div>
                   <div className="flex flex-col">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full text-[9px] font-black w-fit mb-2">ACTIVE COURSE</Badge>
                      <h1 className="text-4xl font-black text-[#000666] tracking-tighter">{course.name}</h1>
                   </div>
                </div>
                <p className="text-[#767683] font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6">
                   {course.desc || '此课程致力于构建高效的数字化学习体验，暂未添加详细介绍信息。'}
                </p>
                <div className="flex gap-8 mt-4">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 opacity-40 " />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#767683] opacity-60">Invite Code</span>
                         <span className="text-sm font-black text-[#000666] tracking-widest">{course.code}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 border-l border-[#F3F4F5] pl-8">
                      <Calendar className="w-4 h-4 text-indigo-600 opacity-40" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#767683] opacity-60">Created At</span>
                         <span className="text-sm font-black text-[#000666]">
                            {new Date(course.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                         </span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="relative z-10 flex flex-col gap-4">
                {isTeacher && (
                   <Dialog>
                      <DialogTrigger asChild>
                         <Button className="bg-[#1A237E] hover:bg-[#000666] text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-900/10 flex items-center gap-2">
                           <Plus className="w-4 h-4" />
                           关联新大纲
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl rounded-[2rem]">
                         <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-[#000666]">关联知识大纲</DialogTitle>
                            <DialogDescription>
                               从您的个人库中选择大纲，学生将能立即查看到这些大纲并进行针对性练习。
                            </DialogDescription>
                         </DialogHeader>
                         <div className="grid gap-4 py-6 max-h-[400px] overflow-y-auto pr-4">
                            {allOutlines.filter(ao => !outlines.find(o => o.id === ao.id)).map(ao => (
                               <div key={ao.id} className="group p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-600/30 transition-all flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#767683]">
                                        <BookOpen className="w-5 h-5" />
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#000666]">{ao.name}</span>
                                        <span className="text-[10px] text-[#767683]">{ao.node_count || 0} 知识节点</span>
                                     </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="rounded-xl bg-indigo-600" 
                                    disabled={linking}
                                    onClick={() => handleLinkOutline(ao.id)}
                                  >
                                     {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : '关联'}
                                  </Button>
                               </div>
                            ))}
                            {allOutlines.filter(ao => !outlines.find(o => o.id === ao.id)).length === 0 && (
                               <div className="text-center py-10 text-[#767683] text-sm italic">暂无可用的大纲，请先去“大纲管理”页面创建。</div>
                            )}
                         </div>
                      </DialogContent>
                   </Dialog>
                )}
             </div>
          </header>

          {/* Detailed Content Tabs */}
          <Tabs defaultValue="outlines" className="w-full flex flex-col gap-8">
             <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-white max-w-md">
                <TabsList className="bg-transparent w-full">
                   <TabsTrigger value="outlines" className="flex-1 rounded-2xl h-12 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                      学习大纲 ({outlines.length})
                   </TabsTrigger>
                   {isTeacher && (
                      <TabsTrigger value="students" className="flex-1 rounded-2xl h-12 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                        班级学生 ({students.length})
                      </TabsTrigger>
                   )}
                </TabsList>
             </div>

             <TabsContent value="outlines" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {outlines.map(o => (
                      <div key={o.id} className="group bg-white rounded-[2.5rem] p-8 border border-[#EDEEEF] hover:border-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 flex flex-col gap-6 relative overflow-hidden">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-[#767683] group-hover:bg-indigo-600/5 group-hover:text-indigo-600 transition-colors">
                               <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                               <h3 className="text-base font-black text-[#000666] leading-tight line-clamp-1">{o.name}</h3>
                               <span className="text-[10px] font-bold text-[#767683] opacity-60 uppercase tracking-widest mt-1">CURRICULUM NODE</span>
                            </div>
                         </div>
                         <Button 
                           variant="ghost" 
                           onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/board?outline=${o.id}`}
                           className="mt-auto h-14 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-600/20 text-[#000666] font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6 group/btn"
                         >
                            开始智能练习
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                         </Button>
                      </div>
                   ))}
                   {outlines.length === 0 && (
                      <div className="col-span-full py-40 flex flex-col items-center justify-center text-center gap-6 bg-white rounded-[3rem] border-2 border-dashed border-[#EDEEEF]">
                         <div className="p-6 bg-slate-50 rounded-full opacity-20"><BookOpen className="w-12 h-12" /></div>
                         <div className="max-w-sm">
                            <h3 className="text-xl font-black text-[#000666]">暂无教学资源</h3>
                            <p className="text-[#767683] text-sm mt-3 leading-relaxed">老师尚未为此课程关联任何知识大纲。请耐心等待或联系您的授课老师。</p>
                         </div>
                      </div>
                   )}
                </div>
             </TabsContent>

             <TabsContent value="students" className="mt-0">
                <div className="bg-white rounded-[3rem] p-10 border border-[#EDEEEF] shadow-sm overflow-hidden">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {students.map(s => (
                         <div key={s.id} className="p-6 bg-[#F8F9FA] rounded-[2rem] flex items-center gap-4 hover:shadow-lg hover:bg-white transition-all border border-transparent hover:border-[#EDEEEF]">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                               <UserIcon className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-[#000666]">{s.email.split('@')[0]}</span>
                               <span className="text-[10px] font-bold text-[#767683] opacity-60 truncate max-w-[120px]">{s.email}</span>
                            </div>
                         </div>
                      ))}
                      {students.length === 0 && (
                         <div className="col-span-full py-20 text-center text-[#767683] opacity-40 font-bold uppercase tracking-[0.3em] text-xs">
                            Waiting for the first student to join...
                         </div>
                      )}
                   </div>
                </div>
             </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
