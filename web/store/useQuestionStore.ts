import { create } from 'zustand';
import { questionService, StagingQuestion, StagingStats } from '@/services/questionService';

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
  approveAllPending: () => Promise<boolean>;
}

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
      const [questions, stats] = await Promise.all([
        questionService.getStagingQuestions(),
        questionService.getStagingStats()
      ]);
      set({ stagingQuestions: questions, stagingStats: stats, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateStagingStatus: async (id, status) => {
    try {
      await questionService.updateStagingStatus(id, status);
      await get().fetchStagingData(); 
      return true;
    } catch (err) {
      return false;
    }
  },

  deleteStagingItem: async (id) => {
    try {
      await questionService.deleteStagingItem(id);
      await get().fetchStagingData();
      return true;
    } catch (err) {
      return false;
    }
  },

  openDuplicateModal: async (question) => {
    let originalId = question.duplicate_of_formal_id || question.duplicate_of_id;
    let isFormal = !!question.duplicate_of_formal_id;
    
    // 如果显式字段为空，尝试从 warning_reason 中提取（例如 "与正式库 #9 相似"）
    if (!originalId && question.warning_reason) {
      const match = question.warning_reason.match(/#(\d+)/);
      if (match) {
        originalId = parseInt(match[1]);
        isFormal = question.warning_reason.includes('正式库') || 
                   question.warning_reason.includes('题库');
      }
    }
    
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
      let data;
      if (isFormal) {
        data = await questionService.getQuestionDetail(originalId);
      } else {
        data = await questionService.getStagingQuestion(originalId);
      }
      
      set(state => ({
        duplicateConfig: { ...state.duplicateConfig, originalQuestion: data, loadingOriginal: false }
      }));
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
      await questionService.resolveDuplicate(keepId, discardId);
      await get().fetchStagingData();
      return true;
    } catch (err) {
      return false;
    }
  },

  approveAllPending: async () => {
    try {
      await questionService.approveAllPending();
      await get().fetchStagingData();
      return true;
    } catch (err) {
      return false;
    }
  }
}));
