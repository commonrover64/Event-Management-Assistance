import type { Category, GuestNeed } from '@xperience/shared';
import { addTaskAction, confirmedVendors, hasActiveTask } from './helpers';
import type { Rule } from './types';

const CATEGORY_FOR_NEED: Record<GuestNeed, Category> = {
  accommodation: 'accommodation',
  airport_transfer: 'transportation',
  local_transport: 'transportation',
  dietary: 'catering',
  accessibility: 'logistics',
};

// A guest group needs something that no task or confirmed vendor is handling
export const guestNeedsRule: Rule = (ctx) =>
  ctx.guestSegments.flatMap((segment) =>
    segment.needs
      .filter((need) => {
        const category = CATEGORY_FOR_NEED[need];
        return (
          confirmedVendors(ctx.vendors, category).length === 0 &&
          !hasActiveTask(ctx.tasks, category)
        );
      })
      .map((need) => {
        const label = need.replace('_', ' ');
        return {
          ruleKey: `need:${segment.id}:${need}`,
          type: 'other' as const,
          severity: 'medium' as const,
          title: `Nothing planned for ${label} (${segment.label})`,
          description: `${segment.count} guests need ${label}, but no task or confirmed vendor covers it.`,
          related: [{ type: 'guest_segment' as const, id: segment.id }],
          suggestedActions: [
            addTaskAction(`Add a task for ${label}`, {
              title: `Arrange ${label} for ${segment.label} (${segment.count})`,
              category: CATEGORY_FOR_NEED[need],
            }),
          ],
        };
      }),
  );
