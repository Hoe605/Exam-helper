'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Users,
  Trash2,
  UserCog,
  ShieldCheck,
  MoreVertical,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { adminService, AdminUser } from '@/services/adminService';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { useToast } from "@/hooks/use-toast";

export default function UserManagementPage() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for CRUD
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'student',
    is_active: true,
    is_superuser: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security check
  useEffect(() => {
    if (currentUser && !currentUser.is_superuser && currentUser.role !== 'admin') {
      router.push('/board');
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "加载失败",
        description: "无法从服务器获取用户列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      role: 'student',
      is_active: true,
      is_superuser: false
    });
    setSelectedUser(null);
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "提交失败",
        description: "请填写完整的邮箱和密码信息",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting new user:", formData);

    try {
      const resp = await adminService.createUser({
        ...formData,
        username: formData.username || null // Ensure empty string becomes null
      });
      console.log("Creation Success:", resp);

      toast({
        title: t('createSuccess'),
        className: "bg-emerald-50 text-emerald-900 border-emerald-200",
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Creation Failed:", error);
      toast({
        title: t('createError'),
        description: error.response?.data?.detail || "请检查账号是否已存在或数据格式是否正确",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        email: formData.email,
        username: formData.username || null,
        role: formData.role,
        is_active: formData.is_active,
        is_superuser: formData.is_superuser
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await adminService.updateUser(selectedUser.id, payload);
      toast({
        title: "更新成功",
        className: "bg-indigo-50 text-indigo-900 border-indigo-200",
      });
      setIsEditModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast({
        title: "更新失败",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.deleteUser(deleteId);
      toast({
        title: "用户已删除",
      });
      setUsers(users.filter(u => u.id !== deleteId));
    } catch (error) {
      toast({
        title: "删除失败",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      username: user.username || '',
      password: '',
      role: user.role || 'student',
      is_active: user.is_active,
      is_superuser: user.is_superuser
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-[#191C1D] overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & Administration
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-[#000666] tracking-tighter leading-none">{t('title')}</h1>
              <p className="text-[#767683] mt-3 font-medium">{t('userManagement')}</p>
            </div>
            <Button
              onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              className="bg-[#1A237E] hover:bg-[#000666] rounded-xl font-bold text-xs px-6 py-6 shadow-xl shadow-indigo-900/10 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t('newUser')}
            </Button>
          </div>
        </header>

        <section className="bg-white rounded-[32px] border border-[#EDEEEF] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#EDEEEF] bg-[#F8F9FA]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#EDEEEF]">
                <Users className="w-5 h-5 text-[#1A237E]" />
              </div>
              <h2 className="font-bold text-[#000666]">{t('userList')}</h2>
            </div>
          </div>

          <div className="p-0">
            <Table>
              <TableHeader className="bg-[#F8F9FA]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[300px] font-black text-[10px] uppercase tracking-widest text-[#767683] pl-8">{t('username')}</TableHead>
                  <TableHead className="w-[250px] font-black text-[10px] uppercase tracking-widest text-[#767683]">{t('email')}</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#767683]">{t('role')}</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#767683]">{t('status')}</TableHead>
                  <TableHead className="text-right pr-8 font-black text-[10px] uppercase tracking-widest text-[#767683]">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="h-16 bg-[#F8F9FA]/20" />
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-[#767683] font-medium italic">
                      暂无用户数据
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="group hover:bg-[#F8F9FA] transition-colors border-[#EDEEEF]">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border transition-all ${u.is_superuser
                            ? "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20"
                            : u.role === 'admin'
                              ? "bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/20"
                              : "bg-white text-[#1A237E] border-[#EDEEEF] group-hover:border-[#1A237E]/30"
                            }`}>
                            {(u.username || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#000666] text-sm truncate max-w-[200px]">{u.username || <span className="text-zinc-300 font-normal italic">未设置</span>}</span>
                            <span className="text-[10px] text-[#767683] flex items-center gap-1 uppercase tracking-tighter opacity-60">
                              System ID: {String(u.id).substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[#767683] text-sm font-medium">
                          <Mail className="w-3 h-3 opacity-40" />
                          {u.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-lg uppercase text-[9px] font-black tracking-widest px-3 py-1 border-none shadow-sm ${u.is_superuser
                          ? "bg-amber-100 text-amber-700"
                          : u.role === 'admin'
                            ? "bg-purple-100 text-purple-700"
                            : u.role === 'teacher'
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-zinc-100 text-zinc-700"
                          }`}>
                          {u.is_superuser ? 'Super Admin' : u.role === 'admin' ? 'Admin' : u.role || 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                          <span className="text-xs font-bold text-[#000666]">
                            {u.is_active ? t('active') : t('inactive')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-40 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4 text-[#767683]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-2xl border-[#EDEEEF] shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-[#767683] tracking-[0.2em] p-2 px-3">用户操作</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditModal(u)}
                              className="rounded-xl p-3 px-4 cursor-pointer group focus:bg-indigo-50"
                            >
                              <UserCog className="w-4 h-4 mr-3 text-[#767683] group-hover:text-[#1A237E]" />
                              <span className="text-sm font-bold text-[#000666]">{t('editUser')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#EDEEEF] my-2" />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(u.id)}
                              className="rounded-xl p-3 px-4 cursor-pointer group text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              <span className="text-sm font-bold">{t('deleteUser')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      {/* Add/Edit User Modal */}
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="rounded-[40px] border-none shadow-3xl p-10 sm:max-w-xl bg-white/95 backdrop-blur-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />

          <DialogHeader>
            <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserCog className="w-3.5 h-3.5" />
              </div>
              {isEditModalOpen ? 'SECURITY UPDATE' : 'NEW IDENTITY'}
            </div>
            <DialogTitle className="text-3xl font-black text-[#000666] tracking-tighter">
              {isEditModalOpen ? t('editUser') : t('newUser')}
            </DialogTitle>
            <DialogDescription className="text-[#767683] font-medium pt-2">
              {isEditModalOpen ? t('updateUser') : '在系统中创建一个具备特定权限的新账号'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6 border-y border-[#EDEEEF] my-4">
            <div className="grid gap-3">
              <Label htmlFor="username_field" className="text-[10px] font-black uppercase tracking-widest text-[#000666] pl-1">{t('username')}</Label>
              <div className="relative">
                <Input
                  id="username_field"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="rounded-2xl h-14 bg-[#F8F9FA] border-[#EDEEEF] focus:ring-2 focus:ring-[#1A237E]/20 pl-11 font-bold transition-all"
                  placeholder="JohnDoe"
                />
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683]" />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#000666] pl-1">{t('emailIdentifier')}</Label>
              <div className="relative">
                <Input
                  id="email"
                  value={formData.email}
                  disabled={isEditModalOpen}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-2xl h-14 bg-[#F8F9FA] border-[#EDEEEF] focus:ring-2 focus:ring-[#1A237E]/20 pl-11 font-bold transition-all"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767683]" />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="pass" className="text-[10px] font-black uppercase tracking-widest text-[#000666] pl-1">
                {isEditModalOpen ? (t('resetPassword') || '重置密码') : t('password')}
              </Label>
              <div className="relative">
                <Input
                  id="pass"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-2xl h-14 bg-[#F8F9FA] border-[#EDEEEF] focus:ring-2 focus:ring-[#1A237E]/20 pl-5 font-bold"
                  placeholder={isEditModalOpen ? "不修改请留空" : "••••••••"}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767683] hover:text-[#000666]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#000666] pl-1">{t('authRole')}</Label>
                <Select
                  value={formData.role || 'student'}
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-[#F8F9FA] border-[#EDEEEF] font-bold px-5">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#EDEEEF] shadow-2xl p-2 font-bold">
                    <SelectItem value="student" className="rounded-xl p-3">Student</SelectItem>
                    <SelectItem value="teacher" className="rounded-xl p-3">Teacher</SelectItem>
                    <SelectItem value="admin" className="rounded-xl p-3 bg-purple-50 text-purple-700">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#000666] pl-1">{t('privilegeLevel')}</Label>
                <Select
                  value={formData.is_superuser ? 'admin' : 'standard'}
                  onValueChange={(val) => setFormData({ ...formData, is_superuser: val === 'admin' })}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-[#F8F9FA] border-[#EDEEEF] font-bold px-5">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#EDEEEF] shadow-2xl p-2 font-bold">
                    <SelectItem value="standard" className="rounded-xl p-3">Standard Access</SelectItem>
                    <SelectItem value="admin" className="rounded-xl p-3 bg-amber-50 text-amber-700">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl border border-[#EDEEEF]">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#000666]">{t('identityStatus')}</span>
                <span className="text-[9px] text-[#767683] font-medium">{t('statusDesc')}</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`w-28 rounded-xl font-black text-[9px] uppercase tracking-widest h-10 transition-all ${formData.is_active
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#EDEEEF] text-[#767683] hover:bg-[#E0E0FF]'
                  }`}
              >
                {formData.is_active ? t('statusOpen') : t('statusClosed')}
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
              className="text-[#767683] hover:text-[#000666] font-bold text-xs"
            >
              取消
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={isEditModalOpen ? handleEditUser : handleAddUser}
              className="bg-[#1A237E] hover:bg-[#000666] text-white px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900/20 transition-all active:scale-95"
            >
              {isSubmitting ? 'Loading...' : (isEditModalOpen ? t('updateUser') : t('confirmCreate'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[40px] border-none shadow-3xl p-10 max-w-md bg-white/95 backdrop-blur-xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 rotate-12 group-hover:rotate-0 transition-transform">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-[#000666] tracking-tight">
              {t('deleteUser')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#767683] font-medium leading-relaxed pt-2">
              {t('deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-8">
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-900/10"
            >
              确定并永久删除
            </AlertDialogAction>
            <AlertDialogCancel className="w-full border-none bg-[#F8F9FA] hover:bg-[#EDEEEF] text-[#000666] rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all">
              取消并安全返回
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
