import { create } from 'zustand';

export interface Outline {
  id: number;
  name: string;
  desc?: string;
  metadata?: Record<string, any>;
  node_count?: number; 
  status: string;
  content?: string;
}

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

const API_BASE = "http://localhost:8000";

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
      const resp = await fetch(`${API_BASE}/outlines/`);
      if (!resp.ok) throw new Error("Connection failed: Syllabus engine offline");
      const data = await resp.json();
      set({ syllabi: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Network Error", loading: false });
    }
  },

  deleteOutline: async (id: number) => {
    try {
      const resp = await fetch(`${API_BASE}/outlines/${id}`, { method: 'DELETE' });
      if (!resp.ok) return false;
      
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
