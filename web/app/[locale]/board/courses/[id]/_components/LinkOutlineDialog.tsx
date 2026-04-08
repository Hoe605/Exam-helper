'use client';

import { BookOpen, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Outline } from "@/services/outlineService";

interface LinkOutlineDialogProps {
  allOutlines: Outline[];
  currentOutlines: Outline[];
  onLink: (outlineId: number) => Promise<void>;
  linking: boolean;
}

export default function LinkOutlineDialog({ 
  allOutlines, 
  currentOutlines, 
  onLink, 
  linking 
}: LinkOutlineDialogProps) {
  // 过滤出尚未关联的大纲
  const availableOutlines = allOutlines.filter(
    ao => !currentOutlines.find(o => o.id === ao.id)
  );

  return (
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
          {availableOutlines.map(ao => (
            <div 
              key={ao.id} 
              className="group p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-600/30 transition-all flex items-center justify-between"
            >
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
                onClick={() => onLink(ao.id)}
              >
                {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : '关联'}
              </Button>
            </div>
          ))}
          
          {availableOutlines.length === 0 && (
            <div className="text-center py-10 text-[#767683] text-sm italic">
              暂无可用的大纲，请先去“大纲管理”页面创建。
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
