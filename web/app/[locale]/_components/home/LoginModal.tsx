'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';
import { Loader2, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email); 
      formData.append('password', password);

      const { access_token } = await authService.login(formData);

      // 获取当前用户信息
      const userRes = await authService.getCurrentUser(access_token);

      setAuth(userRes, access_token);
      setOpen(false); // 关闭弹窗
      router.push('/board'); 
      
    } catch (err: any) {
      setError(err.message || '登录发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="w-full glass-card rounded-[2rem] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,10,100,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="h-2 w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary-container" />
          
          <div className="px-10 pt-12 pb-10">
            <div className="flex flex-col items-center text-center mb-10">
               <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/20 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <ShieldCheck className="w-8 h-8 text-white" />
               </div>
               <DialogTitle className="text-3xl font-heading font-extrabold text-brand-primary tracking-tight mb-2">
                 ExamHelper
               </DialogTitle>
               <DialogDescription className="text-slate-500 font-medium text-sm">
                 欢迎回来，请验证您的身份以继续学习
               </DialogDescription>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="modal-account" className="text-brand-primary/60 text-xs font-bold uppercase tracking-widest pl-1 font-heading">
                  登录账号
                </Label>
                <Input
                  id="modal-account"
                  type="text"
                  placeholder="邮箱或用户名"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50 border-slate-200 text-brand-primary focus:border-brand-primary focus:ring-brand-primary/5 rounded-xl h-14 transition-all pl-5 placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <Label htmlFor="modal-password" className="text-brand-primary/60 text-xs font-bold uppercase tracking-widest font-heading">
                    安全密码
                  </Label>
                  <button type="button" className="text-[10px] text-brand-secondary font-bold hover:underline">忘记密码？</button>
                </div>
                <Input
                  id="modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/50 border-slate-200 text-brand-primary focus:border-brand-primary focus:ring-brand-primary/5 rounded-xl h-14 transition-all pl-5 placeholder:text-slate-300"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 text-xs font-medium animate-in shake-1">
                   {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 bg-brand-primary hover:bg-brand-primary/95 text-white font-heading font-bold rounded-xl shadow-xl shadow-brand-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 border-none text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>验证中...</span>
                  </div>
                ) : '进入控制台'}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                还没有账号？ 
                <button className="text-brand-secondary font-bold ml-1 hover:underline">立即注册</button>
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 py-4 px-8 text-center text-[10px] text-slate-400 font-medium tracking-wide">
             INTERNAL ACCESS ONLY • ENCRYPTED CONNECTION
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

