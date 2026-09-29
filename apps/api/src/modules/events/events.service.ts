import type {
  CreateEventInput,
  CreateSubEventInput,
  EventDetails,
  UpdateEventInput,
  UpdateSubEventInput,
} from '@xperience/shared';
import { badRequest, notFound } from '../../lib/errors';
import { omitUndefined, parseDateInput } from '../../lib/mapping';
import { applyPatch } from '../../lib/patch';
import { ActivityModel } from '../activity/activity.model';
import { recordActivity } from '../activity/activity.service';
import type { MutationContext } from '../activity/activity.service';
import { toEventDetails } from './event.mapper';
import { EventModel } from './event.model';
import type { EventDoc } from './event.model';

function toEventDbFields(input: UpdateEventInput) {
  const { startDate, endDate, ...rest } = input;
  return omitUndefined({
    ...rest,
    startDate: parseDateInput(startDate),
    endDate: parseDateInput(endDate),
  });
}

function toSubEventDbFields(input: UpdateSubEventInput) {
  const { startAt, endAt, ...rest } = input;
  return omitUndefined({
    ...rest,
    startAt: parseDateInput(startAt),
    endAt: parseDateInput(endAt),
  });
}

export async function findEventOrThrow(eventId: string): Promise<EventDoc> {
  const event = await EventModel.findById(eventId);
  if (!event) throw notFound('Event');
  return event;
}

function findSubEventOrThrow(event: EventDoc, subEventId: string) {
  const sub = event.subEvents.id(subEventId);
  if (!sub) throw notFound('Sub-event');
  return sub;
}

// Used by tasks and vendors to validate their sub-event references
export async function assertSubEventsExist(eventId: string, subEventIds: string[]): Promise<void> {
  if (subEventIds.length === 0) return;
  const event = await findEventOrThrow(eventId);
  const known = new Set(event.subEvents.map((s) => s._id.toString()));
  const missing = subEventIds.filter((id) => !known.has(id));
  if (missing.length > 0) throw badRequest('Unknown sub-event reference', { missing });
}

export async function listEvents(ownerId: string): Promise<EventDetails[]> {
  const events = await EventModel.find({ ownerId }).sort({ startDate: 1 });
  return events.map(toEventDetails);
}

export async function getEvent(eventId: string): Promise<EventDetails> {
  return toEventDetails(await findEventOrThrow(eventId));
}

export async function createEvent(ownerId: string, input: CreateEventInput): Promise<EventDetails> {
  const { startDate, endDate, ...rest } = input;
  const event = await EventModel.create({
    ...rest,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    ownerId,
  });
  const ctx: MutationContext = { eventId: event._id.toString(), actor: 'user', messageId: null };
  await recordActivity(ctx, {
    entityType: 'event',
    entityId: ctx.eventId,
    action: 'created',
    summary: `Created event "${event.title}"`,
  });
  return toEventDetails(event);
}

export async function updateEvent(
  ctx: MutationContext,
  input: UpdateEventInput,
): Promise<EventDetails> {
  const event = await findEventOrThrow(ctx.eventId);
  const changes = applyPatch(event, toEventDbFields(input));
  if (changes.length === 0) return toEventDetails(event);

  // Cross-field rule checked against the merged result, since a patch may send only one date
  if (event.endDate < event.startDate) {
    throw badRequest('End date must be on or after start date');
  }

  await event.save();
  await recordActivity(ctx, {
    entityType: 'event',
    entityId: ctx.eventId,
    action: 'updated',
    summary: `Updated event: ${changes.join(', ')}`,
  });
  return toEventDetails(event);
}

export async function deleteEvent(eventId: string): Promise<void> {
  // Child collections are added here as their modules are built
  await Promise.all([ActivityModel.deleteMany({ eventId })]);
  await EventModel.deleteOne({ _id: eventId });
}

export async function addSubEvent(
  ctx: MutationContext,
  input: CreateSubEventInput,
): Promise<EventDetails> {
  const event = await findEventOrThrow(ctx.eventId);
  const sub = event.subEvents.create(toSubEventDbFields(input));
  event.subEvents.push(sub);
  await event.save();

  await recordActivity(ctx, {
    entityType: 'sub_event',
    entityId: sub._id.toString(),
    action: 'created',
    summary: `Added sub-event "${input.name}"`,
  });
  return toEventDetails(event);
}

export async function updateSubEvent(
  ctx: MutationContext,
  subEventId: string,
  input: UpdateSubEventInput,
): Promise<EventDetails> {
  const event = await findEventOrThrow(ctx.eventId);
  const sub = findSubEventOrThrow(event, subEventId);
  const wasCancelled = sub.status === 'cancelled';
  const changes = applyPatch(sub, toSubEventDbFields(input));
  if (changes.length === 0) return toEventDetails(event);

  await event.save();
  await recordActivity(ctx, {
    entityType: 'sub_event',
    entityId: subEventId,
    action: !wasCancelled && sub.status === 'cancelled' ? 'cancelled' : 'updated',
    summary: `Updated sub-event "${sub.name}": ${changes.join(', ')}`,
  });
  return toEventDetails(event);
}

export async function deleteSubEvent(
  ctx: MutationContext,
  subEventId: string,
): Promise<EventDetails> {
  const event = await findEventOrThrow(ctx.eventId);
  const sub = findSubEventOrThrow(event, subEventId);
  const name = sub.name;

  sub.deleteOne();
  await event.save();
  // References from tasks and vendors are cleared here once those modules exist

  await recordActivity(ctx, {
    entityType: 'sub_event',
    entityId: subEventId,
    action: 'deleted',
    summary: `Removed sub-event "${name}"`,
  });
  return toEventDetails(event);
}
