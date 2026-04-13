import { useState, useRef, useEffect } from 'react';
import { X, Plus, Send, Target, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChatSessions, useCreateChatSession, useChatMessages, useSendMessage } from '@/hooks/useChat';
import { chatApi } from '@/api/chat';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/api';

interface ChatPanelProps {
  contractId: string;
  onClose: () => void;
}

export function ChatPanel({ contractId, onClose }: ChatPanelProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [redTeam, setRedTeam] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useChatSessions(contractId);
  const createSession = useCreateChatSession();
  const { data: messages } = useChatMessages(activeSessionId ?? undefined);
  const sendMessage = useSendMessage();

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

  useEffect(() => {
    if (!activeSessionId) return;
    chatApi.getMessages(activeSessionId)
      .then((msgs) => { if (msgs.length > 0) setLocalMessages(msgs); })
      .catch(() => {});
  }, [activeSessionId]);

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId || sendMessage.isPending) return;
    const text = input;
    setInput('');
    setLocalMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      },
    ]);
    setStreamText('');
    const fullText = await sendMessage.mutateAsync({
      sessionId: activeSessionId,
      content: text,
      mode: redTeam ? 'redteam' : 'normal',
      onChunk: (accumulatedText) => setStreamText(accumulatedText),
    });
    setLocalMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: 'assistant',
        content: fullText,
        created_at: new Date().toISOString(),
      },
    ]);
    setStreamText('');
  };

  const handleNewSession = async () => {
    const session = await createSession.mutateAsync(contractId);
    setActiveSessionId(session.id);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-card/95 backdrop-blur-lg border-l border-border z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-cyan" />
        <span className="font-mono text-sm font-semibold text-foreground flex-1">INTEL ASSISTANT</span>
        <Button variant="ghost" size="icon" onClick={handleNewSession} className="h-7 w-7">
          <Plus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Session selector */}
      {sessions && sessions.length > 1 && (
        <div className="px-4 py-2 border-b border-border">
          <Select value={activeSessionId ?? ''} onValueChange={setActiveSessionId}>
            <SelectTrigger className="h-8 text-xs font-mono bg-background">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs font-mono">
                  {s.title || `Session ${s.id.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localMessages.map((msg) => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border-l-2 border-l-cyan text-foreground'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sendMessage.isPending && streamText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-surface border-l-2 border-l-cyan text-foreground">
              {streamText}
              <span className="inline-block w-1.5 h-4 bg-cyan ml-0.5 animate-pulse" />
            </div>
          </div>
        )}
        {sendMessage.isPending && !streamText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-surface border-l-2 border-l-cyan text-foreground">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-10 w-10 shrink-0',
                redTeam ? 'text-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'text-muted-foreground'
              )}
              onClick={() => setRedTeam(!redTeam)}
            >
              <Target className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {redTeam ? 'Red Team Mode: ACTIVE — AI simulates opposing counsel' : 'Red Team Mode: Disabled'}
          </TooltipContent>
        </Tooltip>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about this contract..."
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
  );
}
