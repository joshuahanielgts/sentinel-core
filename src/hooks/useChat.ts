import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';

export function useChatSessions(contractId: string | undefined) {
  return useQuery({
    queryKey: ['chat-sessions', contractId],
    queryFn: () => chatApi.getSessions(contractId!),
    enabled: !!contractId,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) => chatApi.createSession(contractId),
    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', contractId] });
    },
  });
}

export function useChatMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => chatApi.getMessages(sessionId!),
    enabled: !!sessionId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      content,
      mode,
      onChunk,
    }: {
      sessionId: string;
      content: string;
      mode: 'normal' | 'redteam';
      onChunk: (text: string) => void;
    }) => chatApi.sendMessage(sessionId, content, mode, onChunk),
    onSuccess: (_fullText, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.sessionId] });
    },
  });
}
