import type {
  CreateGuestSegmentInput,
  GuestSegment,
  UpdateGuestSegmentInput,
} from '@xperience/shared';
import { notFound } from '../../lib/errors';
import { omitUndefined } from '../../lib/mapping';
import { applyPatch } from '../../lib/patch';
import { recordActivity } from '../activity/activity.service';
import type { MutationContext } from '../activity/activity.service';
import { toGuestSegment } from './guest-segment.mapper';
import { GuestSegmentModel } from './guest-segment.model';
import type { GuestSegmentDoc } from './guest-segment.model';

function toSegmentPatch(input: UpdateGuestSegmentInput) {
  const { needs, ...rest } = input;
  return omitUndefined({ ...rest, needs: needs && [...new Set(needs)] });
}

export async function findSegmentOrThrow(
  eventId: string,
  segmentId: string,
): Promise<GuestSegmentDoc> {
  const segment = await GuestSegmentModel.findOne({ _id: segmentId, eventId });
  if (!segment) throw notFound('Guest segment');
  return segment;
}

export async function listSegments(eventId: string): Promise<GuestSegment[]> {
  const segments = await GuestSegmentModel.find({ eventId }).sort({ createdAt: 1 });
  return segments.map(toGuestSegment);
}

export async function createSegment(
  ctx: MutationContext,
  input: CreateGuestSegmentInput,
): Promise<GuestSegment> {
  const segment = await GuestSegmentModel.create({
    ...toSegmentPatch(input),
    eventId: ctx.eventId,
  });

  await recordActivity(ctx, {
    entityType: 'guest_segment',
    entityId: segment._id.toString(),
    action: 'created',
    summary: `Added guest segment "${segment.label}" (${segment.count})`,
  });
  return toGuestSegment(segment);
}

export async function updateSegment(
  ctx: MutationContext,
  segmentId: string,
  input: UpdateGuestSegmentInput,
): Promise<GuestSegment> {
  const segment = await findSegmentOrThrow(ctx.eventId, segmentId);
  const changes = applyPatch(segment, toSegmentPatch(input));
  if (changes.length === 0) return toGuestSegment(segment);

  await segment.save();
  await recordActivity(ctx, {
    entityType: 'guest_segment',
    entityId: segmentId,
    action: 'updated',
    summary: `Updated guest segment "${segment.label}": ${changes.join(', ')}`,
  });
  return toGuestSegment(segment);
}

export async function deleteSegment(ctx: MutationContext, segmentId: string): Promise<void> {
  const segment = await findSegmentOrThrow(ctx.eventId, segmentId);
  await segment.deleteOne();

  await recordActivity(ctx, {
    entityType: 'guest_segment',
    entityId: segmentId,
    action: 'deleted',
    summary: `Removed guest segment "${segment.label}"`,
  });
}
