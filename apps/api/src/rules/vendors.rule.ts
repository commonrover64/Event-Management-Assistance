import type { Category, EventType } from '@xperience/shared';
import {
  addTaskAction,
  confirmedVendors,
  daysUntil,
  hasActiveTask,
  isActiveTask,
  maxLevel,
  urgencyFor,
} from './helpers';
import type { Rule } from './types';

const ESSENTIAL: Record<EventType, Category[]> = {
  wedding: ['venue', 'catering', 'decor', 'photography'],
  corporate: ['venue', 'catering', 'transportation', 'accommodation'],
  conference: ['venue', 'catering', 'audio_visual'],
  social: ['venue', 'catering'],
  other: ['venue'],
};

// Categories that are normally fulfilled by an external vendor
const VENDOR_CATEGORIES = new Set<Category>([
  'venue',
  'catering',
  'decor',
  'photography',
  'entertainment',
  'accommodation',
  'transportation',
  'branding',
  'activities',
  'audio_visual',
]);

// A needed category (essential for this event type, or has tasks) has no confirmed vendor
export const missingVendorRule: Rule = (ctx) => {
  const needed = new Set<Category>(ESSENTIAL[ctx.event.type]);
  ctx.tasks.filter(isActiveTask).forEach((t) => needed.add(t.category));

  const severity = urgencyFor(daysUntil(ctx.event.startDate, ctx.now));

  return [...needed]
    .filter((c) => VENDOR_CATEGORIES.has(c) && confirmedVendors(ctx.vendors, c).length === 0)
    .map((category) => ({
      ruleKey: `missing_vendor:${category}`,
      type: 'missing_vendor' as const,
      severity,
      title: `No confirmed ${category} vendor`,
      description: `The event needs ${category}, but no ${category} vendor is confirmed yet.`,
      related: [],
      suggestedActions: hasActiveTask(ctx.tasks, category)
        ? []
        : [
            addTaskAction(`Add a task to book ${category}`, {
              title: `Shortlist and confirm a ${category} vendor`,
              category,
            }),
          ],
    }));
};

// A vendor assigned to a sub-event dropped out and nobody confirmed covers it now
export const vendorCoverageRule: Rule = (ctx) =>
  ctx.event.subEvents
    .filter((sub) => sub.status !== 'cancelled')
    .flatMap((sub) => {
      const lost = ctx.vendors.filter(
        (v) =>
          (v.status === 'unavailable' || v.status === 'cancelled') &&
          v.subEventIds.includes(sub.id),
      );
      const categories = [...new Set(lost.map((v) => v.category))];

      return categories
        .filter(
          (category) =>
            // A confirmed vendor with no sub-events listed is treated as covering all of them
            !confirmedVendors(ctx.vendors, category).some(
              (v) => v.subEventIds.length === 0 || v.subEventIds.includes(sub.id),
            ),
        )
        .map((category) => ({
          ruleKey: `coverage:${sub.id}:${category}`,
          type: 'vendor_unavailable' as const,
          severity: maxLevel('high', urgencyFor(daysUntil(sub.startAt, ctx.now))),
          title: `No ${category} vendor for ${sub.name}`,
          description: `${lost
            .filter((v) => v.category === category)
            .map((v) => v.name)
            .join(
              ', ',
            )} can no longer cover ${sub.name}, and no other confirmed ${category} vendor does.`,
          related: [
            { type: 'sub_event' as const, id: sub.id },
            ...lost
              .filter((v) => v.category === category)
              .map((v) => ({ type: 'vendor' as const, id: v.id })),
          ],
          suggestedActions: [
            addTaskAction(`Add a task to replace the ${category} vendor`, {
              title: `Find a replacement ${category} vendor for ${sub.name}`,
              category,
              subEvent: sub.id,
            }),
          ],
        }));
    });
