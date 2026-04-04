'use client';

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  Dot, 
  GitBranch, 
  BookOpen, 
  TreePine,
  Pencil,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { KnowledgeNode, OutlineInfo } from "./types";

function TreeNode({ 
  node, 
  depth, 
  searchQuery, 
  expandedIds, 
  toggleExpand,
  onEdit,
  onAddChild 
}: { 
  node: KnowledgeNode, 
  depth: number, 
  searchQuery: string, 
  expandedIds: Set<number>, 
  toggleExpand: (id: number) => void,
  onEdit: (node: KnowledgeNode) => void,
  onAddChild: (parentId: number, level: number) => void 
}) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isMatch = searchQuery ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) || (node.desc || '').toLowerCase().includes(searchQuery.toLowerCase()) : false;

  const levelColors = [
    { dot: 'bg-[#1A237E]', text: 'text-[#1A237E]', bg: 'bg-[#E0E0FF]/40' },
    { dot: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50' },
    { dot: 'bg-indigo-400', text: 'text-indigo-600', bg: 'bg-indigo-50/70' },
    { dot: 'bg-sky-400', text: 'text-sky-600', bg: 'bg-sky-50/70' },
  ];
  const colors = levelColors[Math.min(depth, levelColors.length - 1)];

  return (
    <div className="flex flex-col group/item">
      <div 
        className={`group flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer mb-1
          ${isMatch ? 'bg-amber-50 ring-1 ring-amber-200 shadow-sm' : 'hover:bg-white hover:shadow-xl hover:shadow-black/5'}
        `}
        style={{ marginLeft: `${depth * 32}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) toggleExpand(node.id);
        }}
      >
        <div className={`mt-1 flex items-center justify-center w-6 h-6 rounded-lg ${colors.bg} ${colors.text} shrink-0`}>
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <Dot className="w-5 h-5 opacity-40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
             <span className={`font-bold tracking-tight ${depth === 0 ? 'text-lg text-[#000666]' : 'text-[#191C1D] text-sm'}`}>
                {node.name}
             </span>
             <Badge variant="outline" className={`text-[9px] font-black uppercase border-none ${colors.bg} ${colors.text} shrink-0`}>
                L{node.level}
             </Badge>
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onEdit(node);
               }}
               className="w-6 h-6 rounded-lg bg-[#F8F9FA] border border-[#EDEEEF] flex items-center justify-center text-[#767683] hover:text-[#1A237E] hover:border-[#1A237E]/20 transition-all opacity-20 group-hover/item:opacity-100"
             >
                <Pencil className="w-3 h-3" />
             </button>
          </div>
          {node.desc && (
            <p className="text-xs text-[#767683] mt-1 leading-relaxed line-clamp-2 font-medium opacity-80">
              {node.desc}
            </p>
          )}
          {hasChildren && !isExpanded && (
            <div className="mt-2 text-[10px] font-black text-[#767683] opacity-40 uppercase tracking-widest flex items-center gap-1.5">
               <GitBranch className="w-3 h-3" />
               {node.children.length} sub-topics
            </div>
          )}
        </div>

        <span className="text-[10px] font-black text-[#767683] opacity-20 mt-1 shrink-0">
          #{node.id}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="overflow-hidden border-l-2 border-[#EDEEEF] ml-7"
          >
            <div className="py-2">
              {node.children.map(child => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  depth={depth + 1} 
                  searchQuery={searchQuery} 
                  expandedIds={expandedIds} 
                  toggleExpand={toggleExpand} 
                  onEdit={onEdit}
                  onAddChild={onAddChild}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListView({ 
  apiNodes, 
  searchQuery, 
  expandedIds, 
  toggleExpand,
  onEdit,
  onAddChild,
  outline,
  totalNodes,
  rootCount,
  maxDepth,
  subtitle
}: { 
  apiNodes: KnowledgeNode[], 
  searchQuery: string, 
  expandedIds: Set<number>, 
  toggleExpand: (id: number) => void,
  onEdit: (node: KnowledgeNode) => void,
  onAddChild: (parentId: number, level: number) => void,
  outline: OutlineInfo | null,
  totalNodes: number,
  rootCount: number,
  maxDepth: number,
  subtitle: string
}) {
  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto flex flex-col p-12 pt-32">
        {/* Integrated Header */}
        <div className="mb-12 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-[#1A237E] font-black text-[10px] uppercase tracking-[0.2em] opacity-60">
              <TreePine className="w-3.5 h-3.5" />
              {subtitle}
           </div>
           <h1 className="text-5xl font-black text-[#000666] tracking-tighter mb-2">
              {outline ? outline.name : 'Loading...'}
           </h1>
           {outline?.desc && (
              <p className="text-[#767683] text-lg font-medium leading-relaxed max-w-3xl italic opacity-70">
                 "{outline.desc}"
              </p>
           )}

           <div className="flex gap-8 mt-8 pb-8 border-b border-[#EDEEEF]">
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-[#000666] tracking-tighter">{totalNodes}</span>
                 <span className="text-[10px] font-bold text-[#767683] uppercase tracking-widest">Knowledge Points</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-[#000666] tracking-tighter">{rootCount}</span>
                 <span className="text-[10px] font-bold text-[#767683] uppercase tracking-widest">Main Modules</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-[#000666] tracking-tighter">{maxDepth}</span>
                 <span className="text-[10px] font-bold text-[#767683] uppercase tracking-widest">Structure Depth</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-1">
          {apiNodes.length === 0 ? (
            <div className="flex flex-col items-center py-20 opacity-40">
               <BookOpen className="w-12 h-12 mb-4" />
               <span className="text-sm font-black uppercase tracking-widest text-[#767683]">No nodes found</span>
            </div>
          ) : (
            apiNodes.map(node => (
              <TreeNode 
                key={node.id} 
                node={node} 
                depth={0} 
                searchQuery={searchQuery} 
                expandedIds={expandedIds} 
                toggleExpand={toggleExpand} 
                onEdit={onEdit}
                onAddChild={onAddChild}
              />
            ))
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e1e3e4; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdc2ff; }
      `}</style>
    </div>
  );
}
