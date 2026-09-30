import type { GuestSegment } from '@xperience/shared';
import { toId, toIso } from '../../lib/mapping';
import type { GuestSegmentDoc } from './guest-segment.model';

export function toGuestSegment(segment: GuestSegmentDoc): GuestSegment {
  return {
    id: toId(segment._id),
    eventId: toId(segment.eventId),
    label: segment.label,
    count: segment.count,
    needs: [...segment.needs],
    notes: segment.notes ?? null,
    createdAt: toIso(segment.createdAt),
    updatedAt: toIso(segment.updatedAt),
  };
}
