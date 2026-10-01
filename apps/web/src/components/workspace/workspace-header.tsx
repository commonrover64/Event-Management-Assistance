import { CalendarDays, MapPin } from 'lucide-react';
import type { EventDetails } from '@xperience/shared';
import { daysUntil, describeCountdown, formatDateRange } from '@/lib/format';

export function WorkspaceHeader({ event }: { event: EventDetails }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {event.type} · {describeCountdown(daysUntil(event.startDate))}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" aria-hidden />
          {formatDateRange(event.startDate, event.endDate, event.timezone)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden />
            {event.location}
          </span>
        )}
      </p>
    </div>
  );
}
