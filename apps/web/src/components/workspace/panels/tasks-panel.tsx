'use client';

import { ListTodo } from 'lucide-react';
import type { EventDetails, TaskStatus } from '@xperience/shared';
import { useEntityNames } from '@/hooks/use-entity-names';
import { useTasks } from '@/hooks/use-event-data';
import { useUpdateTask } from '@/hooks/use-event-mutations';
import { humanize } from '@/lib/labels';
import { EmptyState } from '../empty-state';
import { TaskCard } from './task-card';

const BOARD_COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

export function TasksPanel({ event }: { event: EventDetails }) {
  const { data: tasks = [] } = useTasks(event.id);
  const names = useEntityNames(event);
  const updateTask = useUpdateTask(event.id);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListTodo}
        title="No tasks yet"
        description="Describe what the event needs and the assistant will break it into tasks."
      />
    );
  }

  const statusById = new Map(tasks.map((t) => [t.id, t.status]));
  // Dependencies still open, shown as "Waiting on" so blockers are obvious at a glance
  const openDependencies = (dependsOn: string[]) =>
    dependsOn
      .filter((id) => {
        const status = statusById.get(id);
        return status !== undefined && status !== 'done' && status !== 'cancelled';
      })
      .map((id) => names.get(id) ?? 'another task');

  const cancelled = tasks.filter((t) => t.status === 'cancelled').length;

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {BOARD_COLUMNS.map((status) => {
          const column = tasks.filter((t) => t.status === status);
          return (
            <section key={status} aria-label={humanize(status)} className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {humanize(status)} · {column.length}
              </h3>
              <ul className="space-y-2">
                {column.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    timezone={event.timezone}
                    names={names}
                    waitingOn={openDependencies(task.dependsOn)}
                    busy={updateTask.isPending && updateTask.variables.taskId === task.id}
                    onStatusChange={(next) =>
                      updateTask.mutate({ taskId: task.id, input: { status: next } })
                    }
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {cancelled > 0 && (
        <p className="text-xs text-muted-foreground">{cancelled} cancelled tasks hidden</p>
      )}
    </div>
  );
}
