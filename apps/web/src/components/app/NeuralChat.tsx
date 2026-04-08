import { useState, useRef, useEffect } from 'react'
import { useChatSessions, useChatMessages, useCreateChatSession, useSendMessage } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Plus, Send, X, Shield, Swords } from 'lucide-react'
import type { ChatMessage } from '@/types/api'

interface NeuralChatProps {
  contractId: string
  open: boolean
  onClose: () => void
}

export default function NeuralChat({ contractId, open, onClose }: NeuralChatProps) {
  const { data: sessions } = useChatSessions(contractId)
  const createSession = useCreateChatSession(contractId)
  const sendMessage = useSendMessage()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [redTeam, setRedTeam] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: dbMessages } = useChatMessages(activeSessionId)

  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  useEffect(() => {
    if (dbMessages) {
      setLocalMessages(dbMessages)
    }
  }, [dbMessages])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, streamText])

  function handleSessionSwitch(sessionId: string) {
    setActiveSessionId(sessionId)
    setLocalMessages([])
    setStreamText('')
  }

  async function handleNewSession() {
    const session = await createSession.mutateAsync(undefined)
    setActiveSessionId(session.id)
    setLocalMessages([])
    setStreamText('')
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

    setLocalMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)
    setStreamText('')

    try {
      const fullText = await sendMessage.mutateAsync({
        sessionId: activeSessionId,
        content: userMsg.content,
        redTeam,
        onChunk: (text) => setStreamText(text),
      })

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: 'assistant',
        content: fullText,
        created_at: new Date().toISOString(),
      }

      setLocalMessages((prev) => [...prev, assistantMsg])
      setStreamText('')
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        created_at: new Date().toISOString(),
      }
      setLocalMessages((prev) => [...prev, errorMsg])
      setStreamText('')
    } finally {
      setStreaming(false)
    }
  }

  if (!open) return null

  return (
    <div className="flex h-full w-96 flex-col border-l border-border/50 bg-[#080c16]">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          {redTeam ? (
            <Swords className="h-4 w-4 text-neon-pink" />
          ) : (
            <MessageSquare className="h-4 w-4 text-primary" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {redTeam ? (
              <span className="text-neon-pink">Red Team</span>
            ) : (
              <span className="text-primary">Neural Chat</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${redTeam ? 'text-neon-pink hover:bg-neon-pink/10' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setRedTeam(!redTeam)}
            title={redTeam ? 'Switch to Normal' : 'Switch to Red Team'}
          >
            {redTeam ? <Shield className="h-3.5 w-3.5" /> : <Swords className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewSession} title="New session">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {sessions && sessions.length > 1 && (
        <div className="border-b border-border/50 px-4 py-2">
          <select
            className="w-full rounded border border-border/50 bg-[#0a0e1a] px-2 py-1 text-xs text-foreground"
            value={activeSessionId || ''}
            onChange={(e) => handleSessionSwitch(e.target.value)}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title || 'Untitled session'}
              </option>
            ))}
          </select>
        </div>
      )}

      {redTeam && (
        <div className="border-b border-neon-pink/20 bg-neon-pink/5 px-4 py-2">
          <p className="text-[10px] text-neon-pink">
            RED TEAM MODE — AI simulates opposing counsel to stress-test your position
          </p>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {localMessages.length === 0 && !streaming && (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 text-primary/20" />
              <p className="text-xs text-muted-foreground">
                {redTeam
                  ? 'Red Team mode active. Ask about vulnerabilities in this contract.'
                  : 'Ask questions about this contract. AI has full document context.'}
              </p>
            </div>
          )}

          {localMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : redTeam
                    ? 'bg-neon-pink/5 text-foreground/90 border border-neon-pink/10'
                    : 'bg-accent/50 text-foreground/90 border border-border/30'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {streaming && streamText && (
            <div className="flex justify-start">
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed border ${
                redTeam ? 'bg-neon-pink/5 border-neon-pink/10' : 'bg-accent/50 border-border/30'
              }`}>
                <p className="whitespace-pre-wrap text-foreground/90">{streamText}</p>
              </div>
            </div>
          )}

          {streaming && !streamText && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-accent/50 border border-border/30 px-3 py-2">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="border-t border-border/50 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={redTeam ? 'Challenge a clause...' : 'Ask about this contract...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming || !activeSessionId}
            className={`flex-1 rounded-lg border bg-[#0a0e1a] px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
              redTeam ? 'border-neon-pink/20 focus:border-neon-pink/40' : 'border-border/50 focus:border-primary/40'
            }`}
          />
          <Button
            type="submit"
            size="icon"
            disabled={streaming || !input.trim()}
            className={`h-8 w-8 ${redTeam ? 'bg-neon-pink hover:bg-neon-pink/80' : ''}`}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
