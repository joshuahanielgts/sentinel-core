import { useState, useRef, useEffect } from 'react'
import { useChatSessions, useCreateChatSession, useSendMessage } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Plus, Send, X } from 'lucide-react'
import type { ChatMessage } from '@/types/api'

interface ChatPanelProps {
  contractId: string
  open: boolean
  onClose: () => void
}

export default function ChatPanel({ contractId, open, onClose }: ChatPanelProps) {
  const { data: sessions } = useChatSessions(contractId)
  const createSession = useCreateChatSession(contractId)
  const sendMessage = useSendMessage()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  async function handleNewSession() {
    const session = await createSession.mutateAsync(undefined)
    setActiveSessionId(session.id)
    setMessages([])
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !activeSessionId || streaming) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: activeSessionId,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)
    setStreamText('')

    try {
      const fullText = await sendMessage.mutateAsync({
        sessionId: activeSessionId,
        content: userMsg.content,
        onChunk: (text) => setStreamText(text),
      })

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: 'assistant',
        content: fullText,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      setStreamText('')
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
      setStreamText('')
    } finally {
      setStreaming(false)
    }
  }

  if (!open) return null

  return (
    <div className="flex h-full w-96 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">Contract Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleNewSession} title="New session">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {sessions && sessions.length > 1 && (
        <div className="border-b px-4 py-2">
          <select
            className="w-full rounded-md border bg-background px-2 py-1 text-sm"
            value={activeSessionId || ''}
            onChange={(e) => {
              setActiveSessionId(e.target.value)
              setMessages([])
            }}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title || 'Untitled session'}
              </option>
            ))}
          </select>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !streaming && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Ask questions about this contract. The AI has access to the full document and analysis.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {streaming && streamText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap">{streamText}</p>
              </div>
            </div>
          )}
          {streaming && !streamText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="border-t px-4 py-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this contract..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming || !activeSessionId}
          />
          <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
