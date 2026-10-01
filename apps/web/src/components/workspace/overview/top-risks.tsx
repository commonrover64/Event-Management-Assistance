import { ShieldCheck } from 'lucide-react';
import type { Risk } from '@xperience/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeverityBadge } from '../severity-badge';

const LIMIT = 3;

// The API returns open risks first, most severe first
export function TopRisks({ risks }: { risks: Risk[] }) {
  const open = risks.filter((r) => r.status === 'open');

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">Needs attention</CardTitle>
      </CardHeader>
      <CardContent>
        {open.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" aria-hidden />
            No open risks right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {open.slice(0, LIMIT).map((risk) => (
              <li key={risk.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={risk.severity} />
                  <span className="text-sm font-medium">{risk.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{risk.description}</p>
              </li>
            ))}
            {open.length > LIMIT && (
              <li className="text-xs text-muted-foreground">+{open.length - LIMIT} more</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
