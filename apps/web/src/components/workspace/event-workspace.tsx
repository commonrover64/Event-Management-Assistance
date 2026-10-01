'use client';

import { LayoutDashboard, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { FullPageLoader } from '@/components/layout/full-page-loader';
import { useEvent } from '@/hooks/use-events';
import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { ChatPanel } from './chat/chat-panel';
import { OverviewPanel } from './overview/overview-panel';
import { WorkspaceHeader } from './workspace-header';

type MobileView = 'chat' | 'dashboard';

export function EventWorkspace({ eventId }: { eventId: string }) {
  const { data: event, isPending, isError, error } = useEvent(eventId);
  // Small screens show one pane at a time; large screens show both side by side
  const [mobileView, setMobileView] = useState<MobileView>('chat');

  if (isPending) return <FullPageLoader label="Loading event" />;
  if (isError) {
    return <p className="mx-auto max-w-6xl px-4 py-8 text-destructive">{getErrorMessage(error)}</p>;
  }

  return (
    // Fills the viewport under the 3.5rem header so each pane scrolls on its own
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:grid lg:grid-cols-[minmax(340px,420px)_1fr]">
      <div className="flex border-b lg:hidden" role="group" aria-label="Workspace view">
        {(
          [
            ['chat', MessageSquare, 'Assistant'],
            ['dashboard', LayoutDashboard, 'Dashboard'],
          ] as const
        ).map(([view, Icon, label]) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => setMobileView(view)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm',
              mobileView === view
                ? 'border-b-2 border-primary font-medium'
                : 'text-muted-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <aside
        className={cn(
          'min-h-0 flex-1 border-r bg-muted/30 lg:block',
          mobileView === 'chat' ? 'block' : 'hidden',
        )}
      >
        <ChatPanel eventId={event.id} eventType={event.type} />
      </aside>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto lg:block',
          mobileView === 'dashboard' ? 'block' : 'hidden',
        )}
      >
        <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
          <WorkspaceHeader event={event} />
          <OverviewPanel event={event} />
        </div>
      </div>
    </div>
  );
}
