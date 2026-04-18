import { apiClient } from '@/lib/api-client';

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
  difficulty?: number;
}

export interface StagingStats {
  total: number;
  pending: number;
  warning: number;
  approved: number;
}

export const questionService = {
  async getStagingQuestions(): Promise<StagingQuestion[]> {
    return apiClient.get<StagingQuestion[]>('/question/staging');
  },

  async getStagingStats(): Promise<StagingStats> {
    return apiClient.get<StagingStats>('/question/staging/stats');
  },

  async updateStagingStatus(id: number, status: string): Promise<void> {
    return apiClient.put(`/question/staging/${id}`, { status });
  },

  async deleteStagingItem(id: number): Promise<void> {
    return apiClient.delete(`/question/staging/${id}`);
  },

  async getStagingQuestion(id: number | string): Promise<StagingQuestion> {
    return apiClient.get<StagingQuestion>(`/question/staging/${id}`);
  },

  async resolveDuplicate(keepId: number, discardId: number): Promise<void> {
    return apiClient.post('/question/staging/resolve-duplicate', {
      keep_id: keepId,
      discard_id: discardId
    });
  },

  async approveAllPending(): Promise<void> {
    return apiClient.post('/question/staging/approve-all', {});
  },
  
  async rejectAllConflicts(): Promise<void> {
    return apiClient.post('/question/staging/reject-all', {});
  },

  async extractQuestions(data: { content: string; outline_id: number; type?: string }): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    return apiClient.fetchStream('/question/agent/extract', data);
  },

  async getLibraryQuestions(params: { outline_id?: number; node_id?: number; q_type?: string; skip?: number; limit?: number }): Promise<{ total: number; items: any[] }> {
    const query = new URLSearchParams();
    if (params.outline_id !== undefined && params.outline_id !== null) query.append('outline_id', params.outline_id.toString());
    if (params.node_id !== undefined && params.node_id !== null) query.append('node_id', params.node_id.toString());
    if (params.q_type) query.append('q_type', params.q_type);
    if (params.skip !== undefined) query.append('skip', params.skip.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());
    
    return apiClient.get(`/question/library?${query.toString()}`);
  },

  async getQuestionDetail(qId: number | string): Promise<any> {
    return apiClient.get(`/question/library/${qId}`);
  },

  async deleteLibraryQuestion(qId: number | string): Promise<void> {
    return apiClient.delete(`/question/library/${qId}`);
  },

  async classifyLibraryQuestion(qId: number | string): Promise<any> {
    return apiClient.post(`/question/library/${qId}/classify`, {});
  },

  async classifyUncategorized(outlineId: number): Promise<any> {
    return apiClient.post(`/question/library/classify-uncategorized?outline_id=${outlineId}`, {});
  }
};


