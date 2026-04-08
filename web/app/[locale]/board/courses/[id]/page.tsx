'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, use } from 'react';
import {
   Loader2,
   ChevronLeft,
   Calendar,
   ShieldCheck,
   BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { courseService, Course } from "@/services/courseService";
import { outlineService, Outline } from "@/services/outlineService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
   Tabs,
   TabsContent,
   TabsList,
   TabsTrigger,
} from "@/components/ui/tabs";

// 抽离的子组件
import LinkOutlineDialog from './_components/LinkOutlineDialog';
import OutlineList from './_components/OutlineList';
import StudentList from './_components/StudentList';
import { useCourseStore } from '@/store/useCourseStore';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
   const { id, locale } = use(params);
   const { user } = useAuthStore();
   const { toast } = useToast();
   const { students: storeStudents } = useCourseStore();

   const [course, setCourse] = useState<Course | null>(null);
   const [outlines, setOutlines] = useState<Outline[]>([]);
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
            const allOutlinesData = await outlineService.getOutlines();
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
   }, [id, isTeacher]);

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
                        <LinkOutlineDialog 
                           allOutlines={allOutlines}
                           currentOutlines={outlines}
                           onLink={handleLinkOutline}
                           linking={linking}
                        />
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
                              班级学生 ({storeStudents.length})
                           </TabsTrigger>
                        )}
                     </TabsList>
                  </div>

                  <TabsContent value="outlines" className="mt-0">
                     <OutlineList 
                        outlines={outlines}
                        locale={locale}
                     />
                  </TabsContent>

                  {isTeacher && (
                     <TabsContent value="students" className="mt-0">
                        <StudentList courseId={id} />
                     </TabsContent>
                  )}
               </Tabs>
            </div>
         </main>
      </div>
   );
}
