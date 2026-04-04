'use client';

import { LucideIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  border: string;
  bg: string;
  queue: string;
}

export function StagingStatCard({ label, value, icon: Icon, color, border, bg, queue }: StatCardProps) {
  return (
    <Card className={`bg-white rounded-[40px] p-10 border-none border-b-8 ${border} shadow-2xl shadow-black/[0.02] flex flex-col gap-8 group hover:-translate-y-1 transition-all`}>
      <CardContent className="p-0 flex flex-col gap-8">
        <div className="flex justify-between items-start">
           <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
              <Icon className="w-7 h-7" />
           </div>
           <Badge className="bg-transparent border-none text-[9px] font-black tracking-widest text-[#767683] opacity-40 uppercase">{queue}</Badge>
        </div>
        <div className="flex flex-col">
           <span className="text-5xl font-black text-[#000666] tracking-tighter">{value}</span>
           <span className="text-[11px] font-black uppercase tracking-widest text-[#767683] mt-2">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
