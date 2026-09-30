import { badRequest } from '../../lib/errors';
import { TaskModel } from './task.model';

type DependencyGraph = Map<string, string[]>;

// Follows dependencies from `start`; reaching `start` again means a cycle
function leadsBackTo(start: string, graph: DependencyGraph): boolean {
  const stack = [...(graph.get(start) ?? [])];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    if (current === start) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    stack.push(...(graph.get(current) ?? []));
  }
  return false;
}

/**
 * Ensures every dependency is a task in the same event and, when updating an
 * existing task, that the new edges don't form a cycle (A → B → A).
 */
export async function assertValidDependencies(
  eventId: string,
  dependsOn: string[],
  taskId?: string,
): Promise<void> {
  if (dependsOn.length === 0) return;
  if (taskId && dependsOn.includes(taskId)) throw badRequest('A task cannot depend on itself');

  const tasks = await TaskModel.find({ eventId }, { dependsOn: 1 }).lean();
  const graph: DependencyGraph = new Map(
    tasks.map((t) => [t._id.toString(), t.dependsOn.map((id) => id.toString())]),
  );

  const missing = dependsOn.filter((id) => !graph.has(id));
  if (missing.length > 0) throw badRequest('Unknown task dependency', { missing });

  // A brand-new task has no dependents yet, so it cannot close a cycle
  if (!taskId) return;
  graph.set(taskId, dependsOn);
  if (leadsBackTo(taskId, graph)) throw badRequest('This dependency would create a cycle');
}
