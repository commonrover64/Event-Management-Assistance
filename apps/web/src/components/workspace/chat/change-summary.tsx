import { Ban, CheckCircle2, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ActivityAction, AppliedChange, RejectedOperation } from '@xperience/shared';
import { humanize } from '@/lib/labels';

const ACTION_ICONS: Record<ActivityAction, LucideIcon> = {
  created: Plus,
  updated: Pencil,
  cancelled: Ban,
  resolved: CheckCircle2,
  deleted: Trash2,
};

interface ChangeSummaryProps {
  changes: AppliedChange[];
  rejected: RejectedOperation[];
}

// What one assistant reply actually did to the plan, straight from the activity log
export function ChangeSummary({ changes, rejected }: ChangeSummaryProps) {
  if (changes.length === 0 && rejected.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 rounded-lg border bg-background p-3 text-xs">
      {changes.length > 0 && (
        <ul className="space-y-1.5">
          {changes.map((change, index) => {
            const Icon = ACTION_ICONS[change.action];
            return (
              <li key={`${change.entityId}-${index}`} className="flex items-start gap-2">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>
                  <span className="text-muted-foreground">{humanize(change.entityType)} · </span>
                  {change.summary}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {rejected.length > 0 && (
        <details className="text-amber-700 dark:text-amber-300">
          <summary className="flex cursor-pointer items-center gap-2">
            <TriangleAlert className="size-3.5" aria-hidden />
            {rejected.length} proposed {rejected.length === 1 ? 'change' : 'changes'} not applied
          </summary>
          <ul className="mt-1.5 list-disc space-y-1 pl-6 text-muted-foreground">
            {rejected.map((item, index) => (
              <li key={index}>{item.reason}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
