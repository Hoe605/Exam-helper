import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { outlineService, Outline } from '@/services/outlineService';
import { nodeService, KnowledgeNode } from '@/services/nodeService';
import { courseService, Course } from '@/services/courseService';
import { practiceService } from '@/services/practiceService';

interface PracticeState {
  // Persisted data
  selectedOutline: number | null;
  selectedNode: number | null;
  difficulty: string;
  qType: string;
  generatedContent: string;
  
  // Dynamic data (Transient)
  outlines: Outline[];
  nodes: KnowledgeNode[];
  myCourses: Course[];
  isGenerating: boolean;
  loadingSelection: boolean;
  hasHydrated: boolean;

  // Actions
  setSelectedOutline: (id: number | null) => void;
  setSelectedNode: (id: number | null) => void;
  setDifficulty: (difficulty: string) => void;
  setQType: (qType: string) => void;
  setGeneratedContent: (content: string) => void;
  setHasHydrated: (val: boolean) => void;
  
  // Async Actions
  fetchInitialData: () => Promise<void>;
  fetchNodes: (outlineId: number) => Promise<void>;
  handleGenerate: () => Promise<void>;
  resetPractice: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      // Defaults
      selectedOutline: null,
      selectedNode: null,
      difficulty: '中等',
      qType: '单选题',
      generatedContent: '',
      
      outlines: [],
      nodes: [],
      myCourses: [],
      isGenerating: false,
      loadingSelection: false,
      hasHydrated: false,

      setSelectedOutline: (id) => {
        set({ selectedOutline: id, selectedNode: null, nodes: [] });
        if (id) get().fetchNodes(id);
      },
      setSelectedNode: (id) => set({ selectedNode: id }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setQType: (qType) => set({ qType }),
      setGeneratedContent: (content) => set({ generatedContent: content }),
      setHasHydrated: (val) => set({ hasHydrated: val }),

      fetchInitialData: async () => {
        try {
          const [outlinesData, coursesData] = await Promise.all([
            outlineService.getOutlines(),
            courseService.getMyCourses()
          ]);
          set({ outlines: outlinesData, myCourses: coursesData || [] });
          
          // 如果已经有选中的大纲，加载其节点
          const { selectedOutline } = get();
          if (selectedOutline) get().fetchNodes(selectedOutline);
        } catch (err) {
          console.error("Failed to fetch practice initial data:", err);
        }
      },

      fetchNodes: async (outlineId) => {
        set({ loadingSelection: true });
        try {
          const data = await nodeService.getNodesByOutline(outlineId);
          const flatten = (items: KnowledgeNode[]): KnowledgeNode[] => {
            return items.reduce((acc: KnowledgeNode[], item) => {
              return acc.concat([item], flatten(item.children || []));
            }, []);
          };
          set({ nodes: flatten(data), loadingSelection: false });
        } catch (err) {
          console.error("Failed to fetch nodes:", err);
          set({ loadingSelection: false });
        }
      },

      handleGenerate: async () => {
        const { selectedNode, difficulty, qType, generatedContent } = get();
        if (!selectedNode) return;
        
        set({ isGenerating: true, generatedContent: '' });
        
        try {
          const reader = await practiceService.generatePracticeStream(selectedNode, difficulty, qType);
          const decoder = new TextDecoder();
          
          let fullContent = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            fullContent += chunk;
            set({ generatedContent: fullContent });
          }
        } catch (err) {
          console.error("Generation error:", err);
          set({ generatedContent: generatedContent + '\n[Error during generation]' });
        } finally {
          set({ isGenerating: false });
        }
      },

      resetPractice: () => set({ 
        selectedOutline: null, 
        selectedNode: null, 
        difficulty: '中等', 
        qType: '单选题', 
        generatedContent: '',
        nodes: []
      }),
    }),
    {
      name: 'practice-storage',
      // 仅持久化用户的偏好设置
      partialize: (state) => ({
        selectedOutline: state.selectedOutline,
        selectedNode: state.selectedNode,
        difficulty: state.difficulty,
        qType: state.qType,
        generatedContent: state.generatedContent,
      }),
    }
  )
);
