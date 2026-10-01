'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { EventType } from '@xperience/shared';
import { useMessages, useSendMessage } from '@/hooks/use-chat';
import { getErrorMessage } from '@/lib/api/client';
import { ChatComposer } from './chat-composer';
import { MessageBubble } from './message-bubble';
import { PromptSuggestions } from './prompt-suggestions';

interface ChatPanelProps {
  eventId: string;
  eventType: EventType;
}

export function ChatPanel({ eventId, eventType }: ChatPanelProps) {
  const { data: messages = [], isPending: isLoading } = useMessages(eventId);
  const sendMessage = useSendMessage(eventId);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, sendMessage.isPending]);

  const send = (content: string) => {
    setDraft('');
    sendMessage.mutate(content.trim(), {
      onError: (error) => {
        // Give the text back so the manager can retry without retyping
        setDraft(content);
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <section aria-label="Assistant chat" className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {isLoading && (
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" aria-hidden />
        )}
        {!isLoading && messages.length === 0 && (
          <PromptSuggestions eventType={eventType} onPick={send} />
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {sendMessage.isPending && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Updating the plan…
          </p>
        )}
        <div ref={endRef} />
      </div>
      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSend={() => send(draft)}
        disabled={sendMessage.isPending}
      />
    </section>
  );
}
