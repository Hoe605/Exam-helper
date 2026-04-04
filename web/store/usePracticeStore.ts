import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PracticeState {
  selectedOutline: number | null;
  selectedNode: number | null;
  difficulty: string;
  qType: string;
  generatedContent: string;
  
  // Actions
  setSelectedOutline: (id: number | null) => void;
  setSelectedNode: (id: number | null) => void;
  setDifficulty: (difficulty: string) => void;
  setQType: (qType: string) => void;
  setGeneratedContent: (content: string) => void;
  resetPractice: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      selectedOutline: null,
      selectedNode: null,
      difficulty: '中等',
      qType: '单选题',
      generatedContent: '',

      setSelectedOutline: (id) => set({ selectedOutline: id, selectedNode: null }), 
      setSelectedNode: (id) => set({ selectedNode: id }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setQType: (qType) => set({ qType }),
      setGeneratedContent: (content) => set({ generatedContent: content }),
      resetPractice: () => set({ 
        selectedOutline: null, 
        selectedNode: null, 
        difficulty: '中等', 
        qType: '单选题', 
        generatedContent: '' 
      }),
    }),
    {
      name: 'practice-storage',
    }
  )
);
