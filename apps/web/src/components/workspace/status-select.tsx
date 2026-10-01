import { humanize } from '@/lib/labels';
import { cn } from '@/lib/utils';

interface StatusSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

// Generic over the status union, so a task select can only emit task statuses
export function StatusSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
  className,
}: StatusSelectProps<T>) {
  return (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      // Safe: the only possible values are the options rendered from `options`
      onChange={(event) => onChange(event.target.value as T)}
      className={cn(
        'h-7 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50',
        className,
      )}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {humanize(option)}
        </option>
      ))}
    </select>
  );
}
