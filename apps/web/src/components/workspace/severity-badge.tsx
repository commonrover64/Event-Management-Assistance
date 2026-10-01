import type { Level } from '@xperience/shared';
import { cn } from '@/lib/utils';
import { SEVERITY_STYLES } from '@/lib/labels';

export function SeverityBadge({ severity, className }: { severity: Level; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        SEVERITY_STYLES[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}
