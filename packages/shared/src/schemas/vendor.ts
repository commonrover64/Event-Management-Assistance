import { z } from 'zod';
import { objectIdSchema, optionalText, requiredText } from './common';
import type { Timestamps } from './common';
import { categorySchema, vendorStatusSchema } from './enums';
import type { Category, VendorStatus } from './enums';

const vendorContactSchema = z.object({
  name: optionalText(100),
  phone: optionalText(30),
  email: z.email().optional(),
});

export const vendorFieldsSchema = z.object({
  name: requiredText(120),
  category: categorySchema,
  status: vendorStatusSchema.optional(),
  // How many people this vendor can serve, e.g. total seats across all vehicles
  capacity: z.number().int().positive().nullable().optional(),
  cost: z.number().nonnegative().nullable().optional(),
  subEventIds: z.array(objectIdSchema).optional(),
  contact: vendorContactSchema.optional(),
  notes: optionalText(1000),
});
export const createVendorInputSchema = vendorFieldsSchema;
export const updateVendorInputSchema = vendorFieldsSchema.partial();
export type CreateVendorInput = z.infer<typeof createVendorInputSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorInputSchema>;

export interface Vendor extends Timestamps {
  id: string;
  eventId: string;
  name: string;
  category: Category;
  status: VendorStatus;
  capacity: number | null;
  cost: number | null;
  subEventIds: string[];
  contact: { name: string | null; phone: string | null; email: string | null };
  notes: string | null;
}
