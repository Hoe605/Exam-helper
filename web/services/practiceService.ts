import { apiClient } from '@/lib/api-client';

export const practiceService = {
  async generatePracticeStream(nodeId: number, difficulty: string = '中等', qType: string = '单选题'): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const params = new URLSearchParams({
      node_id: nodeId.toString(),
      difficulty,
      q_type: qType
    });
    
    return apiClient.fetchStream(`/practice/generate-stream?${params.toString()}`, null, { method: 'GET' });
  }
};


