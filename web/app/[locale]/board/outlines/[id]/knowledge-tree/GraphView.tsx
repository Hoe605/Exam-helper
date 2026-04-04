'use client';

import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { motion } from "framer-motion";
import { useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Layers,
  Pencil,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { KnowledgeNode } from './types';

const CustomNodeComponent = ({ data, targetPosition, sourcePosition }: any) => {
  const node = data.nodeData as KnowledgeNode;
  const isMatch = data.isMatch;
  const isExpanded = data.isExpanded;
  const hasChildren = node.children && node.children.length > 0;
  const depth = (node.level || 1) - 1; 
  
  const levelColors = [
    { text: 'text-[#1A237E]', bg: 'bg-[#E0E0FF]', border: 'border-[#1A237E]/20' },
    { text: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-200' },
    { text: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    { text: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
  ];
  const colors = levelColors[Math.min(depth, levelColors.length - 1)];

  return (
    <div className={`group bg-white rounded-2xl p-5 min-w-[300px] max-w-[340px] cursor-pointer pointer-events-auto transition-all shadow-xl relative group-hover:scale-[1.02] 
      ${isMatch ? 'ring-4 ring-amber-400/60 shadow-amber-900/10' : 'shadow-black/5 ring-1 ring-[#EDEEEF] hover:ring-[#1A237E]/30'}`}>
      
      {depth > 0 && (
        <Handle type="target" position={targetPosition} className="w-3 h-3 rounded-full border-2 border-white bg-[#767683]" />
      )}
      
      <div className="flex justify-between items-start mb-3">
        <Badge className={`text-[10px] font-black uppercase tracking-wider ${colors.bg} ${colors.text} border-none px-2.5 py-0.5`}>
          L{node.level}
        </Badge>
        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               data.onAddChild(node.id, node.level);
             }}
             className="w-6 h-6 rounded-full bg-[#F3F4F5] flex items-center justify-center text-indigo-600 hover:text-white hover:bg-indigo-600 transition-all opacity-20 group-hover:opacity-100"
           >
              <Plus className="w-3 h-3" />
           </button>
           <button 
             onClick={(e) => {
               e.stopPropagation();
               data.onEdit(node);
             }}
             className="w-6 h-6 rounded-full bg-[#F3F4F5] flex items-center justify-center text-[#767683] hover:text-[#1A237E] hover:bg-[#E0E0FF] transition-all opacity-20 group-hover:opacity-100"
           >
              <Pencil className="w-3 h-3" />
           </button>
           <span className="text-[9px] font-black text-[#767683] opacity-30 shrink-0">
             #{node.id}
           </span>
        </div>
      </div>
      
      <h3 className={`font-bold text-base text-[#000666] leading-snug mb-1 ${isMatch ? 'text-amber-900' : ''}`}>
        {node.name}
      </h3>
      
      {node.desc && (
        <p className="text-xs text-[#767683] leading-relaxed line-clamp-3 font-medium opacity-80">
           {node.desc}
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        {hasChildren ? (
           <button 
            onClick={() => data.onToggle(node.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest pointer-events-auto
              ${isExpanded ? 'bg-[#1A237E] text-white shadow-lg shadow-indigo-900/20' : 'bg-[#F3F4F5] text-[#767683] hover:bg-[#E0E0FF] hover:text-[#1A237E]'}
            `}
           >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {node.children.length} {isExpanded ? 'Collapse' : 'Expand'}
           </button>
        ) : (
          <div className="text-[9px] font-black uppercase tracking-widest text-[#767683] opacity-40">
             Leaf Node
          </div>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <Handle type="source" position={sourcePosition} className="w-3 h-3 rounded-full border-2 border-white bg-[#1A237E]" />
      )}
    </div>
  );
};

const nodeTypes = { custom: CustomNodeComponent };

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 120, ranksep: 180 });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 320, height: 160 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };
    newNode.targetPosition = isHorizontal ? Position.Left : Position.Top;
    newNode.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    newNode.position = { x: nodeWithPosition.x - 320 / 2, y: nodeWithPosition.y - 160 / 2 };
    return newNode;
  });
  return { nodes: newNodes, edges };
};

export default function GraphView({ 
  apiNodes, 
  searchQuery, 
  expandedIds, 
  toggleExpand,
  onEdit,
  onAddChild,
  treeTitle 
}: { 
  apiNodes: KnowledgeNode[], 
  searchQuery: string, 
  expandedIds: Set<number>, 
  toggleExpand: (id: number) => void,
  onEdit: (node: KnowledgeNode) => void,
  onAddChild: (parentId: number, level: number) => void,
  treeTitle: string 
}) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const flatNodes: Node[] = [];
    const flatEdges: Edge[] = [];
    function traverse(node: KnowledgeNode) {
      const isMatch = searchQuery ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) || (node.desc || '').toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const isExpanded = expandedIds.has(node.id);
      flatNodes.push({ id: node.id.toString(), type: 'custom', 
        data: { nodeData: node, isMatch, isExpanded, onToggle: toggleExpand, onEdit, onAddChild }, position: { x: 0, y: 0 } });
      if (node.children && isExpanded) {
        node.children.forEach((child: KnowledgeNode) => {
          flatEdges.push({ id: `e${node.id}-${child.id}`, source: node.id.toString(), target: child.id.toString(), type: 'smoothstep', animated: true, style: { stroke: '#1A237E', strokeWidth: 2, opacity: 0.2 } });
          traverse(child);
        });
      }
    }
    apiNodes.forEach(traverse);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flatNodes, flatEdges, 'TB');
    setRfNodes(layoutedNodes);
    setRfEdges(layoutedEdges);
  }, [apiNodes, searchQuery, expandedIds, toggleExpand, onEdit, onAddChild, setRfNodes, setRfEdges]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="w-full h-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        attributionPosition="bottom-right"
      >
        <Background color="#EDEEEF" variant={BackgroundVariant.Dots} gap={40} size={1} />
        <Controls className="bg-white/90 backdrop-blur-md border border-[#EDEEEF] shadow-2xl shadow-black/10 rounded-2xl overflow-hidden mb-8 ml-8 [&>button]:border-[#EDEEEF] [&>button:hover]:bg-[#F8F9FA] [&>button]:h-10 [&>button]:w-10" />
        <Panel position="bottom-right" className="bg-white/90 backdrop-blur-md border border-[#EDEEEF] shadow-2xl shadow-indigo-900/5 rounded-2xl p-4 flex flex-col gap-3 m-8 pointer-events-auto">
          <span className="text-[10px] items-center gap-2 font-black tracking-widest uppercase text-[#767683] flex mb-1 border-b border-[#EDEEEF] pb-2 px-1">
            <Layers className="w-3 h-3" />
            {treeTitle}
          </span>
          <div className="flex gap-4">
            {['L1', 'L2', 'L3', 'L4+'].map((l, i) => {
              const cls = ['bg-[#1A237E]', 'bg-violet-500', 'bg-indigo-400', 'bg-sky-400'];
              return (
                <div key={l} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${cls[i]}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#767683]">{l}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}
