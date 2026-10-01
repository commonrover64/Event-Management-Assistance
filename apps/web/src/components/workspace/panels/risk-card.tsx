import { Bot, Wand2 } from 'lucide-react';
import type { Risk, RiskStatus } from '@xperience/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '../severity-badge';

interface RiskCardProps {
  risk: Risk;
  names: Map<string, string>;
  onApply: (index: number) => void;
  onStatusChange: (status: RiskStatus) => void;
  busy: boolean;
}

export function RiskCard({ risk, names, onApply, onStatusChange, busy }: RiskCardProps) {
  const isOpen = risk.status === 'open';
  const related = risk.related.map((e) => names.get(e.id)).filter(Boolean);

  return (
    <Card size="sm" className={isOpen ? undefined : 'opacity-70'}>
      <CardContent className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={risk.severity} />
          <h3 className="text-sm font-medium">{risk.title}</h3>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            {risk.source === 'ai' ? (
              <>
                <Bot className="size-3.5" aria-hidden /> Raised by assistant
              </>
            ) : (
              'Auto-detected'
            )}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{risk.description}</p>
        {related.length > 0 && (
          <p className="text-xs text-muted-foreground">Affects: {related.join(', ')}</p>
        )}

        {isOpen && risk.suggestedActions.length > 0 && (
          <div className="space-y-1.5">
            {risk.suggestedActions.map((action, index) =>
              action.operations.length > 0 ? (
                <Button
                  key={action.label}
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onApply(index)}
                >
                  <Wand2 className="size-3.5" aria-hidden />
                  {action.label}
                </Button>
              ) : (
                // AI suggestions are advice only; there is nothing to execute
                <p key={action.label} className="text-xs">
                  · {action.label}
                </p>
              ),
            )}
          </div>
        )}

        <div className="flex justify-end">
          {isOpen ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              // Rule risks come back if the problem persists, so they are dismissed, not resolved
              onClick={() => onStatusChange(risk.source === 'ai' ? 'resolved' : 'dismissed')}
            >
              {risk.source === 'ai' ? 'Mark resolved' : 'Dismiss'}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => onStatusChange('open')}
            >
              Reopen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
