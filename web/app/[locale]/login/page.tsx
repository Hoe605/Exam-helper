'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api-client';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  // 按照其它页面一致的顺序调用 Context/Store Hooks
  const t = useTranslations('Practice.sidebar'); // 随便取一个 namespace 保证 Hook 计数一致
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // 然后是 State Hooks
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 保证 Hydration 完成后再渲染涉及 Store 的部分 (避免 Hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/jwt/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!loginResponse.ok) {
        throw new Error('鉴权失败，请检查邮箱或密码');
      }

      const { access_token } = await loginResponse.json();

      // 获取当前用户信息
      const user = await apiClient.get<any>('/users/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      setAuth(user, access_token);
      router.push('/board'); // 登录后跳转到主面板
      
    } catch (err: any) {
      setError(err.message || '登录发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null; // 简单处理 Hydration

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010203] p-4 font-sans">
      {/* 增强型背景动态效果 */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1A237E]/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <Card className="w-full max-w-md border-white/5 bg-zinc-900/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-500" />
        <CardHeader className="pt-8 pb-4">
          <CardTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-xs font-black">EH</div>
             ExamHelper
          </CardTitle>
          <CardDescription className="text-zinc-500 text-sm mt-2">
            安全管理后台 · 身份验证
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-xs font-bold uppercase tracking-widest pl-1">电子邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-950/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-zinc-400 text-xs font-bold uppercase tracking-widest pl-1">安全密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-zinc-950/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/20 border-t border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   AUTHENTICATING...
                </div>
              ) : '进入控制台'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-[#0A0A0B]/50 border-t border-white/5 py-4 px-8">
          <p className="text-[10px] text-zinc-600 text-center w-full uppercase tracking-tighter">
            Internal Access Only - Authorization Required
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
