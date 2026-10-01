import { CalendarDays, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import type { EventDetails } from '@xperience/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { daysUntil, describeCountdown, formatDateRange } from '@/lib/format';

export function EventCard({ event }: { event: EventDetails }) {
  const countdown = describeCountdown(daysUntil(event.startDate));

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {event.type} · {countdown}
          </p>
          <CardTitle className="text-lg">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden />
            {formatDateRange(event.startDate, event.endDate, event.timezone)}
          </p>
          <p className="flex items-center gap-2">
            <Users className="size-4" aria-hidden />
            {event.headcount} guests · {event.subEvents.length} sub-events
          </p>
          {event.location && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {event.location}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}