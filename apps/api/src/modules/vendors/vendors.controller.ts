import type { Request, Response } from 'express';
import { createVendorInputSchema, updateVendorInputSchema } from '@xperience/shared';
import { paramId } from '../../lib/http';
import { getEventId, userMutationContext } from '../events/event-access';
import * as vendorsService from './vendors.service';

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ vendors: await vendorsService.listVendors(getEventId(req)) });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createVendorInputSchema.parse(req.body);
  res
    .status(201)
    .json({ vendor: await vendorsService.createVendor(userMutationContext(req), input) });
}

export async function update(req: Request, res: Response): Promise<void> {
  const input = updateVendorInputSchema.parse(req.body);
  const vendor = await vendorsService.updateVendor(
    userMutationContext(req),
    paramId(req, 'vendorId'),
    input,
  );
  res.json({ vendor });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await vendorsService.deleteVendor(userMutationContext(req), paramId(req, 'vendorId'));
  res.status(204).end();
}
