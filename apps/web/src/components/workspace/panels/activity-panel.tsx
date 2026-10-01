'use client';

import { Bot, History, Settings2, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Actor, EventDetails } from '@xperience/shared';
import { useActivity } from '@/hooks/use-event-data';
import { formatRelative } from '@/lib/format';
import { humanize } from '@/lib/labels';
import { EmptyState } from '../empty-state';

const ACTORS: Record<Actor, { icon: LucideIcon; label: string }> = {
  user: { icon: User, label: 'You' },
  ai: { icon: Bot, label: 'Assistant' },
  system: { icon: Settings2, label: 'Automatic check' },
};

export function ActivityPanel({ event }: { event: EventDetails }) {
  const { data: activity = [] } = useActivity(event.id);

  if (activity.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Every change, by you or the assistant, is recorded here."
      />
    );
  }

  return (
    <ol className="space-y-3">
      {activity.map((entry) => {
        const actor = ACTORS[entry.actor];
        return (
          <li key={entry.id} className="flex gap-3 text-sm">
            <actor.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p>{entry.summary}</p>
              <p className="text-xs text-muted-foreground">
                {actor.label} · {humanize(entry.entityType)} ·{' '}
                <time dateTime={entry.createdAt}>{formatRelative(entry.createdAt)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
