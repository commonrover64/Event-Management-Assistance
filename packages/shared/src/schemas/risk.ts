import { z } from 'zod';
import type { Timestamps } from './common';
import { riskStatusSchema } from './enums';
import type { EntityType, Level, RiskSource, RiskStatus, RiskType } from './enums';
import type { Operation } from './operations';

export interface EntityRef {
  type: EntityType;
  id: string;
}

// A suggestion can carry ready-made operations so the manager can apply it in one click
export interface SuggestedAction {
  label: string;
  operations: Operation[];
}

// Risks are raised by the system; the manager only resolves or dismisses them
export const updateRiskInputSchema = z.object({ status: riskStatusSchema });
export type UpdateRiskInput = z.infer<typeof updateRiskInputSchema>;

export interface Risk extends Timestamps {
  id: string;
  eventId: string;
  type: RiskType;
  severity: Level;
  title: string;
  description: string;
  related: EntityRef[];
  source: RiskSource;
  // Stable key for rule-based risks so re-running rules updates instead of duplicating
  ruleKey: string | null;
  status: RiskStatus;
  suggestedActions: SuggestedAction[];
  resolvedAt: string | null;
}
