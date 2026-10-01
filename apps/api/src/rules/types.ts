import type {
  EntityRef,
  EventDetails,
  GuestSegment,
  Level,
  RiskType,
  SuggestedAction,
  Task,
  Vendor,
} from '@xperience/shared';

export interface RuleContext {
  event: EventDetails;
  tasks: Task[];
  vendors: Vendor[];
  guestSegments: GuestSegment[];
  now: Date;
}

// What a rule reports; the risks service turns these into stored risks
export interface RiskCandidate {
  // Stable identity of the problem, e.g. "capacity:transportation"
  ruleKey: string;
  type: RiskType;
  severity: Level;
  title: string;
  description: string;
  related: EntityRef[];
  suggestedActions: SuggestedAction[];
}

// Rules are pure: same input, same output, no database access
export type Rule = (ctx: RuleContext) => RiskCandidate[];
