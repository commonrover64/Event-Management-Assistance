import { capacityRule } from './capacity.rule';
import { guestNeedsRule } from './guests.rule';
import { blockedTasksRule, dependencyOrderRule, overdueTasksRule } from './tasks.rule';
import type { RiskCandidate, Rule, RuleContext } from './types';
import { missingVendorRule, vendorCoverageRule } from './vendors.rule';

export const RULES: Rule[] = [
  capacityRule,
  missingVendorRule,
  vendorCoverageRule,
  overdueTasksRule,
  dependencyOrderRule,
  blockedTasksRule,
  guestNeedsRule,
];

export function runRules(ctx: RuleContext): RiskCandidate[] {
  // Finished or cancelled events have nothing left to go wrong
  if (ctx.event.status === 'completed' || ctx.event.status === 'cancelled') return [];
  return RULES.flatMap((rule) => rule(ctx));
}

export type { RiskCandidate, RuleContext } from './types';
