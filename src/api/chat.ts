import { apiClient } from './client';
import type { ChatSession, ChatMessage } from '@/types/api';

export const chatApi = {
  getSessions(contractId: string) {
    return apiClient.get<ChatSession[]>(`/chat/sessions?contract_id=${contractId}`);
  },

  createSession(contractId: string) {
    return apiClient.post<ChatSession>('/chat/sessions', { contract_id: contractId });
  },

  getMessages(sessionId: string) {
    return apiClient.get<ChatMessage[]>(`/chat/messages?session_id=${sessionId}`);
  },

  async sendMessage(
    sessionId: string,
    content: string,
    mode: 'normal' | 'redteam' = 'normal',
    onChunk: (text: string) => void
  ): Promise<string> {
    const response = await apiClient.stream('/chat/message', {
      session_id: sessionId,
      content,
      mode,
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      onChunk(accumulated);
    }

    return accumulated;
  },
};
