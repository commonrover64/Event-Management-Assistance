import { getEvent } from '../modules/events/events.service';
import { listSegments } from '../modules/guests/guests.service';
import { listTasks } from '../modules/tasks/tasks.service';
import { listVendors } from '../modules/vendors/vendors.service';
import { formatDate, formatDateTime, weekdayName } from './dates';
import { RefRegistry } from './ref-registry';
import { listOpenRisks } from '../modules/risks/risks.service';

// Shapes sent to the model: short refs instead of ids, no nulls, dates in the event's timezone
export interface SnapshotPayload {
  today: string;
  timezone: string;
  event: Record<string, unknown>;
  subEvents: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  vendors: Record<string, unknown>[];
  guestSegments: Record<string, unknown>[];
  risks: Record<string, unknown>[];
}

export interface EventSnapshot {
  payload: SnapshotPayload;
  refs: RefRegistry;
}

// Drops empty values so the prompt stays small
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  );
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export async function buildEventSnapshot(
  eventId: string,
  now = new Date(),
): Promise<EventSnapshot> {
  const [event, tasks, vendors, segments, risks] = await Promise.all([
    getEvent(eventId),
    listTasks(eventId),
    listVendors(eventId),
    listSegments(eventId),
    listOpenRisks(eventId),
  ]);

  const tz = event.timezone;
  const day = (iso: string | null) => (iso ? formatDate(new Date(iso), tz) : undefined);
  const moment = (iso: string | null) => (iso ? formatDateTime(new Date(iso), tz) : undefined);
  const refs = new RefRegistry();

  // Register everything first so rows can reference items listed later (dependencies)
  event.subEvents.forEach((s) => refs.register('sub_event', s.id));
  tasks.forEach((t) => refs.register('task', t.id));
  vendors.forEach((v) => refs.register('vendor', v.id));
  segments.forEach((g) => refs.register('guest_segment', g.id));
  risks.forEach((r) => refs.register('risk', r.id));
  const refList = (ids: string[]) => ids.map((id) => refs.refOf(id)).filter(isDefined);

  const payload: SnapshotPayload = {
    today: `${formatDate(now, tz)} (${weekdayName(now, tz)})`,
    timezone: tz,
    event: compact({
      title: event.title,
      type: event.type,
      status: event.status,
      start: day(event.startDate),
      end: day(event.endDate),
      headcount: event.headcount,
      budget: event.budget,
      location: event.location,
      description: event.description,
    }),
    subEvents: event.subEvents.map((s) =>
      compact({
        ref: refs.refOf(s.id),
        name: s.name,
        start: moment(s.startAt),
        end: moment(s.endAt),
        venue: s.venue,
        expectedGuests: s.expectedGuests,
        status: s.status,
        notes: s.notes,
      }),
    ),
    tasks: tasks.map((t) =>
      compact({
        ref: refs.refOf(t.id),
        title: t.title,
        category: t.category,
        status: t.status,
        priority: t.priority,
        due: day(t.dueDate),
        subEvent: t.subEventId ? refs.refOf(t.subEventId) : undefined,
        dependsOn: refList(t.dependsOn),
      }),
    ),
    vendors: vendors.map((v) =>
      compact({
        ref: refs.refOf(v.id),
        name: v.name,
        category: v.category,
        status: v.status,
        capacity: v.capacity,
        cost: v.cost,
        subEvents: refList(v.subEventIds),
        notes: v.notes,
      }),
    ),
    guestSegments: segments.map((g) =>
      compact({
        ref: refs.refOf(g.id),
        label: g.label,
        count: g.count,
        needs: g.needs,
        notes: g.notes,
      }),
    ),
    risks: risks.map((r) =>
      compact({
        ref: refs.refOf(r.id),
        source: r.source,
        type: r.type,
        severity: r.severity,
        title: r.title,
        related: refList(r.related.map((e) => e.id)),
      }),
    ),
  };

  return { payload, refs };
}
