import { apiClient } from '@/lib/api-client';

export const practiceService = {
  async generatePracticeStream(nodeId: number): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    // Note: This is an event-stream GET request.
    return apiClient.fetchStream(`/practice/generate-stream?node_id=${nodeId}`, null, { method: 'GET' });
  }
};

