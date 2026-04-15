import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { MessageSquare, Plus, Send, Target, ChevronDown, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContracts } from '@/hooks/useContracts';
import { useChatSessions, useCreateChatSession, useChatMessages, useSendMessage } from '@/hooks/useChat';
import { chatApi } from '@/api/chat';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/api';

export default function ChatPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data: contracts } = useContracts(workspaceId);
  const completedContracts = useMemo(
    () => (contracts ?? []).filter((c) => c.status === 'complete'),
    [contracts]
  );

  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [redTeam, setRedTeam] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useChatSessions(selectedContractId || undefined);
  const createSession = useCreateChatSession();
  const { data: messages } = useChatMessages(activeSessionId ?? undefined);
  const sendMessage = useSendMessage();

  // Auto-select first completed contract
  useEffect(() => {
    if (completedContracts.length > 0 && !selectedContractId) {
      setSelectedContractId(completedContracts[0].id);
    }
  }, [completedContracts, selectedContractId]);

  // Auto-select first session when contract changes
  useEffect(() => {
    setActiveSessionId(null);
    setLocalMessages([]);
  }, [selectedContractId]);

  useEffect(() => {
    if (sessions?.length && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, streamText]);

  useEffect(() => {
    setLocalMessages(messages ?? []);
  }, [messages]);

  // Fetch messages from API when session changes
  useEffect(() => {
    if (!activeSessionId) return;
    chatApi
      .getMessages(activeSessionId)
      .then((msgs) => {
        if (msgs.length > 0) setLocalMessages(msgs);
      })
      .catch(() => {});
  }, [activeSessionId]);

  const handleNewSession = async () => {
    if (!selectedContractId) return;
    const session = await createSession.mutateAsync(selectedContractId);
    setActiveSessionId(session.id);
    setLocalMessages([]);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeSessionId || sendMessage.isPending) return;
    const text = input;
    const tempId = crypto.randomUUID();
    setInput('');
    setLocalMessages((prev) => [
      ...prev,
      { id: tempId, session_id: activeSessionId, role: 'user', content: text, created_at: new Date().toISOString() },
    ]);
    setStreamText('');
    try {
      const fullText = await sendMessage.mutateAsync({
        sessionId: activeSessionId,
        content: text,
        mode: redTeam ? 'redteam' : 'normal',
        onChunk: (accumulatedText) => setStreamText(accumulatedText),
      });
      setLocalMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), session_id: activeSessionId, role: 'assistant', content: fullText, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      // Remove the optimistic user message on failure
      setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
      toast.error(err instanceof Error ? err.message : 'Chat failed — please try again');
    } finally {
      setStreamText('');
    }
  }, [input, activeSessionId, sendMessage, redTeam]);

  const selectedContract = completedContracts.find((c) => c.id === selectedContractId);

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Toolbar */}
      <div className="p-4 border-b border-border bg-card/95 backdrop-blur flex items-center gap-3 flex-wrap">
        <MessageSquare className="w-4 h-4 text-primary shrink-0" />
        <span className="font-mono text-sm font-semibold text-foreground">AI INTEL CHAT</span>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Contract selector */}
          <Select value={selectedContractId} onValueChange={(v) => setSelectedContractId(v)}>
            <SelectTrigger className="h-8 text-xs font-mono bg-background w-52">
              <SelectValue placeholder="Select a contract…" />
            </SelectTrigger>
            <SelectContent>
              {completedContracts.length === 0 && (
                <SelectItem value="__none__" disabled className="text-xs font-mono text-muted-foreground">
                  No analyzed contracts yet
                </SelectItem>
              )}
              {completedContracts.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs font-mono">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Session selector */}
          {sessions && sessions.length > 1 && (
            <Select value={activeSessionId ?? ''} onValueChange={setActiveSessionId}>
              <SelectTrigger className="h-8 text-xs font-mono bg-background w-44">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs font-mono">
                    {s.title || `Session ${s.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* New session button */}
          {selectedContractId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              disabled={createSession.isPending}
              className="h-8 text-xs font-mono gap-1"
            >
              <Plus className="w-3 h-3" />
              NEW SESSION
            </Button>
          )}
        </div>
      </div>

      {/* Main area */}
      {!selectedContractId ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-semibold text-foreground mb-2">INTEL ASSISTANT</h2>
            <p className="text-sm text-muted-foreground font-mono max-w-sm">
              {completedContracts.length === 0
                ? 'Upload and analyze a contract first, then return here to chat with the AI.'
                : 'Select a contract above to start an AI conversation about it.'}
            </p>
          </div>
          {completedContracts.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <ChevronDown className="w-3 h-3" />
              {completedContracts.length} contract{completedContracts.length !== 1 ? 's' : ''} ready for analysis
            </div>
          )}
        </div>
      ) : !activeSessionId ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-semibold text-foreground mb-2">{selectedContract?.name}</h2>
            <p className="text-sm text-muted-foreground font-mono max-w-sm">
              No chat sessions yet. Start a new session to ask questions about this contract.
            </p>
          </div>
          <Button onClick={handleNewSession} disabled={createSession.isPending} className="btn-glow font-mono gap-2">
            <Plus className="w-4 h-4" />
            START CHAT SESSION
          </Button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {localMessages.length === 0 && !sendMessage.isPending && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <Bot className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-mono text-muted-foreground">
                  Ask anything about <span className="text-foreground">{selectedContract?.name}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-md w-full">
                  {[
                    'What are the key obligations?',
                    'What are the highest risk clauses?',
                    'Summarize the termination terms',
                    'What liability limits apply?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setInput(suggestion); }}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-md px-3 py-2 text-left transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localMessages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'glass border-l-2 border-l-primary text-foreground'
                  )}
                >
                  {msg.content.replace(/\\n/g, '\n')}
                </div>
              </div>
            ))}

            {sendMessage.isPending && streamText && (
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-lg px-4 py-3 text-sm glass border-l-2 border-l-primary text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {streamText.replace(/\\n/g, '\n')}
                  <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
                </div>
              </div>
            )}

            {sendMessage.isPending && !streamText && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3 text-sm glass border-l-2 border-l-primary">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-border bg-card/95 backdrop-blur">
            {redTeam && (
              <div className="mb-2 px-3 py-1.5 rounded bg-destructive/10 border border-destructive/30 text-xs font-mono text-destructive flex items-center gap-2">
                <Target className="w-3 h-3" />
                RED TEAM MODE ACTIVE — AI simulates opposing counsel
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant={redTeam ? 'destructive' : 'outline'}
                size="sm"
                className={cn(
                  'h-10 shrink-0 font-mono text-xs gap-1.5 px-3',
                  redTeam
                    ? 'shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'text-muted-foreground hover:text-destructive hover:border-destructive/50'
                )}
                onClick={() => setRedTeam(!redTeam)}
              >
                <Target className="w-3.5 h-3.5" />
                {redTeam ? 'RED TEAM ON' : 'RED TEAM'}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about this contract…"
                className="flex-1 bg-background font-mono text-sm"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={sendMessage.isPending || !input.trim()}
                className="h-10 w-10 shrink-0 btn-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
