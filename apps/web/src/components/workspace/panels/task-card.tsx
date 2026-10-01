import { Sparkles } from 'lucide-react';
import { TASK_STATUSES } from '@xperience/shared';
import type { Task, TaskStatus } from '@xperience/shared';
import { formatDate } from '@/lib/format';
import { humanize } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { SeverityBadge } from '../severity-badge';
import { StatusSelect } from '../status-select';

interface TaskCardProps {
  task: Task;
  timezone: string;
  names: Map<string, string>;
  waitingOn: string[];
  onStatusChange: (status: TaskStatus) => void;
  busy: boolean;
}

export function TaskCard({
  task,
  timezone,
  names,
  waitingOn,
  onStatusChange,
  busy,
}: TaskCardProps) {
  const isOpen = task.status !== 'done' && task.status !== 'cancelled';
  const isOverdue = isOpen && task.dueDate !== null && new Date(task.dueDate) < new Date();

  return (
    <li className="space-y-2 rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            'font-medium',
            task.status === 'done' && 'text-muted-foreground line-through',
          )}
        >
          {task.title}
        </p>
        {task.createdBy === 'ai' && (
          <Sparkles
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            aria-label="Created by the assistant"
          />
        )}
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <SeverityBadge severity={task.priority} />
        <span>{humanize(task.category)}</span>
        {task.dueDate && (
          <span className={cn(isOverdue && 'font-medium text-destructive')}>
            {isOverdue ? 'Overdue · ' : 'Due '}
            {formatDate(task.dueDate, timezone)}
          </span>
        )}
        {task.subEventId && <span>· {names.get(task.subEventId)}</span>}
      </p>

      {waitingOn.length > 0 && isOpen && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Waiting on: {waitingOn.join(', ')}
        </p>
      )}

      <StatusSelect
        label={`Status of ${task.title}`}
        value={task.status}
        options={TASK_STATUSES}
        onChange={onStatusChange}
        disabled={busy}
      />
    </li>
  );
}
