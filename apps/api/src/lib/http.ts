import type { Request } from 'express';
import { objectIdSchema } from '@xperience/shared';

export function paramId(req: Request, name: string): string {
  return objectIdSchema.parse(req.params[name]);
}
