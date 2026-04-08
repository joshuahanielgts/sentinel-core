import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/api/chat'

export function useChatSessions(contractId: string) {
  return useQuery({
    queryKey: ['chat-sessions', contractId],
    queryFn: () => chatApi.getSessions(contractId),
    enabled: !!contractId,
  })
}

export function useCreateChatSession(contractId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title?: string) => chatApi.createSession(contractId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', contractId] })
    },
  })
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      content,
      onChunk,
    }: {
      sessionId: string
      content: string
      onChunk: (text: string) => void
    }) => {
      const response = await chatApi.sendMessage(sessionId, content)

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(body.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        onChunk(fullText)
      }

      return fullText
    },
  })
}
