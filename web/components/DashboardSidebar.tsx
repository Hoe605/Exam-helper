'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useQuestionStore } from "@/store/useQuestionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AppWindow,
  ListTodo,
  Layers,
  FileText,
  FlaskConical,
  HelpCircle,
  Archive,
  Menu,
  ChevronRight,
  BrainCircuit,
  Map,
  LogOut,
  LogIn,
  ShieldCheck
} from "lucide-react";

export default function DashboardSidebar() {
  const t = useTranslations('Practice.sidebar');
  const pathname = usePathname();
  const { stagingStats, fetchStagingData } = useQuestionStore();
  const { user, logout, isLoggedIn } = useAuthStore();

  useEffect(() => {
    fetchStagingData();
  }, [fetchStagingData]);

  const sidebarLinks = [
    { icon: BrainCircuit, label: t('practice'), href: '/board', match: '/board' },
    { icon: AppWindow, label: t('courses'), href: '/board/courses', match: '/board/courses' },
    { icon: ListTodo, label: t('auditQueue'), href: '/board/staging', match: '/board/staging', badge: stagingStats.pending },
    { icon: Archive, label: t('library'), href: '/board/library', match: '/board/library' },
    { icon: Map, label: t('outlines'), href: '/board/outlines', match: '/board/outlines' },
    { icon: FileText, label: t('masteryDocs'), href: '#', match: 'docs' },
    { icon: FlaskConical, label: t('aiLab'), href: '#', match: 'ailab' },
  ];


  return (
    <aside className="w-64 bg-white flex flex-col p-6 gap-10 h-full border-r border-[#EDEEEF] shrink-0">
      {/* Brand & Context */}
      <div className="flex flex-col gap-1 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A237E] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <h2 className="text-sm font-bold tracking-tight text-[#000666]">The Intelligent Atelier</h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] pl-10 opacity-60">QUALITY CONTROL</span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {sidebarLinks.map((item, idx) => {
          const active = pathname === item.match;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-[0.1em] ${active
                  ? "bg-[#E0E0FF]/50 text-[#1A237E] border-r-4 border-[#1A237E] rounded-r-none -mr-6 shadow-sm"
                  : "text-[#767683] hover:bg-[#F8F9FA] hover:text-[#000666]"
                }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-4 h-4 ${active ? 'text-[#1A237E]' : 'opacity-60'}`} />
                {item.label}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="bg-rose-500 text-white border-none text-[8px] h-4 min-w-[20px] flex items-center justify-center rounded-full px-1.5 shadow-lg shadow-rose-900/10">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

      </nav>

      {/* Secondary Navigation & Auth */}
      <div className="mt-auto flex flex-col gap-2 py-6 border-t border-[#EDEEEF]">
        {isLoggedIn && user ? (
          <div className="flex flex-col gap-4 px-2 mb-4">
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-[#1A237E]/10 flex items-center justify-center text-[#1A237E] font-bold text-xs uppercase border border-[#1A237E]/20">
                {user.email[0]}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold text-[#000666] truncate">{user.email}</span>
                <span className="text-[9px] font-black uppercase text-rose-500 tracking-[0.1em]">{user.is_superuser ? 'superadmin' : user.role}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#1A237E] hover:text-[#000666]">
            <LogIn className="w-4 h-4" />
            登录系统
          </Link>
        )}

        {isLoggedIn && (user?.is_superuser || user?.role === 'admin') && (
          <Link
            href="/board/admin/users"
            className={`flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${pathname.includes('/admin') ? 'text-[#1A237E] bg-[#E0E0FF]/50 rounded-lg' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {t('adminConsole')}
          </Link>
        )}

        <Link href="#" className="flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#767683] hover:text-[#000666]">
          <HelpCircle className="w-4 h-4 opacity-60" />
          {t('support')}
        </Link>
        <Link href="#" className="flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#767683] hover:text-[#000666]">
          <Archive className="w-4 h-4 opacity-60" />
          {t('archive')}
        </Link>
      </div>
    </aside>
  );
}
