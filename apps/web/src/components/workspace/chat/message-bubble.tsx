import type { ChatMessage } from '@xperience/shared';
import { cn } from '@/lib/utils';
import { ChangeSummary } from './change-summary';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isPending = message.id.startsWith('pending-');

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%]', isPending && 'opacity-70')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap',
            isUser ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted',
          )}
        >
          {message.content}
        </div>
        {!isUser && <ChangeSummary changes={message.changes} rejected={message.rejected} />}
      </div>
    </div>
  );
}
