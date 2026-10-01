'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { FullPageLoader } from '@/components/layout/full-page-loader';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/hooks/use-events';
import { getErrorMessage } from '@/lib/api/client';
import { EventCard } from './event-card';

export function EventList() {
  const { data: events, isPending, isError, error, refetch } = useEvents();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your events</h1>
          <p className="text-sm text-muted-foreground">Pick an event to open its workspace.</p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="size-4" aria-hidden />
            New event
          </Link>
        </Button>
      </div>

      {isPending && <FullPageLoader label="Loading events" />}

      {isError && (
        <div className="rounded-lg border border-destructive/40 p-6 text-sm">
          <p className="text-destructive">{getErrorMessage(error)}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      {events?.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="font-medium">No events yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create one, then describe it to the assistant in plain words.
          </p>
          <Button asChild className="mt-4">
            <Link href="/events/new">Create your first event</Link>
          </Button>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
