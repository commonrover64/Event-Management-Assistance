import { EventWorkspace } from '@/components/workspace/event-workspace';

export default async function EventPage({ params }: PageProps<'/events/[eventId]'>) {
  const { eventId } = await params;
  return <EventWorkspace eventId={eventId} />;
}
