import mongoose from 'mongoose';
import { operationSchema } from '@xperience/shared';
import type { Operation, RejectedOperation } from '@xperience/shared';
import { AppError } from '../lib/errors';
import type { MutationContext } from '../modules/activity/activity.service';
import * as eventsService from '../modules/events/events.service';
import * as guestsService from '../modules/guests/guests.service';
import * as tasksService from '../modules/tasks/tasks.service';
import * as vendorsService from '../modules/vendors/vendors.service';
import { OperationError } from './operation-error';
import type { RefRegistry } from './ref-registry';
import * as risksService from '../modules/risks/risks.service';

// Swaps the model's refs for database ids, keeping every other field as-is
function withTaskIds<T extends { subEvent?: string | null; dependsOn?: string[] }>(
  data: T,
  refs: RefRegistry,
) {
  const { subEvent, dependsOn, ...rest } = data;
  return {
    ...rest,
    subEventId:
      subEvent === undefined ? undefined : subEvent && refs.resolve(subEvent, 'sub_event'),
    dependsOn: dependsOn?.map((ref) => refs.resolve(ref, 'task')),
  };
}

function withVendorIds<T extends { subEvents?: string[] }>(data: T, refs: RefRegistry) {
  const { subEvents, ...rest } = data;
  return { ...rest, subEventIds: subEvents?.map((ref) => refs.resolve(ref, 'sub_event')) };
}

// Creates an item and, if the model named it, makes that name usable by later operations
async function create(
  refs: RefRegistry,
  ref: string | undefined,
  type: Parameters<RefRegistry['alias']>[1],
  run: () => Promise<{ id: string }>,
): Promise<void> {
  if (ref) refs.assertAvailable(ref);
  const created = await run();
  if (ref) refs.alias(ref, type, created.id);
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// The prompt asks for updates over duplicates; this enforces it for exact name matches
async function findDuplicate(
  ctx: MutationContext,
  op: Operation,
): Promise<{ id: string; name: string } | undefined> {
  switch (op.op) {
    case 'addSubEvent': {
      const { subEvents } = await eventsService.getEvent(ctx.eventId);
      return subEvents.find((s) => s.status !== 'cancelled' && sameName(s.name, op.data.name));
    }
    case 'addTask': {
      const tasks = await tasksService.listTasks(ctx.eventId);
      const match = tasks.find((t) => t.status !== 'cancelled' && sameName(t.title, op.data.title));
      return match && { id: match.id, name: match.title };
    }
    case 'addVendor': {
      const vendors = await vendorsService.listVendors(ctx.eventId);
      return vendors.find(
        (v) =>
          v.status !== 'cancelled' &&
          v.category === op.data.category &&
          sameName(v.name, op.data.name),
      );
    }
    case 'addRisk': {
      const risks = await risksService.listOpenRisks(ctx.eventId);
      const match = risks.find((r) => sameName(r.title, op.data.title));
      return match && { id: match.id, name: match.title };
    }
    default:
      return undefined;
  }
}

async function applyOperation(ctx: MutationContext, op: Operation, refs: RefRegistry) {
  const duplicate = await findDuplicate(ctx, op);
  if (duplicate) {
    const ref = refs.refOf(duplicate.id);
    throw new OperationError(
      `"${duplicate.name}" already exists${ref ? ` as ${ref}` : ''}; update it instead of adding another`,
    );
  }

  switch (op.op) {
    case 'updateEvent':
      return eventsService.updateEvent(ctx, op.patch);

    case 'addSubEvent':
      return create(refs, op.ref, 'sub_event', async () => {
        const { subEvent } = await eventsService.addSubEvent(ctx, op.data);
        return subEvent;
      });
    case 'updateSubEvent':
      return eventsService.updateSubEvent(ctx, refs.resolve(op.target, 'sub_event'), op.patch);

    case 'addTask':
      return create(refs, op.ref, 'task', () =>
        tasksService.createTask(ctx, withTaskIds(op.data, refs)),
      );
    case 'updateTask':
      return tasksService.updateTask(
        ctx,
        refs.resolve(op.target, 'task'),
        withTaskIds(op.patch, refs),
      );

    case 'addVendor':
      return create(refs, op.ref, 'vendor', () =>
        vendorsService.createVendor(ctx, withVendorIds(op.data, refs)),
      );
    case 'updateVendor':
      return vendorsService.updateVendor(
        ctx,
        refs.resolve(op.target, 'vendor'),
        withVendorIds(op.patch, refs),
      );

    case 'addGuestSegment':
      return create(refs, op.ref, 'guest_segment', () => guestsService.createSegment(ctx, op.data));
    case 'updateGuestSegment':
      return guestsService.updateSegment(ctx, refs.resolve(op.target, 'guest_segment'), op.patch);

    case 'addRisk': {
      const { related, suggestions, ...rest } = op.data;
      return risksService.createAiRisk(ctx, {
        ...rest,
        related: (related ?? []).map((ref) => refs.resolveAny(ref)),
        suggestions: suggestions ?? [],
      });
    }
    case 'resolveRisk':
      return risksService.resolveAiRisk(ctx, refs.resolve(op.target, 'risk'));

    default: {
      // Compile error here means a new operation type was added without a handler
      const unhandled: never = op;
      throw new OperationError(`Unsupported operation: ${JSON.stringify(unhandled)}`);
    }
  }
}

// Business-rule failures reject one operation; anything else (db down, bugs) aborts the turn
function isOperationFailure(err: unknown): err is Error {
  return (
    err instanceof OperationError ||
    (err instanceof AppError && err.status < 500) ||
    err instanceof mongoose.Error.ValidationError ||
    err instanceof mongoose.Error.CastError
  );
}

/**
 * Validates and applies the model's operations in order.
 * Each one succeeds or is rejected on its own; the rejected list is returned.
 */

// Models often send null for "unknown" when creating; for a new item that just means "not set"
function dropNullsFromCreate(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || !('op' in raw) || !('data' in raw)) return raw;
  if (typeof raw.op !== 'string' || !raw.op.startsWith('add')) return raw;
  if (typeof raw.data !== 'object' || raw.data === null) return raw;

  const data = Object.fromEntries(Object.entries(raw.data).filter(([, v]) => v !== null));
  return { ...raw, data };
}

export async function executeOperations(
  ctx: MutationContext,
  rawOperations: unknown[],
  refs: RefRegistry,
): Promise<RejectedOperation[]> {
  const rejected: RejectedOperation[] = [];

  for (const raw of rawOperations) {
    const parsed = operationSchema.safeParse(dropNullsFromCreate(raw));
    if (!parsed.success) {
      const reason = parsed.error.issues
        .map((i) => `${i.path.map(String).join('.') || 'operation'}: ${i.message}`)
        .join('; ');
      rejected.push({ operation: raw, reason });
      continue;
    }

    const op = parsed.data;
    try {
      await applyOperation(ctx, op, refs);
    } catch (err) {
      if (!isOperationFailure(err)) throw err;
      if ('ref' in op && op.ref) refs.block(op.ref);
      rejected.push({ operation: raw, reason: err.message });
    }
  }

  return rejected;
}
