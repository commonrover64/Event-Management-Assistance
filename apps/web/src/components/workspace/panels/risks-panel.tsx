'use client';

import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { EventDetails } from '@xperience/shared';
import { useEntityNames } from '@/hooks/use-entity-names';
import { useRisks } from '@/hooks/use-event-data';
import { useApplyRiskAction, useUpdateRiskStatus } from '@/hooks/use-event-mutations';
import { EmptyState } from '../empty-state';
import { RiskCard } from './risk-card';

export function RisksPanel({ event }: { event: EventDetails }) {
  const { data: risks = [] } = useRisks(event.id);
  const names = useEntityNames(event);
  const applyAction = useApplyRiskAction(event.id);
  const updateStatus = useUpdateRiskStatus(event.id);

  const open = risks.filter((r) => r.status === 'open');
  const closed = risks.filter((r) => r.status !== 'open');
  const busy = applyAction.isPending || updateStatus.isPending;

  const renderCard = (risk: (typeof risks)[number]) => (
    <RiskCard
      key={risk.id}
      risk={risk}
      names={names}
      busy={busy}
      onStatusChange={(status) => updateStatus.mutate({ riskId: risk.id, status })}
      onApply={(index) =>
        applyAction.mutate(
          { riskId: risk.id, index },
          {
            onSuccess: (rejected) => {
              const [first] = rejected;
              if (first) toast.warning(`Not applied: ${first.reason}`);
              else toast.success('Suggestion applied');
            },
          },
        )
      }
    />
  );

  return (
    <div className="space-y-4">
      {open.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No open risks"
          description="Checks run automatically whenever the plan changes."
        />
      ) : (
        <div className="space-y-3">{open.map(renderCard)}</div>
      )}

      {closed.length > 0 && (
        <details className="space-y-3">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Resolved and dismissed ({closed.length})
          </summary>
          <div className="mt-3 space-y-3">{closed.map(renderCard)}</div>
        </details>
      )}
    </div>
  );
}
