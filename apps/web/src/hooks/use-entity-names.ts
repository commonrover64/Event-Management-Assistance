'use client';

import { useMemo } from 'react';
import type { EventDetails } from '@xperience/shared';
import { useGuestSegments, useTasks, useVendors } from './use-event-data';

// id → display name for everything in an event, used to label risk and task references
export function useEntityNames(event: EventDetails): Map<string, string> {
  const { data: tasks = [] } = useTasks(event.id);
  const { data: vendors = [] } = useVendors(event.id);
  const { data: segments = [] } = useGuestSegments(event.id);

  return useMemo(() => {
    const names = new Map<string, string>();
    event.subEvents.forEach((s) => names.set(s.id, s.name));
    tasks.forEach((t) => names.set(t.id, t.title));
    vendors.forEach((v) => names.set(v.id, v.name));
    segments.forEach((g) => names.set(g.id, g.label));
    return names;
  }, [event.subEvents, tasks, vendors, segments]);
}
