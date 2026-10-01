import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  // 0–1; renders a progress bar when provided
  progress?: number;
}

export function StatCard({ icon: Icon, label, value, detail, progress }: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {progress !== undefined && (
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={label}
          >
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  );
}
