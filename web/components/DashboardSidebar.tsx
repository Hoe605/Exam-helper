'use client';

import { useTranslations } from 'next-intl';
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
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from '@/i18n/routing';

export default function DashboardSidebar() {
  const t = useTranslations('Practice.sidebar');
  const pathname = usePathname();

  const sidebarLinks = [
    { icon: BrainCircuit, label: t('practice'), href: '/board', match: '/board' },
    { icon: ListTodo, label: t('auditQueue'), href: '/board/staging', match: '/board/staging' },
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
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-[0.1em] ${
                active 
                  ? "bg-[#E0E0FF]/50 text-[#1A237E] border-r-4 border-[#1A237E] rounded-r-none -mr-6" 
                  : "text-[#767683] hover:bg-[#F8F9FA] hover:text-[#000666]"
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-[#1A237E]' : 'opacity-60'}`} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-8 px-2">
          <Button className="w-full bg-[#000666] hover:bg-[#1A237E] text-white rounded-lg h-12 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 shadow-offset-y-4">
             {t('processAll')}
          </Button>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="flex flex-col gap-2 py-6 border-t border-[#EDEEEF]">
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
