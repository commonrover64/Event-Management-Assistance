'use client';

import { FullPageLoader } from '@/components/layout/full-page-loader';
import { useEvent } from '@/hooks/use-events';
import { getErrorMessage } from '@/lib/api/client';
import { formatDateRange } from '@/lib/format';

// Placeholder: Step 8 turns this into the chat + dashboard workspace
export function EventWorkspace({ eventId }: { eventId: string }) {
  const { data: event, isPending, isError, error } = useEvent(eventId);

  if (isPending) return <FullPageLoader label="Loading event" />;
  if (isError) {
    return <p className="mx-auto max-w-6xl px-4 py-8 text-destructive">{getErrorMessage(error)}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-2 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
      <p className="text-sm text-muted-foreground">
        {formatDateRange(event.startDate, event.endDate, event.timezone)} · {event.headcount} guests
      </p>
    </div>
  );
}
