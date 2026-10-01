import type { Operation, Risk } from '@xperience/shared';
import { toId, toIso, toIsoOrNull } from '../../lib/mapping';
import type { RiskDoc } from './risk.model';

export function toRisk(risk: RiskDoc): Risk {
  return {
    id: toId(risk._id),
    eventId: toId(risk.eventId),
    type: risk.type,
    severity: risk.severity,
    title: risk.title,
    description: risk.description,
    related: risk.related.map((r) => ({ type: r.type, id: r.id })),
    source: risk.source,
    ruleKey: risk.ruleKey ?? null,
    status: risk.status,
    suggestedActions: risk.suggestedActions.map((a) => ({
      label: a.label,
      // Stored as Mixed; written only from typed rule output
      operations: a.operations as Operation[],
    })),
    resolvedAt: toIsoOrNull(risk.resolvedAt),
    createdAt: toIso(risk.createdAt),
    updatedAt: toIso(risk.updatedAt),
  };
}
