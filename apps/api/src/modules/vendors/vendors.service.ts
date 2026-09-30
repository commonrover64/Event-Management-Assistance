import type { CreateVendorInput, UpdateVendorInput, Vendor } from '@xperience/shared';
import { notFound } from '../../lib/errors';
import { omitUndefined } from '../../lib/mapping';
import { applyPatch } from '../../lib/patch';
import { recordActivity, statusChangeAction } from '../activity/activity.service';
import type { MutationContext } from '../activity/activity.service';
import { assertSubEventsExist } from '../events/events.service';
import { toVendor } from './vendor.mapper';
import { VendorModel } from './vendor.model';
import type { VendorDoc } from './vendor.model';

// Contact is flattened to dotted paths so a patch of one field keeps the others
function toVendorPatch(input: UpdateVendorInput) {
  const { contact, subEventIds, ...rest } = input;
  return omitUndefined({
    ...rest,
    subEventIds: subEventIds && [...new Set(subEventIds)],
    'contact.name': contact?.name,
    'contact.phone': contact?.phone,
    'contact.email': contact?.email,
  });
}

export async function findVendorOrThrow(eventId: string, vendorId: string): Promise<VendorDoc> {
  const vendor = await VendorModel.findOne({ _id: vendorId, eventId });
  if (!vendor) throw notFound('Vendor');
  return vendor;
}

export async function listVendors(eventId: string): Promise<Vendor[]> {
  const vendors = await VendorModel.find({ eventId }).sort({ category: 1, name: 1 });
  return vendors.map(toVendor);
}

export async function createVendor(
  ctx: MutationContext,
  input: CreateVendorInput,
): Promise<Vendor> {
  if (input.subEventIds) await assertSubEventsExist(ctx.eventId, input.subEventIds);

  const vendor = await VendorModel.create({
    ...input,
    subEventIds: input.subEventIds && [...new Set(input.subEventIds)],
    eventId: ctx.eventId,
  });

  await recordActivity(ctx, {
    entityType: 'vendor',
    entityId: vendor._id.toString(),
    action: 'created',
    summary: `Added ${vendor.category} vendor "${vendor.name}"`,
  });
  return toVendor(vendor);
}

export async function updateVendor(
  ctx: MutationContext,
  vendorId: string,
  input: UpdateVendorInput,
): Promise<Vendor> {
  const vendor = await findVendorOrThrow(ctx.eventId, vendorId);
  if (input.subEventIds) await assertSubEventsExist(ctx.eventId, input.subEventIds);

  const statusBefore = vendor.status;
  const changes = applyPatch(vendor, toVendorPatch(input));
  if (changes.length === 0) return toVendor(vendor);

  await vendor.save();
  await recordActivity(ctx, {
    entityType: 'vendor',
    entityId: vendorId,
    action: statusChangeAction(statusBefore, vendor.status),
    summary: `Updated vendor "${vendor.name}": ${changes.join(', ')}`,
  });
  return toVendor(vendor);
}

export async function deleteVendor(ctx: MutationContext, vendorId: string): Promise<void> {
  const vendor = await findVendorOrThrow(ctx.eventId, vendorId);
  await vendor.deleteOne();

  await recordActivity(ctx, {
    entityType: 'vendor',
    entityId: vendorId,
    action: 'deleted',
    summary: `Removed vendor "${vendor.name}"`,
  });
}
