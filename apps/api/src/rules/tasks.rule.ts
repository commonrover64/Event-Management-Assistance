import type { Task } from '@xperience/shared';
import { daysUntil, isOpenTask, plural } from './helpers';
import type { Rule } from './types';

const BLOCKED_WINDOW_DAYS = 7;
const MAX_LISTED = 5;

// One summary risk for everything past its due date
export const overdueTasksRule: Rule = (ctx) => {
  const overdue = ctx.tasks.filter(
    (t) => isOpenTask(t) && t.dueDate && daysUntil(t.dueDate, ctx.now) < 0,
  );
  if (overdue.length === 0) return [];

  const urgent = overdue.some((t) => t.priority === 'high' || t.priority === 'critical');
  const listed = overdue
    .slice(0, MAX_LISTED)
    .map((t) => `"${t.title}"`)
    .join(', ');

  return [
    {
      ruleKey: 'overdue_tasks',
      type: 'deadline_risk',
      severity: urgent || overdue.length >= MAX_LISTED ? 'high' : 'medium',
      title: `${plural(overdue.length, 'task')} overdue`,
      description: `Past due: ${listed}${overdue.length > MAX_LISTED ? ' and more' : ''}.`,
      related: overdue.map((t) => ({ type: 'task', id: t.id })),
      suggestedActions: [],
    },
  ];
};

// A task is due before a task it depends on, so its deadline cannot be met
export const dependencyOrderRule: Rule = (ctx) => {
  const byId = new Map(ctx.tasks.map((t) => [t.id, t]));

  return ctx.tasks.filter(isOpenTask).flatMap((task) =>
    task.dependsOn
      .map((id) => byId.get(id))
      .filter((dep): dep is Task => dep !== undefined && isOpenTask(dep))
      .filter((dep) => task.dueDate && dep.dueDate && dep.dueDate > task.dueDate)
      .map((dep) => ({
        ruleKey: `order:${task.id}:${dep.id}`,
        type: 'schedule_conflict' as const,
        severity: 'medium' as const,
        title: `"${task.title}" is due before what it depends on`,
        description: `It cannot start until "${dep.title}" is done, but that is due later (${dep.dueDate?.slice(0, 10)}).`,
        related: [
          { type: 'task' as const, id: task.id },
          { type: 'task' as const, id: dep.id },
        ],
        suggestedActions: [
          {
            label: `Move the due date to ${dep.dueDate?.slice(0, 10)}`,
            operations: [
              { op: 'updateTask' as const, target: task.id, patch: { dueDate: dep.dueDate } },
            ],
          },
        ],
      })),
  );
};

// A task due soon still waits on unfinished work
export const blockedTasksRule: Rule = (ctx) => {
  const byId = new Map(ctx.tasks.map((t) => [t.id, t]));

  return ctx.tasks
    .filter(
      (t) => isOpenTask(t) && t.dueDate && daysUntil(t.dueDate, ctx.now) <= BLOCKED_WINDOW_DAYS,
    )
    .flatMap((task) => {
      const blockers = task.dependsOn
        .map((id) => byId.get(id))
        .filter((dep): dep is Task => dep !== undefined && isOpenTask(dep));
      if (blockers.length === 0) return [];

      return [
        {
          ruleKey: `blocked:${task.id}`,
          type: 'dependency_blocked' as const,
          severity: 'high' as const,
          title: `"${task.title}" is blocked`,
          description: `Due within ${BLOCKED_WINDOW_DAYS} days but still waiting on ${blockers.map((b) => `"${b.title}"`).join(', ')}.`,
          related: [task, ...blockers].map((t) => ({ type: 'task' as const, id: t.id })),
          suggestedActions: blockers.map((b) => ({
            label: `Prioritise "${b.title}"`,
            operations: [
              { op: 'updateTask' as const, target: b.id, patch: { priority: 'critical' as const } },
            ],
          })),
        },
      ];
    });
};
