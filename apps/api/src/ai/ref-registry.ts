import type { EntityType } from '@xperience/shared';

type RefType = Exclude<EntityType, 'event'>;

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

  register(type: RefType, id: string): string {
    const existing = this.byId.get(id);
    if (existing) return existing;

    const next = (this.counters.get(type) ?? 0) + 1;
    this.counters.set(type, next);
    const ref = `${PREFIXES[type]}${next}`;
    this.add(ref, type, id);
    return ref;
  }

  // Refs chosen by the model for items it creates in the same batch
  alias(ref: string, type: RefType, id: string): void {
    if (!this.byRef.has(ref)) this.add(ref, type, id);
  }

  refOf(id: string): string | undefined {
    return this.byId.get(id);
  }

  // Returns the database id, or throws a message the model's mistake can be reported with
  resolve(ref: string, expected: RefType): string {
    const target = this.byRef.get(ref);
    if (!target) throw new Error(`Unknown reference "${ref}"`);
    if (target.type !== expected) {
      throw new Error(`Reference "${ref}" is a ${target.type}, expected a ${expected}`);
    }
    return target.id;
  }

  private add(ref: string, type: RefType, id: string): void {
    this.byRef.set(ref, { type, id });
    this.byId.set(id, ref);
  }
}
