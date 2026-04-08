'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Users, 
  BookOpen, 
  Loader2, 
  Copy, 
  ChevronRight,
  School
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { courseService, Course } from "@/services/courseService";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CoursesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Course State
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Join Course State
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getMyCourses();
      setCourses(data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load courses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!newName.trim()) {
      toast({ title: "Warning", description: "Course name is required", variant: "destructive" });
      return;
    }
    try {
      await courseService.createCourse(newName, newDesc);
      toast({ title: "Success", description: "Course created successfully" });
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      fetchCourses();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    }
  };

  const handleJoinCourse = async () => {
    if (!joinCode.trim()) return;
    try {
      await courseService.joinCourse(joinCode.trim().toUpperCase());
      toast({ title: "Success", description: "Joined course successfully" });
      setJoinOpen(false);
      setJoinCode('');
      fetchCourses();
    } catch (err) {
      toast({ title: "Error", description: "Invalid code or already joined", variant: "destructive" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Course code copied to clipboard" });
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto p-12 relative flex flex-col gap-12">
        {/* Header */}
        <div className="flex justify-between items-end max-w-7xl mx-auto w-full">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#767683] font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                <School className="w-3.5 h-3.5" />
                Academic Environment
              </div>
              <h1 className="text-5xl font-black text-[#000666] tracking-tighter leading-none">我的课程</h1>
              <p className="text-[#767683] font-medium max-w-xl leading-relaxed">管理您创建或加入的教学课程，获取集中的学习资源与大纲。</p>
           </div>
           
           <div className="flex gap-4">
              {isTeacher && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#1A237E] hover:bg-[#000666] text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-900/10 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      创建新课程
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-[#000666]">创建新课程</DialogTitle>
                      <DialogDescription className="text-sm text-[#767683]">
                        输入课程名称和描述。系统将为您自动生成唯一的邀请码。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#767683]">课程名称</Label>
                        <Input 
                          id="name" 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          placeholder="例如：2026年高等数学春季班" 
                          className="rounded-xl border-[#EDEEEF] focus:border-indigo-600 transition-all"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-[#767683]">课程详情 (可选)</Label>
                        <Input 
                          id="desc" 
                          value={newDesc} 
                          onChange={e => setNewDesc(e.target.value)} 
                          placeholder="简要描述课程目标..." 
                          className="rounded-xl border-[#EDEEEF] focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateCourse} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px]">
                        确认并生成邀请码
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-2xl h-14 px-8 border-[#EDEEEF] bg-white shadow-xl shadow-black/5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-all">
                    <Users className="w-4 h-4 text-indigo-600" />
                    加入课程
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-[#000666]">加入课程</DialogTitle>
                    <DialogDescription className="text-sm text-[#767683]">
                      请输入老师提供的 6 位字母数字邀请码。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-8">
                    <Input 
                      className="text-center text-4xl font-black tracking-[0.5em] h-24 uppercase rounded-3xl border-2 border-dashed border-[#EDEEEF] focus:border-indigo-600 focus:ring-0 transition-all bg-slate-50/50" 
                      maxLength={6} 
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      placeholder="XXXXXX"
                    />
                  </div>
                  <DialogFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px]" onClick={handleJoinCourse}>
                      即刻加入
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Knowledge...</span>
             </div>
          ) : (courses?.length ?? 0) === 0 ? (
             <div className="flex flex-col items-center justify-center py-40 gap-8 text-center bg-white rounded-[3rem] border border-dashed border-[#EDEEEF] shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-indigo-600/5 rounded-[2rem] animate-pulse" />
                   <BookOpen className="w-10 h-10 text-slate-300 relative z-10" />
                </div>
                <div className="max-w-md">
                   <h3 className="text-2xl font-black text-[#000666] tracking-tight">发现学习的新可能</h3>
                   <p className="text-[#767683] mt-3 font-medium">您目前还没有任何活跃的课程。联系您的老师获取邀请码，或者创建一个属于您自己的课程。</p>
                </div>
                <div className="flex gap-4">
                   <Button variant="outline" onClick={() => setJoinOpen(true)} className="rounded-xl h-12 px-8 border-[#EDEEEF] font-black uppercase tracking-widest text-[10px]">加入课程</Button>
                   {isTeacher && <Button onClick={() => setCreateOpen(true)} className="rounded-xl h-12 px-8 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px]">创建课程</Button>}
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => (
                <div 
                  key={course.id} 
                  onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/board/courses/${course.id}`}
                  className="group bg-white rounded-[2.5rem] p-10 border border-[#EDEEEF] hover:border-indigo-600/30 hover:shadow-[0_32px_64px_-16px_rgba(26,35,126,0.12)] transition-all duration-500 flex flex-col gap-8 relative overflow-hidden h-[400px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors" />
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-white rounded-3xl flex items-center justify-center text-[#1A237E] shadow-sm border border-indigo-600/5">
                        <School className="w-8 h-8" />
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(course.code);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black tracking-[0.15em] text-[#767683] hover:bg-indigo-600 hover:text-white cursor-pointer transition-all duration-300 group/code active:scale-95"
                      >
                        {course.code}
                        <Copy className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-[#000666] leading-tight group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                      <p className="text-sm text-[#767683] mt-3 font-medium line-clamp-3 leading-relaxed">
                        {course.desc || '此课程暂无详细描述。老师可能正在准备教学大纲与学习资料。'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-[#F3F4F5] flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-[#767683] uppercase tracking-[0.2em] opacity-60">Status</span>
                       <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          Active
                       </span>
                    </div>
                    <Button variant="ghost" className="rounded-2xl h-14 w-14 p-0 bg-slate-50 text-[#000666] hover:bg-indigo-600 hover:text-white transition-all duration-300 group/btn">
                       <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
