import type { EntityType } from '@xperience/shared';
import { OperationError } from './operation-error';

export type RefType = Exclude<EntityType, 'event'>;

const PREFIXES: Record<RefType, string> = {
  sub_event: 'S',
  task: 'T',
  vendor: 'V',
  guest_segment: 'G',
  risk: 'R',
};

interface RefTarget {
  type: RefType;
  id: string;
}

/**
 * Maps short, model-friendly handles ("T3") to database ids and back.
 * New items created during a batch are added under the ref the model chose.
 */
export class RefRegistry {
  private readonly byRef = new Map<string, RefTarget>();
  private readonly byId = new Map<string, string>();
  private readonly counters = new Map<RefType, number>();
  // Refs whose creation failed or clashed; later operations must not silently use them
  private readonly blocked = new Set<string>();

  register(type: RefType, id: string): string {
    const existing = this.byId.get(id);
    if (existing) return existing;

    const next = (this.counters.get(type) ?? 0) + 1;
    this.counters.set(type, next);
    const ref = `${PREFIXES[type]}${next}`;
    this.add(ref, type, id);
    return ref;
  }

  // Called before creating an item, so a clashing ref is rejected with no side effects
  assertAvailable(ref: string): void {
    if (this.byRef.has(ref) || this.blocked.has(ref)) {
      throw new OperationError(
        `Reference "${ref}" is already in use; new items need a unique "new-" ref`,
      );
    }
  }

  // Refs chosen by the model for items it creates in the same batch
  alias(ref: string, type: RefType, id: string): void {
    this.assertAvailable(ref);
    this.add(ref, type, id);
  }

  // After a failed or clashing create, the ref is ambiguous for the rest of the turn
  block(ref: string): void {
    this.blocked.add(ref);
  }

  refOf(id: string): string | undefined {
    return this.byId.get(id);
  }

  resolve(ref: string, expected: RefType): string {
    if (this.blocked.has(ref)) {
      throw new OperationError(
        `"${ref}" is ambiguous or refers to an item that could not be created`,
      );
    }
    const target = this.byRef.get(ref);
    if (!target) throw new OperationError(`Unknown reference "${ref}"`);
    if (target.type !== expected) {
      throw new OperationError(`Reference "${ref}" is a ${target.type}, expected a ${expected}`);
    }
    return target.id;
  }

  private add(ref: string, type: RefType, id: string): void {
    this.byRef.set(ref, { type, id });
    this.byId.set(id, ref);
  }
}
