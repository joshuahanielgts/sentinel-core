import { apiClient } from './client'
import type { ChatSession, ChatMessage } from '@/types/api'

export const chatApi = {
  getSessions: (contractId: string) =>
    apiClient.get<ChatSession[]>(`/chat/sessions?contract_id=${contractId}`),

  createSession: (contractId: string, title?: string) =>
    apiClient.post<ChatSession>('/chat/sessions', { contract_id: contractId, title }),

  getMessages: (sessionId: string) =>
    apiClient.get<ChatMessage[]>(`/chat/messages?session_id=${sessionId}`),

  sendMessage: (sessionId: string, content: string, redTeam = false) =>
    apiClient.stream('/chat/message', { session_id: sessionId, content, red_team: redTeam }),
}
