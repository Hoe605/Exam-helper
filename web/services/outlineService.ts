import { apiClient } from '@/lib/api-client';

export interface Outline {
  id: number;
  name: string;
  desc?: string;
  metadata?: Record<string, unknown>;
  node_count?: number;
  status: string;
  content?: string;
}

export const outlineService = {
  async getOutlines(): Promise<Outline[]> {
    return apiClient.get<Outline[]>('/outlines');
  },

  async getOutline(id: number | string): Promise<Outline> {
    return apiClient.get<Outline>(`/outlines/${id}`);
  },

  async deleteOutline(id: number): Promise<void> {
    return apiClient.delete(`/outlines/${id}`);
  },

  async createOutline(data: { name: string; desc?: string }): Promise<Outline> {
    return apiClient.post<Outline>('/outlines', data);
  },

  async extractOutline(data: { name: string; content: string }, options?: RequestInit): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    return apiClient.fetchStream('/outlines/extract', data, options);
  },

  async submitFeedback(id: number, feedback: string): Promise<void> {
    return apiClient.post(`/outlines/${id}/feedback`, { feedback });
  },

  async cancelExtraction(id: number): Promise<void> {
    return apiClient.post(`/outlines/${id}/cancel`, {});
  }
};
