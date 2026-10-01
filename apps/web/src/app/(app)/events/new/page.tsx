import type { Metadata } from 'next';
import { EventForm } from '@/components/events/event-form';

export const metadata: Metadata = { title: 'New event' };

export default function NewEventPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
        <p className="text-sm text-muted-foreground">
          Just the basics. You can describe everything else to the assistant.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
