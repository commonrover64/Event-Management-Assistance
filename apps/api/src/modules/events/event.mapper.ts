import type { EventDetails, SubEvent } from '@xperience/shared';
import { toId, toIso, toIsoOrNull } from '../../lib/mapping';
import type { EventDoc } from './event.model';

type SubEventDoc = EventDoc['subEvents'][number];

export function toSubEvent(sub: SubEventDoc): SubEvent {
  return {
    id: toId(sub._id),
    name: sub.name,
    startAt: toIso(sub.startAt),
    endAt: toIsoOrNull(sub.endAt),
    venue: sub.venue ?? null,
    expectedGuests: sub.expectedGuests ?? null,
    status: sub.status,
    notes: sub.notes ?? null,
  };
}

export function toEventDetails(event: EventDoc): EventDetails {
  return {
    id: toId(event._id),
    ownerId: toId(event.ownerId),
    title: event.title,
    type: event.type,
    status: event.status,
    startDate: toIso(event.startDate),
    endDate: toIso(event.endDate),
    timezone: event.timezone,
    headcount: event.headcount,
    budget: event.budget ?? null,
    location: event.location ?? null,
    description: event.description ?? null,
    subEvents: [...event.subEvents]
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .map(toSubEvent),
    createdAt: toIso(event.createdAt),
    updatedAt: toIso(event.updatedAt),
  };
}
