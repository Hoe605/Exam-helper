import { apiClient } from '@/lib/api-client';

export interface KnowledgeNode {
  id: number;
  outline_id?: number;
  f_node?: number | null;
  name: string;
  desc?: string;
  level: number;
  status?: number;
  children: KnowledgeNode[];
}


export const nodeService = {
  async getNodesByOutline(outlineId: number | string): Promise<KnowledgeNode[]> {
    return apiClient.get<KnowledgeNode[]>(`/nodes/outline/${outlineId}`);
  },

  async createNode(data: {
    outline_id: number;
    f_node: number | null;
    name: string;
    desc?: string;
    level: number;
  }): Promise<KnowledgeNode> {
    return apiClient.post<KnowledgeNode>('/nodes/', data);
  },

  async updateNode(id: number, data: { name: string; desc?: string }): Promise<KnowledgeNode> {
    return apiClient.put<KnowledgeNode>(`/nodes/${id}`, data);
  },

  async deleteNode(id: number): Promise<void> {
    return apiClient.delete(`/nodes/${id}`);
  }
};
