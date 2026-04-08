import { apiClient } from './client'
import type { ChatSession } from '@/types/api'

export const chatApi = {
  getSessions: (contractId: string) =>
    apiClient.get<ChatSession[]>(`/chat/sessions?contract_id=${contractId}`),

  createSession: (contractId: string, title?: string) =>
    apiClient.post<ChatSession>('/chat/sessions', { contract_id: contractId, title }),

  sendMessage: (sessionId: string, content: string) =>
    apiClient.stream('/chat/message', { session_id: sessionId, content }),
}
