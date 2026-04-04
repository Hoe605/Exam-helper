'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Network,
  RefreshCcw,
  Loader2,
  AlertCircle,
  BookOpen,
  Layers,
  GitBranch,
  Search,
  FolderTree,
  TreePine,
  Maximize,
  ChevronDown,
  ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from "framer-motion";

import GraphView from './GraphView';
import ListView from './ListView';
import EditNodeModal from './EditNodeModal';
import CreateNodeModal from './CreateNodeModal';

import { nodeService, KnowledgeNode } from '@/services/nodeService';
import { outlineService, Outline } from '@/services/outlineService';

// ─── Utility Functions ───────────────────────────────────────────────────────

function countNodes(nodes: KnowledgeNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children || []), 0);
}

function countDepth(nodes: KnowledgeNode[], d = 0): number {
  if (!nodes || !nodes.length) return d;
  return Math.max(...nodes.map((n) => countDepth(n.children || [], d + 1)));
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function KnowledgeTreePage() {
  const t = useTranslations('Practice.outline.knowledgeTree');
  const params = useParams();
  const outlineId = params?.id as string;

  const [apiNodes, setApiNodes] = useState<KnowledgeNode[]>([]);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph');

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<KnowledgeNode | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creationConfig, setCreationConfig] = useState<{ parentId: number | null, level: number }>({ 
    parentId: null, level: 0 
  });

  const fetchData = useCallback(async () => {
    if (!outlineId) return;
    setLoading(true);
    setError(null);
    try {
      const [nodesData, outlineData] = await Promise.all([
        nodeService.getNodesByOutline(outlineId),
        outlineService.getOutline(outlineId)
      ]);
      setApiNodes(nodesData);
      setOutline(outlineData);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [outlineId]);


  useEffect(() => {
    if (outlineId) fetchData();
  }, [outlineId, fetchData]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleEdit = useCallback((node: KnowledgeNode) => {
    setEditingNode(node);
    setIsEditModalOpen(true);
  }, []);

  const handleAddChild = useCallback((parentId: number, level: number) => {
    setCreationConfig({ parentId, level });
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateSuccess = useCallback((newNode: KnowledgeNode) => {
    if (!newNode.f_node) {
      setApiNodes(prev => [...prev, { ...newNode, children: [] }]);
    } else {
      const insertInTree = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
        return nodes.map(node => {
          if (node.id === newNode.f_node) {
            return { ...node, children: [...(node.children || []), { ...newNode, children: [] }] };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: insertInTree(node.children) };
          }
          return node;
        });
      };
      setApiNodes(prev => insertInTree(prev));
      setExpandedIds(prev => new Set(prev).add(newNode.f_node!));
    }
  }, []);

  const handleUpdateSuccess = useCallback((updatedNode: KnowledgeNode) => {
    const updateInTree = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
      return nodes.map(node => {
        if (node.id === updatedNode.id) {
          return { ...node, name: updatedNode.name, desc: updatedNode.desc };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateInTree(node.children) };
        }
        return node;
      });
    };
    setApiNodes(prev => updateInTree(prev));
  }, []);

  const handleNodeDelete = useCallback((nodeId: number) => {
    const removeFromTree = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
      return nodes.filter(node => node.id !== nodeId).map(node => ({
        ...node, children: node.children ? removeFromTree(node.children) : []
      }));
    };
    setApiNodes(prev => removeFromTree(prev));
  }, []);

  const totalNodes = useMemo(() => countNodes(apiNodes), [apiNodes]);
  const maxDepth = useMemo(() => countDepth(apiNodes), [apiNodes]);
  const rootCount = apiNodes.length;

  return (
    <div className="flex h-screen bg-white text-[#191C1D] overflow-hidden leading-normal">
      <DashboardSidebar />

      <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-[#F8F9FA]">
        
        {/* Floating Header UI */}
        <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-4 pointer-events-auto">
            <Link
              href="/board/outlines"
              className="group flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md border border-[#EDEEEF] rounded-2xl shadow-xl shadow-black/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#767683] hover:text-[#1A237E] transition-all hover:translate-x-[-4px]"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToOutlines')}
            </Link>

             {/* Floating Info Card (Only in Graph Mode) */}
             {viewMode === 'graph' && (
               <div className={`bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-indigo-900/10 border border-[#EDEEEF] flex flex-col overflow-hidden transition-all duration-300 w-full max-w-lg shadow-sm'}`}>
                  {/* Info Card Header */}
                  <div className="p-6 pb-0 flex justify-between items-start">
                     <div className="flex items-center gap-3 text-[#1A237E] font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                        <TreePine className="w-4 h-4" />
                        {t('subtitle')}
                      </div>
                      <button 
                        onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                        className="w-8 h-8 rounded-full bg-[#F3F4F5] flex items-center justify-center text-[#767683] hover:text-[#1A237E] transition-colors"
                      >
                        {isHeaderExpanded ? <ChevronDown className="w-4 h-4" /> : <Maximize className="w-3.5 h-3.5" />}
                      </button>
                  </div>

                  <div className="p-8 pt-2">
                     <h1 className={`${isHeaderExpanded ? 'text-4xl' : 'text-xl'} font-black text-[#000666] tracking-tighter leading-tight transition-all`}>
                        {outline ? outline.name : t('loading')}
                      </h1>

                      <AnimatePresence>
                        {isHeaderExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            {outline?.desc && (
                              <p className="text-[#767683] text-sm font-medium leading-relaxed line-clamp-2 italic opacity-80 mt-2">
                                "{outline.desc}"
                              </p>
                            )}
                            
                            <div className="flex gap-4 mt-4 pt-4 border-t border-[#EDEEEF]">
                              <div className="flex flex-col">
                                  <span className="text-xl font-black text-[#000666] tracking-tighter">{totalNodes}</span>
                                  <span className="text-[9px] font-bold text-[#767683] uppercase tracking-widest">Total Nodes</span>
                              </div>
                              <div className="w-px h-8 bg-[#EDEEEF]" />
                              <div className="flex flex-col">
                                  <span className="text-xl font-black text-[#000666] tracking-tighter">{rootCount}</span>
                                  <span className="text-[9px] font-bold text-[#767683] uppercase tracking-widest">Roots</span>
                              </div>
                              <div className="w-px h-8 bg-[#EDEEEF]" />
                              <div className="flex flex-col">
                                  <span className="text-xl font-black text-[#000666] tracking-tighter">{maxDepth}</span>
                                  <span className="text-[9px] font-bold text-[#767683] uppercase tracking-widest">Max Depth</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
               </div>
             )}
          </div>

          <div className="flex flex-col gap-4 items-end pointer-events-auto">
             <div className="flex items-center gap-3">
                {/* Mode Toggler */}
                <div className="flex items-center bg-white border border-[#EDEEEF] rounded-2xl p-1 shadow-2xl shadow-black/5">
                   <button 
                    onClick={() => setViewMode('graph')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest
                      ${viewMode === 'graph' ? 'bg-[#1A237E] text-white' : 'text-[#767683] hover:bg-[#F3F4F5]'}
                    `}
                   >
                     <Network className="w-3.5 h-3.5" />
                     Graph
                   </button>
                   <button 
                    onClick={() => setViewMode('tree')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest
                      ${viewMode === 'tree' ? 'bg-[#1A237E] text-white' : 'text-[#767683] hover:bg-[#F3F4F5]'}
                    `}
                   >
                     <FolderTree className="w-3.5 h-3.5" />
                     Tree
                   </button>
                </div>

                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-[#EDEEEF] rounded-2xl p-2 px-5 shadow-2xl shadow-black/5 w-80">
                   <Search className="w-4 h-4 text-[#767683] shrink-0" />
                   <input
                     type="text"
                     placeholder={t('searchPlaceholder')}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="flex-1 bg-transparent border-none text-sm font-bold text-[#000666] placeholder:text-[#767683]/50 focus:outline-none focus:ring-0 py-1"
                   />
                </div>
                <Button
                  onClick={() => handleAddChild(0, 0)}
                  className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-900/10 font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('newNode')}
                </Button>
                <Button
                  onClick={fetchData}
                  variant="outline"
                  className="rounded-2xl h-12 w-12 p-0 border-[#EDEEEF] bg-white shadow-2xl shadow-black/5 hover:bg-white hover:scale-105 transition-all text-[#1A237E]"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
             </div>
          </div>
        </div>

        {/* Main Workspace */}
        <main className="flex-1 relative z-0 w-full h-full bg-[#F8F9FA]">
             {loading && apiNodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#F8F9FA]/80 backdrop-blur-sm z-50">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#767683]">{t('loadingNodes')}</span>
                </div>
             )}

             {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-rose-50 z-50">
                   <AlertCircle className="w-12 h-12 text-rose-500" />
                   <h3 className="text-lg font-black text-rose-900 uppercase tracking-widest">{t('errorTitle')}</h3>
                   <p className="text-rose-600 text-sm font-medium">{error}</p>
                   <Button onClick={fetchData} className="mt-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] px-8 h-12">
                     {t('retry')}
                   </Button>
                </div>
             )}

             {apiNodes.length > 0 && viewMode === 'graph' && (
                <GraphView 
                  apiNodes={apiNodes} 
                  searchQuery={searchQuery} 
                  expandedIds={expandedIds} 
                  toggleExpand={toggleExpand}
                  onEdit={handleEdit}
                  onAddChild={handleAddChild}
                  treeTitle={t('treeTitle')}
                />
             )}

             {apiNodes.length > 0 && viewMode === 'tree' && (
                <ListView 
                  apiNodes={apiNodes} 
                  searchQuery={searchQuery} 
                  expandedIds={expandedIds} 
                  toggleExpand={toggleExpand} 
                  onEdit={handleEdit}
                  onAddChild={handleAddChild}
                  outline={outline}
                  totalNodes={totalNodes}
                  rootCount={rootCount}
                  maxDepth={maxDepth}
                  subtitle={t('subtitle')}
                />
             )}
        </main>

        <EditNodeModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          node={editingNode}
          onSuccess={handleUpdateSuccess}
          onDelete={handleNodeDelete}
        />

        <CreateNodeModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          outlineId={parseInt(outlineId)}
          parentId={creationConfig.parentId || null}
          parentLevel={creationConfig.level}
          onSuccess={handleCreateSuccess}
        />
      </div>

    </div>
  );
}
