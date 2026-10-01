import type { Category, GuestNeed } from '@xperience/shared';
import { addTaskAction, capitalize, confirmedVendors, daysUntil, maxLevel } from './helpers';
import type { Rule, RuleContext } from './types';

const PEOPLE_CATEGORIES: Category[] = ['venue', 'catering', 'transportation', 'accommodation'];

// Transport and rooms are often needed by a subset of guests rather than everyone
const NEEDS_BY_CATEGORY: Partial<Record<Category, GuestNeed[]>> = {
  transportation: ['airport_transfer', 'local_transport'],
  accommodation: ['accommodation'],
};

function demandFor(category: Category, ctx: RuleContext): { count: number; basis: string } {
  const needs = NEEDS_BY_CATEGORY[category];
  const segments = needs
    ? ctx.guestSegments.filter((g) => g.needs.some((n) => needs.includes(n)))
    : [];

  if (segments.length > 0) {
    return {
      count: segments.reduce((sum, g) => sum + g.count, 0),
      basis: segments.map((g) => g.label).join(', '),
    };
  }
  return { count: ctx.event.headcount, basis: 'event headcount' };
}

// Confirmed capacity in a category is lower than the number of people who need it
export const capacityRule: Rule = (ctx) =>
  PEOPLE_CATEGORIES.flatMap((category) => {
    const vendors = confirmedVendors(ctx.vendors, category);
    // Unknown capacity means we can't judge, so stay quiet rather than guess
    if (vendors.length === 0 || vendors.some((v) => v.capacity === null)) return [];

    const capacity = vendors.reduce((sum, v) => sum + (v.capacity ?? 0), 0);
    const demand = demandFor(category, ctx);
    const shortfall = demand.count - capacity;
    if (shortfall <= 0) return [];

    const daysLeft = daysUntil(ctx.event.startDate, ctx.now);
    const severity = maxLevel(
      shortfall / demand.count >= 0.25 ? 'high' : 'medium',
      daysLeft <= 14 ? 'critical' : 'low',
    );

    return [
      {
        ruleKey: `capacity:${category}`,
        type: 'capacity_mismatch',
        severity,
        title: `${capitalize(category)} capacity short by ${shortfall}`,
        description: `Confirmed ${category} vendors cover ${capacity} people, but ${demand.count} need it (${demand.basis}).`,
        related: vendors.map((v) => ({ type: 'vendor', id: v.id })),
        suggestedActions: [
          addTaskAction(`Add a task to cover the remaining ${shortfall}`, {
            title: `Arrange ${category} for the remaining ${shortfall} people`,
            category,
          }),
        ],
      },
    ];
  });
