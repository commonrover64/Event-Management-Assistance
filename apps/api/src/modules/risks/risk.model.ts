import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { ENTITY_TYPES, LEVELS, RISK_SOURCES, RISK_STATUSES, RISK_TYPES } from '@xperience/shared';

const entityRefSchema = new Schema(
  {
    type: { type: String, enum: ENTITY_TYPES, required: true },
    id: { type: String, required: true },
  },
  { _id: false },
);

const suggestedActionSchema = new Schema(
  {
    label: { type: String, required: true },
    // Operations use database ids, not snapshot refs, because refs change every turn
    operations: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false },
);

const riskSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    type: { type: String, enum: RISK_TYPES, required: true },
    severity: { type: String, enum: LEVELS, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    related: { type: [entityRefSchema], default: [] },
    source: { type: String, enum: RISK_SOURCES, required: true },
    ruleKey: { type: String, default: null },
    status: { type: String, enum: RISK_STATUSES, default: 'open' },
    suggestedActions: { type: [suggestedActionSchema], default: [] },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

riskSchema.index({ eventId: 1, status: 1 });
// At most one stored risk per rule problem, even if two evaluations race
riskSchema.index(
  { eventId: 1, ruleKey: 1 },
  { unique: true, partialFilterExpression: { ruleKey: { $type: 'string' } } },
);

export type RiskDoc = HydratedDocumentFromSchema<typeof riskSchema>;
export const RiskModel = model('Risk', riskSchema);
