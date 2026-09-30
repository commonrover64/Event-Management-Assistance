import type { Vendor } from '@xperience/shared';
import { toId, toIso } from '../../lib/mapping';
import type { VendorDoc } from './vendor.model';

export function toVendor(vendor: VendorDoc): Vendor {
  return {
    id: toId(vendor._id),
    eventId: toId(vendor.eventId),
    name: vendor.name,
    category: vendor.category,
    status: vendor.status,
    capacity: vendor.capacity ?? null,
    cost: vendor.cost ?? null,
    subEventIds: vendor.subEventIds.map(toId),
    contact: {
      name: vendor.contact?.name ?? null,
      phone: vendor.contact?.phone ?? null,
      email: vendor.contact?.email ?? null,
    },
    notes: vendor.notes ?? null,
    createdAt: toIso(vendor.createdAt),
    updatedAt: toIso(vendor.updatedAt),
  };
}
