import { z } from 'zod';

export const EVENT_TYPES = ['wedding', 'corporate', 'conference', 'social', 'other'] as const;
export const eventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof eventTypeSchema>;

export const EVENT_STATUSES = ['planning', 'confirmed', 'completed', 'cancelled'] as const;
export const eventStatusSchema = z.enum(EVENT_STATUSES);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const SUB_EVENT_STATUSES = ['planned', 'confirmed', 'cancelled'] as const;
export const subEventStatusSchema = z.enum(SUB_EVENT_STATUSES);
export type SubEventStatus = z.infer<typeof subEventStatusSchema>;

// Shared by tasks and vendors so rules can match "no confirmed vendor for this task's category"
export const CATEGORIES = [
  'venue',
  'catering',
  'decor',
  'photography',
  'entertainment',
  'accommodation',
  'transportation',
  'invitations',
  'branding',
  'activities',
  'audio_visual',
  'logistics',
  'other',
] as const;
export const categorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof categorySchema>;

// One scale reused for task priority and risk severity
export const LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export const levelSchema = z.enum(LEVELS);
export type Level = z.infer<typeof levelSchema>;

export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'] as const;
export const taskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const VENDOR_STATUSES = [
  'shortlisted',
  'contacted',
  'confirmed',
  'unavailable',
  'cancelled',
] as const;
export const vendorStatusSchema = z.enum(VENDOR_STATUSES);
export type VendorStatus = z.infer<typeof vendorStatusSchema>;

export const GUEST_NEEDS = [
  'accommodation',
  'airport_transfer',
  'local_transport',
  'dietary',
  'accessibility',
] as const;
export const guestNeedSchema = z.enum(GUEST_NEEDS);
export type GuestNeed = z.infer<typeof guestNeedSchema>;

export const RISK_TYPES = [
  'capacity_mismatch',
  'missing_vendor',
  'vendor_unavailable',
  'deadline_risk',
  'dependency_blocked',
  'schedule_conflict',
  'budget_risk',
  'other',
] as const;
export const riskTypeSchema = z.enum(RISK_TYPES);
export type RiskType = z.infer<typeof riskTypeSchema>;

export const RISK_SOURCES = ['rule', 'ai'] as const;
export type RiskSource = (typeof RISK_SOURCES)[number];

export const RISK_STATUSES = ['open', 'resolved', 'dismissed'] as const;
export const riskStatusSchema = z.enum(RISK_STATUSES);
export type RiskStatus = z.infer<typeof riskStatusSchema>;

export const ENTITY_TYPES = [
  'event',
  'sub_event',
  'task',
  'vendor',
  'guest_segment',
  'risk',
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const ACTORS = ['user', 'ai', 'system'] as const;
export type Actor = (typeof ACTORS)[number];

export const ACTIVITY_ACTIONS = ['created', 'updated', 'cancelled', 'resolved'] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const MESSAGE_ROLES = ['user', 'assistant'] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];
