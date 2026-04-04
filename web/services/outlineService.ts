import { apiClient } from '@/lib/api-client';

export interface Outline {
  id: number;
  name: string;
  desc?: string;
  metadata?: Record<string, any>;
  node_count?: number;
  status: string;
  content?: string;
}

export const outlineService = {
  async getOutlines(): Promise<Outline[]> {
    return apiClient.get<Outline[]>('/outlines/');
  },

  async getOutline(id: number | string): Promise<Outline> {
    return apiClient.get<Outline>(`/outlines/${id}`);
  },

  async deleteOutline(id: number): Promise<void> {
    return apiClient.delete(`/outlines/${id}`);
  },

  async extractOutline(data: { name: string; content: string }): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    return apiClient.fetchStream('/outlines/extract', data);
  },

  async submitFeedback(id: number, feedback: string): Promise<void> {
    return apiClient.post(`/outlines/${id}/feedback`, { feedback });
  }
};
