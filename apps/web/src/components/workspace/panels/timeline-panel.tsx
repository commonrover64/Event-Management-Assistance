'use client';

import { CalendarRange, MapPin } from 'lucide-react';
import type { EventDetails } from '@xperience/shared';
import { Card, CardContent } from '@/components/ui/card';
import { useRisks, useTasks, useVendors } from '@/hooks/use-event-data';
import { formatDateTime } from '@/lib/format';
import { humanize } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { EmptyState } from '../empty-state';
import { SeverityBadge } from '../severity-badge';

export function TimelinePanel({ event }: { event: EventDetails }) {
  const { data: tasks = [] } = useTasks(event.id);
  const { data: vendors = [] } = useVendors(event.id);
  const { data: risks = [] } = useRisks(event.id);

  if (event.subEvents.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No sub-events yet"
        description="Tell the assistant about the parts of your event, like a Sangeet or a leadership session."
      />
    );
  }

  return (
    // Sub-events arrive sorted by start time from the API
    <ol className="space-y-4 border-l pl-5">
      {event.subEvents.map((sub) => {
        const covering = vendors.filter((v) => v.subEventIds.includes(sub.id));
        const linked = tasks.filter((t) => t.subEventId === sub.id && t.status !== 'cancelled');
        const openTasks = linked.filter((t) => t.status !== 'done').length;
        const subRisks = risks.filter(
          (r) =>
            r.status === 'open' && r.related.some((e) => e.type === 'sub_event' && e.id === sub.id),
        );

        return (
          <li key={sub.id} className="relative">
            <span
              className={cn(
                'absolute top-4 -left-[1.69rem] size-3 rounded-full border-2 border-background',
                sub.status === 'confirmed' ? 'bg-primary' : 'bg-muted-foreground/40',
              )}
              aria-hidden
            />
            <Card size="sm" className={cn(sub.status === 'cancelled' && 'opacity-60')}>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{sub.name}</h3>
                  <span className="text-xs text-muted-foreground">{humanize(sub.status)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(sub.startAt, event.timezone)}
                </p>
                <p className="flex items-center gap-1.5 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                  {sub.venue ?? <span className="text-muted-foreground">Venue not set</span>}
                </p>

                {covering.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {covering.map((v) => (
                      <span
                        key={v.id}
                        className={cn(
                          'rounded-md bg-muted px-2 py-0.5 text-xs',
                          v.status !== 'confirmed' && 'text-muted-foreground line-through',
                        )}
                        title={`${humanize(v.category)} · ${humanize(v.status)}`}
                      >
                        {v.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {linked.length === 0
                    ? 'No tasks linked'
                    : `${openTasks} open of ${linked.length} linked tasks`}
                </p>

                {subRisks.map((risk) => (
                  <p key={risk.id} className="flex items-center gap-2 text-xs">
                    <SeverityBadge severity={risk.severity} />
                    {risk.title}
                  </p>
                ))}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
