'use client';

import { SendHorizontal } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_LENGTH = 4000;

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatComposer({ value, onChange, onSend, disabled }: ChatComposerProps) {
  const canSend = !disabled && value.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSend) onSend();
  };

  // Enter sends, Shift+Enter adds a line; ignore Enter while an IME is composing text
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t bg-background p-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tell the assistant what changed…"
        aria-label="Message the assistant"
        maxLength={MAX_LENGTH}
        rows={2}
        className="max-h-40 min-h-11 resize-none"
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
        <SendHorizontal className="size-4" aria-hidden />
      </Button>
    </form>
  );
}
