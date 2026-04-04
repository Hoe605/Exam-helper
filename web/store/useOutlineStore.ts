import { create } from 'zustand';
import { outlineService, Outline } from '@/services/outlineService';


interface OutlineState {
  syllabi: Outline[];
  loading: boolean;
  error: string | null;
  
  // Delete Modal State
  deleteModal: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => Promise<void>) | null;
  };
  
  // Actions
  fetchSyllabi: () => Promise<void>;
  deleteOutline: (id: number) => Promise<boolean>;
  createOutline: (data: any) => Promise<boolean>;
  
  // Delete Actions
  openDeleteModal: (config: { title: string, description: string, onConfirm: () => Promise<void> }) => void;
  closeDeleteModal: () => void;
}

export const useOutlineStore = create<OutlineState>((set, get) => ({
  syllabi: [],
  loading: false,
  error: null,
  deleteModal: {
    isOpen: false,
    title: '',
    description: '',
    onConfirm: null
  },

  fetchSyllabi: async () => {
    set({ loading: true, error: null });
    try {
      const data = await outlineService.getOutlines();
      set({ syllabi: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Network Error", loading: false });
    }
  },

  deleteOutline: async (id: number) => {
    try {
      await outlineService.deleteOutline(id);
      const newSyllabi = get().syllabi.filter(s => s.id !== id);
      set({ syllabi: newSyllabi });
      return true;
    } catch (err) {
      return false;
    }
  },

  createOutline: async (data: any) => {
    return true; 
  },


  openDeleteModal: (config) => {
    set({
      deleteModal: {
        isOpen: true,
        title: config.title,
        description: config.description,
        onConfirm: config.onConfirm
      }
    });
  },

  closeDeleteModal: () => {
    set(state => ({
      deleteModal: { ...state.deleteModal, isOpen: false }
    }));
  }
}));
