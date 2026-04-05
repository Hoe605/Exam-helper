import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LibraryState {
  selectedOutlineId: number | null;
  selectedNodeId: number | null;
  searchQuery: string;
  
  setSelectedOutlineId: (id: number | null) => void;
  setSelectedNodeId: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      selectedOutlineId: null,
      selectedNodeId: null,
      searchQuery: '',

      setSelectedOutlineId: (id) => set({ selectedOutlineId: id, selectedNodeId: null }),
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'library-storage',
    }
  )
);
