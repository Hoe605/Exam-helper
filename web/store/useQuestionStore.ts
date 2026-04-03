import { create } from 'zustand';

export interface StagingQuestion {
  id: number;
  q_type: string;
  context: string;
  options?: any;
  status: string;
  is_warning: boolean;
  warning_reason?: string;
  duplicate_of_id?: number;
  duplicate_of_formal_id?: number;
  error_msg?: string;
  type?: string;
}

interface StagingStats {
  total: number;
  pending: number;
  warning: number;
  approved: number;
}

interface DuplicateConfig {
  current: StagingQuestion | null;
  originalId: number | null;
  originalQuestion: StagingQuestion | null;
  selectedId: number | null;
  confirmingSelection: boolean;
  loadingOriginal: boolean;
  isFormal?: boolean;
}

interface QuestionState {
  // Staging Pool
  stagingQuestions: StagingQuestion[];
  stagingStats: StagingStats;
  loading: boolean;
  error: string | null;
  
  // Duplicate Modal State
  isDuplicateModalOpen: boolean;
  duplicateConfig: DuplicateConfig;

  // Delete Modal State
  deleteModal: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => Promise<void>) | null;
  };
  
  // Actions
  fetchStagingData: () => Promise<void>;
  updateStagingStatus: (id: number, status: string) => Promise<boolean>;
  deleteStagingItem: (id: number) => Promise<boolean>;
  
  // Duplicate Modal Actions
  openDuplicateModal: (question: StagingQuestion) => Promise<void>;
  closeDuplicateModal: () => void;
  setSelectedId: (id: number | null) => void;
  setConfirmingSelection: (val: boolean) => void;
  
  // Delete Actions
  openDeleteModal: (config: { title: string, description: string, onConfirm: () => Promise<void> }) => void;
  closeDeleteModal: () => void;
  
  // Duplicate Resolution
  resolveDuplicate: (keepId: number, discardId: number) => Promise<boolean>;
}

const API_BASE = "http://localhost:8000";

export const useQuestionStore = create<QuestionState>((set, get) => ({
  stagingQuestions: [],
  stagingStats: { total: 0, pending: 0, warning: 0, approved: 0 },
  loading: false,
  error: null,
  
  // Initial Duplicate State
  isDuplicateModalOpen: false,
  duplicateConfig: {
    current: null,
    originalId: null,
    originalQuestion: null,
    selectedId: null,
    confirmingSelection: false,
    loadingOriginal: false
  },

  // Initial Delete State
  deleteModal: {
    isOpen: false,
    title: '',
    description: '',
    onConfirm: null
  },

  fetchStagingData: async () => {
    set({ loading: true, error: null });
    try {
      const [qResp, sResp] = await Promise.all([
        fetch(`${API_BASE}/question/staging/`),
        fetch(`${API_BASE}/question/staging/stats`)
      ]);
      
      if (!qResp.ok || !sResp.ok) throw new Error("Failed to sync with staging pool");
      
      const [questions, stats] = await Promise.all([qResp.json(), sResp.json()]);
      set({ stagingQuestions: questions, stagingStats: stats, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateStagingStatus: async (id, status) => {
    try {
      const resp = await fetch(`${API_BASE}/question/staging/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!resp.ok) return false;

      await get().fetchStagingData(); 
      return true;
    } catch (err) {
      return false;
    }
  },

  deleteStagingItem: async (id) => {
    try {
      const resp = await fetch(`${API_BASE}/question/staging/${id}`, { method: 'DELETE' });
      if (!resp.ok) return false;
      
      await get().fetchStagingData();
      return true;
    } catch (err) {
      return false;
    }
  },

  openDuplicateModal: async (question) => {
    const originalId = question.duplicate_of_formal_id || question.duplicate_of_id;
    const isFormal = !!question.duplicate_of_formal_id;
    
    set({
      isDuplicateModalOpen: true,
      duplicateConfig: {
        current: question,
        originalId: originalId || null,
        selectedId: null,
        confirmingSelection: false,
        originalQuestion: null,
        loadingOriginal: !!originalId,
        isFormal
      }
    });

    if (!originalId) return;

    // Local check first (only for staging duplicates)
    if (!isFormal) {
      const localMatch = get().stagingQuestions.find(q => q.id === originalId);
      if (localMatch) {
        set(state => ({
          duplicateConfig: { ...state.duplicateConfig, originalQuestion: localMatch, loadingOriginal: false }
        }));
        return;
      }
    }

    // Network fallback
    try {
      const path = isFormal ? `formal/${originalId}` : originalId;
      const res = await fetch(`${API_BASE}/question/staging/${path}`);
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          duplicateConfig: { ...state.duplicateConfig, originalQuestion: data, loadingOriginal: false }
        }));
      } else {
        set(state => ({
          duplicateConfig: { ...state.duplicateConfig, loadingOriginal: false }
        }));
      }
    } catch (err) {
      set(state => ({
        duplicateConfig: { ...state.duplicateConfig, loadingOriginal: false }
      }));
    }
  },

  closeDuplicateModal: () => {
    set(state => ({
      isDuplicateModalOpen: false,
      duplicateConfig: { ...state.duplicateConfig, current: null, originalQuestion: null }
    }));
  },

  setSelectedId: (id) => {
    set(state => ({
      duplicateConfig: { ...state.duplicateConfig, selectedId: id }
    }));
  },

  setConfirmingSelection: (val) => {
    set(state => ({
      duplicateConfig: { ...state.duplicateConfig, confirmingSelection: val }
    }));
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
  },

  resolveDuplicate: async (keepId: number, discardId: number) => {
    try {
      const resp = await fetch(`${API_BASE}/question/staging/resolve-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep_id: keepId, discard_id: discardId })
      });
      if (!resp.ok) return false;

      await get().fetchStagingData();
      return true;
    } catch (err) {
      return false;
    }
  }
}));
